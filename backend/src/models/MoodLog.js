const mongoose = require("mongoose");

const moodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    mood: { type: Number, min: 1, max: 5, required: true },
    stressLevel: { type: Number, min: 1, max: 5, default: 3 },
    sleepHours: { type: Number, min: 0, max: 24, default: null },
    energy: { type: Number, min: 1, max: 5, default: null },
    waterIntakeMl: { type: Number, default: null },
    exerciseMinutes: { type: Number, default: null },
    medicationTaken: { type: Boolean, default: null },
    note: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

moodLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("MoodLog", moodLogSchema);
