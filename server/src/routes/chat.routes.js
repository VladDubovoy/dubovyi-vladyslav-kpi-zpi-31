import { Router } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/users', auth, async(req,res)=>{
  const users = await User.find({ _id:{ $ne:req.user._id }, isBlocked:{ $ne:true } }).select('name email avatar role').limit(50);
  res.json({ users });
});
router.get('/messages/:userId', auth, async(req,res)=>{
  const other = req.params.userId;
  const messages = await Message.find({ $or:[{sender:req.user._id,receiver:other},{sender:other,receiver:req.user._id}] }).populate('sender receiver','name avatar').sort('createdAt').limit(100);
  res.json({ messages });
});
router.post('/messages/:userId', auth, async(req,res)=>{
  const msg = await Message.create({ sender:req.user._id, receiver:req.params.userId, text:req.body.text });
  await msg.populate('sender receiver','name avatar');
  req.app.get('io')?.to(String(req.params.userId)).emit('new-message', msg);
  req.app.get('io')?.to(String(req.user._id)).emit('new-message', msg);
  res.status(201).json(msg);
});
export default router;
