const Resource = require("../models/Resource");

exports.list = async (req, res, next) => {
  try {
    const { type, category, q } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json({ resources });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ resource });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
