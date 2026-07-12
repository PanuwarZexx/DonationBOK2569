const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankCode: { type: String, unique: true, required: true },
  bankName: { type: String, required: true },
  bankNameThai: { type: String, required: true },
  color: { type: String, default: '#333333' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bank', bankSchema);
