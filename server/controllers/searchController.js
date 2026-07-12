const Donation = require('../models/Donation');

// @desc    ค้นหารายการบริจาค
// @route   GET /api/search
exports.search = async (req, res) => {
  try {
    const { q, minAmount, maxAmount, startDate, endDate, village, subDistrict, category, status, channel } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};

    if (q) filter.donorName = { $regex: q, $options: 'i' };
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }
    if (village) filter.village = { $regex: village, $options: 'i' };
    if (subDistrict) filter.subDistrict = { $regex: subDistrict, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (channel) filter.channel = channel;

    const [donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Donation.countDocuments(filter)
    ]);

    res.json({
      success: true, data: donations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
