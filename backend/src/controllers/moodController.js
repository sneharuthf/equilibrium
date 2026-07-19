const MoodLog = require("../models/MoodLog");

exports.upsertToday = async (req, res, next) => {
  try {
    const { mood, stressLevel, sleepHours, energy, waterIntakeMl, exerciseMinutes, medicationTaken, note } = req.body;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const log = await MoodLog.findOneAndUpdate(
      { user: req.user._id, date: startOfDay },
      { mood, stressLevel, sleepHours, energy, waterIntakeMl, exerciseMinutes, medicationTaken, note, date: startOfDay },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ log });
  } catch (err) {
    next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const logs = await MoodLog.find({ user: req.user._id, date: { $gte: since } }).sort({ date: 1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};
