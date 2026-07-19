const User = require("../models/User");
const Assignment = require("../models/Assignment");
const AIAnalysis = require("../models/AIAnalysis");
const EmergencyAlert = require("../models/EmergencyAlert");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.myAssignedUsers = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ mentor: req.user._id, status: "active" }).populate(
      "user",
      "anonymousUsername mentalHealthScore isFlaggedUrgent lastCheckIn"
    );
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
};

exports.userInsights = async (req, res, next) => {
  try {
    const analyses = await AIAnalysis.find({ user: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ analyses });
  } catch (err) {
    next(err);
  }
};

exports.alerts = async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({ mentor: req.user._id, status: { $ne: "resolved" } })
      .sort({ createdAt: -1 })
      .populate("user", "anonymousUsername");
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

exports.updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // acknowledged | resolved
    const alert = await EmergencyAlert.findOneAndUpdate(
      { _id: req.params.id, mentor: req.user._id },
      { status },
      { new: true }
    );
    res.json({ alert });
  } catch (err) {
    next(err);
  }
};

exports.startConversation = async (req, res, next) => {
  try {
    const { mentorId } = req.body; // called by a regular user
    const mentor = await User.findOne({ _id: mentorId, role: "mentor" });
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    let convo = await Conversation.findOne({ user: req.user._id, mentor: mentorId });
    if (!convo) convo = await Conversation.create({ user: req.user._id, mentor: mentorId });

    res.json({ conversation: convo });
  } catch (err) {
    next(err);
  }
};

exports.listConversations = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "mentor" ? { mentor: req.user._id } : { user: req.user._id };
    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .populate("user", "anonymousUsername")
      .populate("mentor", "anonymousUsername");
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;
    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      content,
      fileUrl: fileUrl || null,
    });
    await Conversation.findByIdAndUpdate(req.params.conversationId, { lastMessageAt: new Date() });

    // Real-time delivery is also pushed via Socket.IO — see sockets/chat.js
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
