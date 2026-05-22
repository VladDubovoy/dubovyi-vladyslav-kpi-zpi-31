import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      url: String,
      type: { type: String, enum: ["image", "video"], default: "image" },
      originalName: String,
      size: Number,
    },
    caption: { type: String, maxlength: 300, default: "" },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
  },
  { timestamps: true },
);

export default mongoose.model("Story", storySchema);
