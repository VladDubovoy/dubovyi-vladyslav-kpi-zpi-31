import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res
      .status(400)
      .json({ message: "Name, valid email and password 6+ chars required" });
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const count = await User.countDocuments();
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: count === 0 ? "admin" : "user",
  });
  res.status(201).json({ user: user.safe(), token: signToken(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ user: user.safe(), token: signToken(user) });
});

router.get("/me", auth, (req, res) => res.json(req.user.safe()));
export default router;
