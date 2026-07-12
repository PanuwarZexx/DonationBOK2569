// @desc    Upload สลิป
// @route   POST /api/upload
exports.uploadSlip = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์' });
    // ถ้ามี Cloudinary ให้ upload ไป cloud
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudinary = require('../config/cloudinary');
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'donation-slips' });
      return res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
    }
    // ถ้าไม่มี Cloudinary ใช้ local
    res.json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
