import multer from "multer";
import path from "path";
import fs from "fs";

const dir = "uploads";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    ),
});

const allowed = ["image/", "video/", "audio/", "application/pdf"];
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 5 },
  fileFilter: (_, file, cb) =>
    allowed.some((t) => file.mimetype.startsWith(t))
      ? cb(null, true)
      : cb(new Error("Unsupported file type")),
});
