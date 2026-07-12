const Setting = require('../models/Setting');

// @desc    ตั้งค่าทั้งหมด (Admin)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ตั้งค่าสาธารณะ
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    res.json({
      success: true,
      data: {
        goalAmount: settings.goalAmount, schoolName: settings.schoolName,
        year: settings.year, projectName: settings.projectName,
        promptPayId: settings.promptPayId, announcementText: settings.announcementText,
        soundEnabled: settings.soundEnabled, popupDuration: settings.popupDuration,
        bankAccounts: settings.bankAccounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    อัปเดตการตั้งค่า
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = new Setting();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings, message: 'บันทึกการตั้งค่าสำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
