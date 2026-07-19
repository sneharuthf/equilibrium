const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: [
        "Stress", "Anxiety", "Depression", "Relationships", "Family",
        "Career", "Loneliness", "Overthinking", "Self-esteem",
        "Academic pressure", "Burnout", "Other",
      ],
      default: "Other",
    },
    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, default: null },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model("Post", postSchema);
