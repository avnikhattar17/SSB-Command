import express from 'express';
import { GridFSBucket } from 'mongodb';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import Resource from './models/Resource.js';
import OfficialSite from './models/OfficialSite.js';
import InspirationProfile from './models/InspirationProfile.js';

const app = express();
const configuredClientOrigins = new Set(
  (process.env.CLIENT_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean)
);
const isLocalWebOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const noteFiles = new Map([
  ['ssb-complete-guide_compressed.pdf', 'ssb-complete-guide'],
  ['current-affairs_compressed.pdf', 'current-affairs'],
  ['my-personal-prep_compressed.pdf', 'my-personal-prep'],
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (configuredClientOrigins.has(origin) || isLocalWebOrigin(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length, Content-Range, Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'The SSB COMMAND API is ready.' }));

app.get('/api/notes/:file', async (req, res, next) => {
  const noteId = noteFiles.get(req.params.file);
  if (!noteId) return res.status(404).json({ success: false, message: 'The requested PDF was not found.' });
  if (!Resource.db.db) return res.status(503).json({ success: false, message: 'The document service is not connected to MongoDB.' });

  try {
    const bucket = new GridFSBucket(Resource.db.db);
    const file = await bucket.find({ 'metadata.noteId': noteId }).sort({ uploadDate: -1 }).next();
    if (!file) return res.status(404).json({ success: false, message: 'The requested PDF was not found in MongoDB.' });

    let range;
    const requestedRange = req.headers.range;
    if (requestedRange) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(requestedRange);
      if (!match || (!match[1] && !match[2])) {
        res.setHeader('Content-Range', `bytes */${file.length}`);
        return res.sendStatus(416);
      }
      const start = match[1] ? Number(match[1]) : Math.max(0, file.length - Number(match[2]));
      const end = match[2] && match[1] ? Math.min(Number(match[2]), file.length - 1) : file.length - 1;
      if (start >= file.length || end < start) {
        res.setHeader('Content-Range', `bytes */${file.length}`);
        return res.sendStatus(416);
      }
      range = { start, end };
    }

    const start = range?.start ?? 0;
    const end = range?.end ?? file.length - 1;
    res.status(range ? 206 : 200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${req.params.file}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', end - start + 1);
    if (range) res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);

    const download = bucket.openDownloadStream(file._id, range ? { start, end: end + 1 } : {});
    download.on('error', (error) => {
      if (res.headersSent) res.destroy(error);
      else next(error);
    });
    download.pipe(res);
  } catch (error) {
    next(error);
  }
});

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
};
const signToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `${header}.${body}`;
  const signature = createHmac('sha256', process.env.JWT_SECRET).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};
const isAdmin = (req) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = createHmac('sha256', process.env.JWT_SECRET).update(unsigned).digest();
  let actual;
  try { actual = Buffer.from(parts[2], 'base64url'); } catch { return false; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.sub === process.env.ADMIN_EMAIL && Number(payload.exp) > Date.now();
  } catch { return false; }
};

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Admin login is not configured on the backend.' });
  }
  if (!safeEqual(email || '', process.env.ADMIN_EMAIL) || !safeEqual(password || '', process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
  }
  const token = signToken({ sub: process.env.ADMIN_EMAIL, exp: Date.now() + 8 * 60 * 60 * 1000 });
  res.json({ success: true, token });
});

app.get('/api/resources', async (_req, res, next) => {
  try {
    const items = await Resource.find().sort({ order: 1 }).lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, resources: items.map(({ _id, __v, order, ...item }) => item) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/official-sites', async (_req, res, next) => {
  try {
    const sites = await OfficialSite.find().sort({ order: 1 }).lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, sites: sites.map(({ _id, __v, order, ...site }) => site) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/inspiration-profiles', async (_req, res, next) => {
  try {
    const profiles = await InspirationProfile.find().sort({ order: 1 }).lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, profiles: profiles.map(({ _id, __v, order, ...profile }) => profile) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/resources', async (req, res, next) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Sign in as the administrator to add resources.' });
  try {
    const { type, section, title, author = '', description = '', url, embedUrl = '', tags = [] } = req.body || {};
    const types = ['book', 'youtube-video', 'instagram'];
    const sections = ['oir-ppdt', 'psych-tests', 'gto-obstacles', 'gd-lecturette', 'individual-obstacle', 'gpe', 'interview', 'current-affairs', 'written-exam'];
    const sectionsList = Array.isArray(section) ? section : [section];
    const validUrl = (value) => {
      try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
    };
    if (!types.includes(type) || !title?.trim() || !validUrl(url) ||
        !sectionsList.length || sectionsList.some((value) => !sections.includes(value)) ||
        (embedUrl && !validUrl(embedUrl)) || !Array.isArray(tags)) {
      return res.status(400).json({ success: false, message: 'Enter a title, valid link, type, and collection.' });
    }
    const order = (await Resource.findOne().sort({ order: -1 }).select('order').lean())?.order + 1 || 1;
    const saved = await Resource.create({
      id: randomUUID(), type, section: sectionsList, title: title.trim(), author: String(author).trim(),
      description: String(description).trim(), url: url.trim(), embedUrl: String(embedUrl).trim(),
      tags: tags.map((tag) => String(tag).trim()).filter(Boolean), order,
    });
    const { _id, __v, order: _order, ...resource } = saved.toObject();
    res.status(201).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'This website runs from its frontend.' }));

app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message);
  res.status(500).json({ success: false, message: 'The resource service could not complete the request.' });
});

export default app;
