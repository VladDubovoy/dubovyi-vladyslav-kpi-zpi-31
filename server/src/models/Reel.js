import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  video: { url: String, type: { type: String, default: 'video' }, originalName: String, size: Number },
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 800, default: '' },
  tags: [{ type: String, lowercase: true, trim: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
  status: { type: String, enum: ['active','hidden'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Reel', reelSchema);
