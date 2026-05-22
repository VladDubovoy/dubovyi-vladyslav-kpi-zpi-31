import { Router } from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  const posts = await Post.find({
    author: user._id,
    status: "active",
    visibility: "public",
  }).sort("-createdAt");
  res.json({ user, posts });
});

router.patch("/me", auth, async (req, res) => {
  const { name, bio, avatar } = req.body;
  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  res.json(req.user.safe());
});

router.post("/:id/follow", auth, async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found" });
  const following = req.user.following.some((id) => id.equals(target._id));
  req.user.following = following
    ? req.user.following.filter((id) => !id.equals(target._id))
    : [...req.user.following, target._id];
  target.followers = following
    ? target.followers.filter((id) => !id.equals(req.user._id))
    : [...target.followers, req.user._id];
  await req.user.save();
  await target.save();
  res.json({ following: !following, followers: target.followers.length });
});

export default router;
