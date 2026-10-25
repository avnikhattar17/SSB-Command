import express from 'express';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import Resource from './models/Resource.js';
import OfficialSite from './models/OfficialSite.js';
import InspirationProfile from './models/InspirationProfile.js';

const app = express();
const configuredClientOrigin = process.env.CLIENT_ORIGIN;
const isLocalWebOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === configuredClientOrigin || isLocalWebOrigin(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'The SSB COMMAND API is ready.' }));

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
