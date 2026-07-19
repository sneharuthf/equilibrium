const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emotion: { type: String, required: true },
    confidence: { type: Number, required: true },
    moodScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["none", "low", "medium", "high", "critical"], required: true },
    indicators: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

aiAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema);
