import { Router } from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Story from "../models/Story.js";
import Reel from "../models/Reel.js";
import Message from "../models/Message.js";
import { auth, admin as adminOnly } from "../middleware/auth.js";
const router = Router();
router.use(auth, adminOnly);

router.get("/stats", async (_, res) => {
  const [users, posts, hiddenPosts, reports, stories, reels, messages] =
    await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "hidden" }),
      Post.countDocuments({ "reports.0": { $exists: true } }),
      Story.countDocuments(),
      Reel.countDocuments(),
      Message.countDocuments(),
    ]);
  res.json({ users, posts, hiddenPosts, reports, stories, reels, messages });
});
router.get("/reports", async (_, res) => {
  const posts = await Post.find({ "reports.0": { $exists: true } })
    .populate("author", "name email")
    .sort("-updatedAt");
  res.json(posts);
});
router.get("/users", async (_, res) => {
  const users = await User.find()
    .select("-password")
    .sort("-createdAt")
    .limit(100);
  res.json({ users });
});
router.patch("/posts/:id/status", async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status || "hidden" },
    { new: true },
  );
  res.json(post);
});
router.patch("/users/:id/block", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: req.body.isBlocked },
    { new: true },
  ).select("-password");
  res.json(user);
});
router.patch("/reels/:id/status", async (req, res) => {
  const reel = await Reel.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status || "hidden" },
    { new: true },
  );
  res.json(reel);
});
export default router;
