import mongoose from 'mongoose';

const inspirationProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  handle: { type: String, required: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
  order: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.model('InspirationProfile', inspirationProfileSchema);
