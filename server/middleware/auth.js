const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ success: false, message: 'ไม่ได้รับอนุญาต' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้อง' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
  }
};

module.exports = { protect };
