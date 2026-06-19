import { Router } from "express";
import Story from "../models/Story.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
const router = Router();
const mediaType = (m) => (m.startsWith("video/") ? "video" : "image");

router.get("/", async (req, res) => {
  const { page = 1 } = req.query;
  const filter = { status: "active", expiresAt: { $gt: new Date() } };
  const limit = 12;
  const currentPage = Math.max(1, Number(page) || 1);
  const stories = await Story.find(filter)
    .populate("author", "name avatar role")
    .populate("viewers", "name avatar")
    .sort("-createdAt")
    .skip((currentPage - 1) * limit)
    .limit(limit);
  const total = await Story.countDocuments(filter);
  res.json({
    stories,
    total,
    page: currentPage,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});
router.post("/", auth, upload.single("media"), async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ message: "Додайте фото або відео для story" });
  const story = await Story.create({
    author: req.user._id,
    caption: req.body.caption || "",
    media: {
      url: `/uploads/${req.file.filename}`,
      type: mediaType(req.file.mimetype),
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
  await story.populate("author", "name avatar role");
  res.status(201).json(story);
});
router.post("/:id/view", auth, async (req, res) => {
  const s = await Story.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Story не знайдено" });
  if (!s.viewers.some((id) => id.equals(req.user._id)))
    s.viewers.push(req.user._id);
  await s.save();
  res.json({ views: s.viewers.length });
});
router.delete("/:id", auth, async (req, res) => {
  const s = await Story.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Story не знайдено" });
  if (!s.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  await s.deleteOne();
  res.json({ ok: true });
});
export default router;
