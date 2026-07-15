const DonorProfile = require('../models/DonorProfile');

// @desc    ดึงข้อมูลโปรไฟล์ผู้บริจาคทั้งหมด
// @route   GET /api/donors/profiles
// @access  Private (Staff/Admin)
exports.getDonorProfiles = async (req, res) => {
  try {
    const profiles = await DonorProfile.find().sort({ donorName: 1 });
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    สร้างหรืออัปเดตโปรไฟล์ผู้บริจาค (ผูกรูปถ่าย)
// @route   POST /api/donors/profiles
// @access  Private (Staff/Admin)
exports.upsertDonorProfile = async (req, res) => {
  try {
    const { donorName, photoUrl } = req.body;
    if (!donorName) return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้บริจาค' });
    if (!photoUrl) return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดรูปถ่าย' });

    const profile = await DonorProfile.findOneAndUpdate(
      { donorName: donorName.trim() },
      { donorName: donorName.trim(), photoUrl, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ลบโปรไฟล์ผู้บริจาค
// @route   DELETE /api/donors/profiles/:id
// @access  Private (Staff/Admin)
exports.deleteDonorProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'ไม่พบรายการที่ต้องการลบ' });
    res.json({ success: true, message: 'ลบโปรไฟล์สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
