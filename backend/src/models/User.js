const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, default: null },
    anonymousUsername: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ["user", "mentor", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFlaggedUrgent: { type: Boolean, default: false },

    mentorProfile: {
      bio: { type: String, default: "" },
      specialties: [{ type: String }],
      maxCaseload: { type: Number, default: 20 },
    },

    mentalHealthScore: { type: Number, default: 70, min: 0, max: 100 },
    streakDays: { type: Number, default: 0 },
    lastCheckIn: { type: Date, default: null },
    assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    emailVerifyToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerifyToken;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
