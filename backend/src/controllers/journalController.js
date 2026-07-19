const Journal = require("../models/Journal");

exports.create = async (req, res, next) => {
  try {
    const { title, content, imageUrls, voiceNoteUrl, emotionTags } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Journal content is required" });

    const entry = await Journal.create({
      user: req.user._id,
      title,
      content,
      imageUrls: imageUrls || [],
      voiceNoteUrl: voiceNoteUrl || null,
      emotionTags: emotionTags || [],
    });
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { user: req.user._id };
    if (q) filter.content = { $regex: q, $options: "i" };

    const entries = await Journal.find(filter).sort({ createdAt: -1 });
    res.json({ entries });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Journal.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
