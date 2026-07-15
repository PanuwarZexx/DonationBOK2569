const Donation = require('../models/Donation');
const Setting = require('../models/Setting');
const DonorProfile = require('../models/DonorProfile');
const moment = require('moment-timezone');

const tz = 'Asia/Bangkok';

// @desc    สรุปข้อมูล Dashboard
// @route   GET /api/dashboard/summary
exports.getSummary = async (req, res) => {
  try {
    const today = moment().tz(tz).startOf('day').toDate();
    const monthStart = moment().tz(tz).startOf('month').toDate();
    const yearStart = moment().tz(tz).startOf('year').toDate();
    const matchVerified = { status: { $in: ['verified', 'cash'] } };

    const [totalAgg, todayAgg, monthAgg, yearAgg, settings] = await Promise.all([
      Donation.aggregate([{ $match: matchVerified }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Donation.aggregate([{ $match: { ...matchVerified, createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Donation.aggregate([{ $match: { ...matchVerified, createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Donation.aggregate([{ $match: { ...matchVerified, createdAt: { $gte: yearStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Setting.findOne()
    ]);

    const totalAmount = totalAgg[0]?.total || 0;
    const goalAmount = settings?.goalAmount || 500000;

    res.json({
      success: true,
      data: {
        totalAmount,
        totalDonors: totalAgg[0]?.count || 0,
        todayAmount: todayAgg[0]?.total || 0,
        todayDonors: todayAgg[0]?.count || 0,
        monthAmount: monthAgg[0]?.total || 0,
        yearAmount: yearAgg[0]?.total || 0,
        goalAmount,
        goalProgress: goalAmount > 0 ? Math.min((totalAmount / goalAmount) * 100, 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ข้อมูลกราฟ
// @route   GET /api/dashboard/chart
exports.getChartData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = moment().tz(tz).subtract(days, 'days').startOf('day').toDate();
    const dailyData = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] }, createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tz } },
        total: { $sum: '$amount' }, count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    const channelData = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] } } },
      { $group: { _id: '$channel', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { daily: dailyData, channels: channelData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Top 10 ผู้บริจาค
// @route   GET /api/dashboard/top10
exports.getTop10 = async (req, res) => {
  try {
    const top10 = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] } } },
      { $group: { _id: '$donorName', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);
    
    // ค้นหารูปภาพโปรไฟล์ผู้บริจาค (DonorProfile) เพื่อผูกรูปถ่ายเข้ากับอันดับ
    const donorNames = top10.map(d => d._id);
    const profiles = await DonorProfile.find({ donorName: { $in: donorNames } });
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.donorName] = p.photoUrl;
    });

    const dataWithPhotos = top10.map(d => ({
      ...d,
      photoUrl: profileMap[d._id] || null
    }));

    res.json({ success: true, data: dataWithPhotos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Progress
// @route   GET /api/dashboard/progress
exports.getProgress = async (req, res) => {
  try {
    const [stats, settings] = await Promise.all([
      Donation.aggregate([
        { $match: { status: { $in: ['verified', 'cash'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Setting.findOne()
    ]);
    const current = stats[0]?.total || 0;
    const goal = settings?.goalAmount || 500000;
    res.json({ success: true, data: { current, goal, percentage: goal > 0 ? Math.min((current / goal) * 100, 100).toFixed(1) : 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
