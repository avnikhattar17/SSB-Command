import dns from 'node:dns';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import 'dotenv/config';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const notes = [
  { id: 'ssb-complete-guide', title: 'SSB Complete Guide', filename: 'ssb-complete-guide_compressed.pdf' },
  { id: 'current-affairs', title: 'Current Affairs', filename: 'current-affairs_compressed.pdf' },
  { id: 'my-personal-prep', title: 'My Personal Prep', filename: 'my-personal-prep_compressed.pdf' },
];

async function uploadNote(bucket, note) {
  const filePath = path.join(projectRoot, 'frontend', 'public', 'notes', note.filename);
  const contents = await readFile(filePath);
  if (!contents.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error(`${note.filename} is not a valid PDF file.`);
  }
  const sha256 = createHash('sha256').update(contents).digest('hex');
  const existing = await bucket.find({ 'metadata.noteId': note.id }).sort({ uploadDate: -1 }).next();

  if (existing) {
    if (existing.length !== contents.length || existing.metadata?.sha256 !== sha256) {
      throw new Error(`An Atlas PDF with id "${note.id}" already exists but differs from the local file; refusing to overwrite it.`);
    }
    console.log(`${note.title}: already present in Atlas (${contents.length} bytes).`);
    return;
  }

  const upload = bucket.openUploadStream(note.filename, {
    contentType: 'application/pdf',
    metadata: { noteId: note.id, title: note.title, sha256 },
  });
  await pipeline(Readable.from([contents]), upload);

  const saved = await bucket.find({ _id: upload.id }).next();
  if (!saved || saved.length !== contents.length || saved.metadata?.sha256 !== sha256) {
    throw new Error(`Atlas verification failed for ${note.title}.`);
  }
  console.log(`${note.title}: uploaded and verified (${contents.length} bytes).`);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const bucket = new GridFSBucket(mongoose.connection.db);
    for (const note of notes) await uploadNote(bucket, note);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Could not upload notes to MongoDB Atlas:', error.message);
  process.exitCode = 1;
});
