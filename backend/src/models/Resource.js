const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["article", "video", "meditation", "yoga", "breathing", "sleep", "stress", "professional"],
      required: true,
    },
    category: { type: String, default: "General" },
    url: { type: String, default: null },
    body: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
