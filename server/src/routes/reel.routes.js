import { Router } from 'express';
import Reel from '../models/Reel.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
const router = Router();

router.get('/', async (req,res)=>{
  const { q='' } = req.query;
  const filter = { status:'active' };
  if(q) filter.$or = [{title:new RegExp(q,'i')},{description:new RegExp(q,'i')},{tags:q.toLowerCase()}];
  const reels = await Reel.find(filter).populate('author','name avatar role').populate('comments.author','name avatar').sort('-createdAt').limit(30);
  res.json({ reels });
});
router.post('/', auth, upload.single('video'), async(req,res)=>{
  if(!req.file || !req.file.mimetype.startsWith('video/')) return res.status(400).json({message:'Для Reels потрібне відео'});
  const reel = await Reel.create({ author:req.user._id, title:req.body.title, description:req.body.description || '', tags:(req.body.tags||'').split(',').map(t=>t.trim()).filter(Boolean), video:{ url:`/uploads/${req.file.filename}`, originalName:req.file.originalname, size:req.file.size }});
  await reel.populate('author','name avatar role');
  res.status(201).json(reel);
});
router.post('/:id/like', auth, async(req,res)=>{
  const r = await Reel.findById(req.params.id); if(!r) return res.status(404).json({message:'Reel не знайдено'});
  const liked = r.likes.some(id=>id.equals(req.user._id)); r.likes = liked ? r.likes.filter(id=>!id.equals(req.user._id)) : [...r.likes, req.user._id];
  await r.save(); res.json({likes:r.likes.length, liked:!liked});
});
router.post('/:id/comments', auth, async(req,res)=>{
  const r = await Reel.findById(req.params.id); if(!r) return res.status(404).json({message:'Reel не знайдено'});
  r.comments.push({author:req.user._id,text:req.body.text}); await r.save(); await r.populate('comments.author','name avatar'); res.status(201).json(r.comments.at(-1));
});
export default router;
