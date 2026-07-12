const Certificate = require('../models/Certificate');
const Donation = require('../models/Donation');
const QRCode = require('qrcode');

// @desc    สร้างใบอนุโมทนาบัตร
// @route   POST /api/certificates
exports.createCertificate = async (req, res) => {
  try {
    const { donationId } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'ไม่พบรายการบริจาค' });
    const exists = await Certificate.findOne({ donationId });
    if (exists) return res.status(400).json({ success: false, message: 'ออกใบอนุโมทนาบัตรแล้ว', data: exists });
    const count = await Certificate.countDocuments();
    const certNumber = `BOK2569-${String(count + 1).padStart(5, '0')}`;
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/certificates/verify/${certNumber}`;
    const qrCode = await QRCode.toDataURL(verifyUrl);
    const cert = await Certificate.create({
      donationId, certificateNumber: certNumber, donorName: donation.donorName,
      amount: donation.amount, qrCode, issuedBy: req.user._id, lineUserId: donation.lineUserId
    });
    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    รายการใบอนุโมทนาบัตรทั้งหมด
// @route   GET /api/certificates
exports.getCertificates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [certs, total] = await Promise.all([
      Certificate.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('issuedBy', 'fullName'),
      Certificate.countDocuments()
    ]);
    res.json({ success: true, data: certs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ตรวจสอบใบอนุโมทนาบัตร (Public)
// @route   GET /api/certificates/verify/:number
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.number });
    if (!cert) return res.status(404).json({ success: false, message: 'ไม่พบใบอนุโมทนาบัตร' });
    res.json({ success: true, data: { certificateNumber: cert.certificateNumber, donorName: cert.donorName, amount: cert.amount, issuedAt: cert.createdAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    รายละเอียดใบอนุโมทนาบัตร
// @route   GET /api/certificates/:id
exports.getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('donationId').populate('issuedBy', 'fullName');
    if (!cert) return res.status(404).json({ success: false, message: 'ไม่พบใบอนุโมทนาบัตร' });
    res.json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
