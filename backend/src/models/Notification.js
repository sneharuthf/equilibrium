const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["mentor_reply", "mood_reminder", "journal_reminder", "hydration_reminder", "weekly_report", "system", "new_message", "post_like"],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedConversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
