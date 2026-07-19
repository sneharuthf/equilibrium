const User = require("../models/User");
const EmergencyAlert = require("../models/EmergencyAlert");
const Notification = require("../models/Notification");

exports.triggerSOS = async (req, res, next) => {
  try {
    const { note } = req.body;
    const user = await User.findById(req.user._id);

    user.isFlaggedUrgent = true;
    await user.save();

    const alert = await EmergencyAlert.create({
      user: user._id,
      mentor: user.assignedMentor,
      severity: "critical",
      reason: note && note.trim() ? `SOS pressed by user: "${note.trim()}"` : "SOS button pressed by user",
    });

    if (user.assignedMentor) {
      await Notification.create({
        user: user.assignedMentor,
        type: "system",
        message: "URGENT: your assigned user just pressed the SOS button and needs immediate attention.",
      });
    } else {
      const mentors = await User.find({ role: "mentor", isActive: true }).select("_id");
      await Notification.insertMany(
        mentors.map((m) => ({
          user: m._id,
          type: "system",
          message: "URGENT: an unassigned user just pressed the SOS button and needs immediate attention.",
        }))
      );
    }

    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
};