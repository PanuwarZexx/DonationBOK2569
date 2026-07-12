const { body, query } = require('express-validator');

const donationValidation = [
  body('donorName').trim().notEmpty().withMessage('กรุณาระบุชื่อผู้บริจาค'),
  body('amount').isFloat({ min: 1 }).withMessage('จำนวนเงินต้องมากกว่า 0'),
  body('channel').isIn(['transfer', 'cash', 'check']).withMessage('ช่องทางไม่ถูกต้อง')
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('กรุณาระบุ Username'),
  body('password').notEmpty().withMessage('กรุณาระบุ Password')
];

const userValidation = [
  body('username').trim().notEmpty().withMessage('กรุณาระบุ Username'),
  body('password').isLength({ min: 6 }).withMessage('Password ต้องมีอย่างน้อย 6 ตัวอักษร'),
  body('fullName').trim().notEmpty().withMessage('กรุณาระบุชื่อ-สกุล'),
  body('role').isIn(['admin', 'staff', 'viewer']).withMessage('Role ไม่ถูกต้อง')
];

const searchValidation = [
  query('q').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

module.exports = { donationValidation, loginValidation, userValidation, searchValidation };
