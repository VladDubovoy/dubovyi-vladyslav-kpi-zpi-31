import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ['image', 'video', 'audio', 'file'], default: 'file' },
  originalName: String,
  size: Number
}, { _id: false });

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1500 },
  tags: [{ type: String, lowercase: true, trim: true }],
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  media: [mediaSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  reports: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String }],
  status: { type: String, enum: ['active', 'hidden'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
