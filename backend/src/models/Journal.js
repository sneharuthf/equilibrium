const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true },
    imageUrls: [{ type: String }],
    voiceNoteUrl: { type: String, default: null },
    emotionTags: [{ type: String }],
  },
  { timestamps: true }
);

journalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Journal", journalSchema);
