import { Router } from "express";
import Post from "../models/Post.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
const getType = (mimetype) =>
  mimetype.startsWith("image/")
    ? "image"
    : mimetype.startsWith("video/")
      ? "video"
      : mimetype.startsWith("audio/")
        ? "audio"
        : "file";

router.get("/", async (req, res) => {
  const { q = "", tag = "", page = 1 } = req.query;
  const filter = { status: "active", visibility: "public" };
  if (q)
    filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ];
  if (tag) filter.tags = tag.toLowerCase();
  const limit = 12;
  const posts = await Post.find(filter)
    .populate("author", "name avatar role")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Post.countDocuments(filter);
  res.json({
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

router.post("/", auth, upload.array("media", 5), async (req, res) => {
  const {
    title,
    description = "",
    tags = "",
    visibility = "public",
  } = req.body;
  const media = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    type: getType(f.mimetype),
    originalName: f.originalname,
    size: f.size,
  }));
  const post = await Post.create({
    author: req.user._id,
    title,
    description,
    visibility,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    media,
  });
  await post.populate("author", "name avatar role");
  res.status(201).json(post);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name avatar role")
    .populate("comments.author", "name avatar");
  if (!post || post.status !== "active")
    return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.patch("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (!post.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  ["title", "description", "visibility"].forEach(
    (k) => req.body[k] !== undefined && (post[k] = req.body[k]),
  );
  if (req.body.tags)
    post.tags = req.body.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  await post.save();
  res.json(post);
});

router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (!post.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  await post.deleteOne();
  res.json({ ok: true });
});

router.post("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const liked = post.likes.some((id) => id.equals(req.user._id));
  post.likes = liked
    ? post.likes.filter((id) => !id.equals(req.user._id))
    : [...post.likes, req.user._id];
  await post.save();
  res.json({ likes: post.likes.length, liked: !liked });
});

router.post("/:id/comments", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.comments.push({ author: req.user._id, text: req.body.text });
  await post.save();
  await post.populate("comments.author", "name avatar");
  res.status(201).json(post.comments.at(-1));
});

router.post("/:id/report", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.reports.push({
    user: req.user._id,
    reason: req.body.reason || "Без пояснення",
  });
  await post.save();
  res.json({ ok: true });
});

export default router;
