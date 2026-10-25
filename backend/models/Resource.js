import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  type: { type: String, required: true, trim: true },
  section: { type: [String], required: true, default: [] },
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  url: { type: String, required: true, trim: true },
  embedUrl: { type: String, default: '', trim: true },
  tags: { type: [String], default: [] },
  order: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
