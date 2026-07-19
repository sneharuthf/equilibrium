const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    severity: { type: String, enum: ["high", "critical"], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["open", "acknowledged", "resolved"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyAlert", emergencyAlertSchema);
