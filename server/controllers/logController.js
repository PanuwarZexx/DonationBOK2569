const Log = require('../models/Log');

exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = {};
    if (req.query.username) filter.username = { $regex: req.query.username, $options: 'i' };
    if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate + 'T23:59:59');
    }
    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Log.countDocuments(filter)
    ]);
    res.json({ success: true, data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await Log.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ success: true, message: `ลบ Log เก่ากว่า ${days} วัน จำนวน ${result.deletedCount} รายการ` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
