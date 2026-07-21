const User = require("../models/User");
const Post = require("../models/Post");
const Report = require("../models/Report");
const AIAnalysis = require("../models/AIAnalysis");
const Assignment = require("../models/Assignment");

exports.overview = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalUsers, dailyActiveUsers, postsToday, highRiskUsers, pendingReports, mentors] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", lastCheckIn: { $gte: startOfDay } }),
      Post.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ role: "user", isFlaggedUrgent: true }),
      Report.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "mentor" }),
    ]);

    const avgMoodAgg = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: null, avg: { $avg: "$mentalHealthScore" } } },
    ]);

    res.json({
      totalUsers,
      dailyActiveUsers,
      postsToday,
      highRiskUsers,
      pendingReports,
      mentorCount: mentors,
      averageMoodScore: avgMoodAgg[0]?.avg ? Math.round(avgMoodAgg[0].avg) : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.emotionDistribution = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const distribution = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$emotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ distribution });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.setUserActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.assignMentor = async (req, res, next) => {
  try {
    const { userId, mentorId } = req.body;
    await Assignment.updateMany({ user: userId, status: "active" }, { status: "completed" });
    const assignment = await Assignment.create({ user: userId, mentor: mentorId });
    await User.findByIdAndUpdate(userId, { assignedMentor: mentorId });
    res.status(201).json({ assignment });
  } catch (err) {
    next(err);
  }
};

exports.listReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("reporter", "anonymousUsername");
    res.json({ reports });
  } catch (err) {
    next(err);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { status, removeContent } = req.body; // reviewed | dismissed
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (removeContent && report) {
      if (report.targetType === "post") {
        await Post.findByIdAndUpdate(report.targetId, { isRemoved: true });
      } else if (report.targetType === "comment") {
        const Comment = require("../models/Comment");
        await Comment.findByIdAndUpdate(report.targetId, { isRemoved: true });
      } else if (report.targetType === "user") {
        await User.findByIdAndUpdate(report.targetId, { isActive: false });
      }
    }
    res.json({ report });
  } catch (err) {
    next(err);
  }
};

const Therapist = require("../models/Therapist");

exports.listTherapists = async (req, res, next) => {
  try {
    const therapists = await Therapist.find({ isActive: true }).sort({ name: 1 });
    res.json({ therapists });
  } catch (err) {
    next(err);
  }
};

exports.createTherapist = async (req, res, next) => {
  try {
    const therapist = await Therapist.create(req.body);
    res.status(201).json({ therapist });
  } catch (err) {
    next(err);
  }
};

exports.updateTherapist = async (req, res, next) => {
  try {
    const therapist = await Therapist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ therapist });
  } catch (err) {
    next(err);
  }
};

exports.deleteTherapist = async (req, res, next) => {
  try {
    await Therapist.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Removed from active directory" });
  } catch (err) {
    next(err);
  }
};

exports.recommendTherapist = async (req, res, next) => {
  try {
    const { userId, therapistId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { recommendedTherapist: therapistId }, { new: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};