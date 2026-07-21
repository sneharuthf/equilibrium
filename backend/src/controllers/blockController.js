const Block = require("../models/Block");
const User = require("../models/User");

exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't block yourself" });
    }
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: "User not found" });

    await Block.findOneAndUpdate(
      { blocker: req.user._id, blocked: userId },
      { blocker: req.user._id, blocked: userId },
      { upsert: true }
    );
    res.json({ message: "User blocked" });
  } catch (err) {
    next(err);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    await Block.deleteOne({ blocker: req.user._id, blocked: req.params.userId });
    res.json({ message: "User unblocked" });
  } catch (err) {
    next(err);
  }
};

exports.listBlocked = async (req, res, next) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id }).populate("blocked", "anonymousUsername");
    res.json({ blocked: blocks.map((b) => b.blocked) });
  } catch (err) {
    next(err);
  }
};

exports.isBlockedEitherWay = async (userA, userB) => {
  const block = await Block.findOne({
    $or: [
      { blocker: userA, blocked: userB },
      { blocker: userB, blocked: userA },
    ],
  });
  return !!block;
};