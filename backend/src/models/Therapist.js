const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    clinicName: { type: String, default: "" },
    specialization: [{ type: String }],
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Therapist", therapistSchema);