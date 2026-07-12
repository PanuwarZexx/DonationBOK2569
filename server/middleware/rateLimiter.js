const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'คำขอมากเกินไป กรุณารอสักครู่' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาที' }
});

module.exports = { generalLimiter, authLimiter };
