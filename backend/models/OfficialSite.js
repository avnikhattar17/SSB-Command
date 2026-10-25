import mongoose from 'mongoose';

const officialSiteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  order: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('OfficialSite', officialSiteSchema);
