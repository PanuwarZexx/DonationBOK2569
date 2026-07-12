const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// สร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @desc    เข้าสู่ระบบ
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Username หรือ Password ไม่ถูกต้อง' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'บัญชีถูกระงับ' });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    สร้างผู้ใช้ใหม่ (Admin only)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { username, password, fullName, role } = req.body;
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Username นี้ถูกใช้แล้ว' });
    }
    const user = await User.create({ username, password, fullName, role });
    res.status(201).json({ success: true, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    ข้อมูลผู้ใช้ปัจจุบัน
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    เปลี่ยนรหัสผ่าน
// @route   PUT /api/auth/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }
    user.password = newPassword;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
