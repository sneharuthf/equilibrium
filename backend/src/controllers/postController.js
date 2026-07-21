const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const AIAnalysis = require("../models/AIAnalysis");
const EmergencyAlert = require("../models/EmergencyAlert");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { analyzeText } = require("../utils/aiClient");
const { containsProfanity, cleanText } = require("../middleware/profanityFilter");

const CRISIS_LEVELS = ["high", "critical"];

exports.createPost = async (req, res, next) => {
  try {
    const { content, category, tags, imageUrl } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Post content is required" });

    const safeContent = containsProfanity(content) ? cleanText(content) : content;

    const post = await Post.create({
      author: req.user._id,
      content: safeContent,
      category,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      imageUrl: imageUrl || null,
    });

    // Pull a small window of recent posts for pattern detection context.
    const recentPosts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("content createdAt");

    const analysis = await analyzeText({
      text: content,
      userId: req.user._id.toString(),
      recentHistory: recentPosts.map((p) => p.content),
    });

    const aiRecord = await AIAnalysis.create({
      post: post._id,
      user: req.user._id,
      emotion: analysis.emotion,
      confidence: analysis.confidence,
      moodScore: analysis.mood_score,
      riskLevel: analysis.risk_level,
      indicators: analysis.indicators || [],
      recommendations: analysis.recommendations || [],
    });

    // Nudge the rolling mental health score toward the new mood signal.
    const user = await User.findById(req.user._id);
    user.mentalHealthScore = Math.round(user.mentalHealthScore * 0.8 + analysis.mood_score * 0.2);

    if (CRISIS_LEVELS.includes(analysis.risk_level)) {
      user.isFlaggedUrgent = true;
      await EmergencyAlert.create({
        user: req.user._id,
        post: post._id,
        mentor: user.assignedMentor,
        severity: analysis.risk_level,
        reason: `AI detected ${analysis.risk_level} risk indicators: ${(analysis.indicators || []).join(", ")}`,
      });

      if (user.assignedMentor) {
        await Notification.create({
          user: user.assignedMentor,
          type: "system",
          message: `Urgent: one of your assigned users may need immediate support.`,
        });
      }
    }
    await user.save();

    res.status(201).json({ post, analysis: aiRecord });
  } catch (err) {
    next(err);
  }
};

exports.listFeed = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { isRemoved: false };
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("author", "anonymousUsername");

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "anonymousUsername");
    if (!post || post.isRemoved) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const existing = await Like.findOne({ post: req.params.id, user: req.user._id });
    if (existing) {
      await existing.deleteOne();
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
      return res.json({ liked: false });
    }
    await Like.create({ post: req.params.id, user: req.user._id });
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } }, { new: true });

    if (post && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        type: "post_like",
        message: `${req.user.anonymousUsername} liked your post.`,
        relatedPost: post._id,
      });
    }

    res.json({ liked: true });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Comment content is required" });

    const safeContent = containsProfanity(content) ? cleanText(content) : content;
    const comment = await Comment.create({ post: req.params.id, author: req.user._id, content: safeContent });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

exports.listComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id, isRemoved: false })
      .sort({ createdAt: 1 })
      .populate("author", "anonymousUsername");
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

exports.reportContent = async (req, res, next) => {
  const Report = require("../models/Report");
  try {
    const { targetType, targetId, reason } = req.body;
    const report = await Report.create({ reporter: req.user._id, targetType, targetId, reason });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};
