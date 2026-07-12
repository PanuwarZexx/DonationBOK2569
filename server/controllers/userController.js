const User = require('../models/User');

// @desc    รายชื่อผู้ใช้ทั้งหมด
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ข้อมูลผู้ใช้
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    สร้างผู้ใช้ใหม่
exports.createUser = async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Username ซ้ำ' });
    const user = await User.create({ username, password, fullName, role });
    res.status(201).json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    แก้ไขผู้ใช้
exports.updateUser = async (req, res) => {
  try {
    const { fullName, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password;
    await user.save();
    res.json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ลบผู้ใช้ (ปิดใช้งาน)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    res.json({ success: true, message: 'ปิดใช้งานผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
