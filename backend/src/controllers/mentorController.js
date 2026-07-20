const User = require("../models/User");
const Assignment = require("../models/Assignment");
const AIAnalysis = require("../models/AIAnalysis");
const EmergencyAlert = require("../models/EmergencyAlert");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { containsProfanity, cleanText } = require("../middleware/profanityFilter");

exports.myAssignedUsers = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ mentor: req.user._id, status: "active" }).populate(
      "user",
      "anonymousUsername mentalHealthScore isFlaggedUrgent lastCheckIn emergencyContact"
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
      .populate("user", "anonymousUsername emergencyContact");
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

exports.updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
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
    const { mentorId } = req.body;
    const mentor = await User.findOne({ _id: mentorId, role: "mentor", isActive: true });
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    let convo = await Conversation.findOne({
      type: "mentor",
      participants: { $all: [req.user._id, mentorId] },
    });
    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, mentorId], type: "mentor" });
    }

    res.json({ conversation: convo });
  } catch (err) {
    next(err);
  }
};

exports.startConversationAsMentor = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const target = await User.findOne({ _id: userId, isActive: true });
    if (!target) return res.status(404).json({ message: "User not found" });

    let convo = await Conversation.findOne({
      type: "mentor",
      participants: { $all: [req.user._id, userId] },
    });
    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, userId], type: "mentor" });
    }

    res.json({ conversation: convo });
  } catch (err) {
    next(err);
  }
};

exports.startPeerChat = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ message: "otherUserId is required" });
    if (otherUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't start a chat with yourself" });
    }

    const other = await User.findOne({ _id: otherUserId, isActive: true });
    if (!other) return res.status(404).json({ message: "User not found" });

    let convo = await Conversation.findOne({
      type: "peer",
      participants: { $all: [req.user._id, otherUserId], $size: 2 },
    });
    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, otherUserId], type: "peer" });
    }

    res.json({ conversation: convo });
  } catch (err) {
    next(err);
  }
};

exports.listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "anonymousUsername role");
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

async function assertParticipant(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  const isMember = convo.participants.some((p) => p.toString() === userId.toString());
  return isMember ? convo : false;
}

exports.listMessages = async (req, res, next) => {
  try {
    const access = await assertParticipant(req.params.conversationId, req.user._id);
    if (access === null) return res.status(404).json({ message: "Conversation not found" });
    if (access === false) return res.status(403).json({ message: "You're not part of this conversation" });

    const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const access = await assertParticipant(req.params.conversationId, req.user._id);
    if (access === null) return res.status(404).json({ message: "Conversation not found" });
    if (access === false) return res.status(403).json({ message: "You're not part of this conversation" });

    const { content, fileUrl } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Message content is required" });

    const safeContent = containsProfanity(content) ? cleanText(content) : content;

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      content: safeContent,
      fileUrl: fileUrl || null,
    });
    await Conversation.findByIdAndUpdate(req.params.conversationId, { lastMessageAt: new Date() });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};