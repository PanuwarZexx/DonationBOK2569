const Donation = require('../models/Donation');
const { validationResult } = require('express-validator');

// @desc    รายการบริจาคทั้งหมด (paginated)
// @route   GET /api/donations
exports.getDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.channel) filter.channel = req.query.channel;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate + 'T23:59:59');
    }
    const [donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('verifiedBy', 'fullName'),
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

// @desc    15 รายการล่าสุด (Public)
// @route   GET /api/donations/latest
exports.getLatestDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: { $in: ['verified', 'cash'] } })
      .sort({ createdAt: -1 }).limit(15)
      .select('donorName amount channel status createdAt transactionTime');
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    สถิติ (Public)
// @route   GET /api/donations/stats
exports.getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalDonors: { $sum: 1 } } }
    ]);
    const result = stats[0] || { totalAmount: 0, totalDonors: 0 };
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    รายละเอียดรายการ
// @route   GET /api/donations/:id
exports.getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('verifiedBy', 'fullName');
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    เพิ่มรายการ (เงินสด/เช็ค)
// @route   POST /api/donations
exports.createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const data = { ...req.body };
    if (data.channel === 'cash') data.status = 'cash';
    if (data.channel === 'check') data.status = 'pending_review';
    const donation = await Donation.create(data);
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_donation', {
        _id: donation._id,
        donorName: donation.donorName,
        amount: donation.amount,
        channel: donation.channel,
        status: donation.status,
        createdAt: donation.createdAt
      });
    }
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    แก้ไขรายการ
// @route   PUT /api/donations/:id
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    const io = req.app.get('io');
    if (io) io.emit('donation_updated', donation);
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    อนุมัติรายการ
// @route   PUT /api/donations/:id/verify
exports.verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    donation.status = 'verified';
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    await donation.save();
    const io = req.app.get('io');
    if (io) io.emit('donation_verified', donation);
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ยกเลิกรายการ
// @route   PUT /api/donations/:id/cancel
exports.cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id, { status: 'cancel' }, { new: true }
    );
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    const io = req.app.get('io');
    if (io) io.emit('donation_updated', donation);
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ลบรายการ
// @route   DELETE /api/donations/:id
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    res.json({ success: true, message: 'ลบรายการสำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
