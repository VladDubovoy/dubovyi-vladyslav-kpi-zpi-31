import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.id);
    if (!user || user.isBlocked) return res.status(401).json({ message: 'Access denied' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  next();
}
