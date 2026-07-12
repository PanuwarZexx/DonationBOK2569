const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  channel: { type: String, enum: ['transfer', 'cash', 'check'], required: true },
  status: {
    type: String,
    enum: ['waiting_slip', 'pending_review', 'verified', 'cash', 'cancel'],
    default: 'pending_review'
  },
  // ข้อมูลธนาคาร
  bankName: { type: String, default: '' },
  reference: { type: String, default: '' },
  transactionTime: { type: Date },
  transactionDate: { type: Date },
  checkNumber: { type: String, default: '' },
  // สลิป
  slipImage: { type: String, default: '' },
  ocrData: {
    senderName: String,
    bankName: String,
    time: String,
    date: String,
    amount: Number,
    reference: String,
    rawText: String
  },
  // ข้อมูลที่อยู่
  village: { type: String, default: '' },
  subDistrict: { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  // ประเภท
  category: {
    type: String,
    enum: ['alumni', 'parent', 'company', 'general', 'other'],
    default: 'general'
  },
  note: { type: String, default: '' },
  // LINE
  lineUserId: { type: String, default: '' },
  // ตรวจสอบ
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }
}, { timestamps: true });

// Index สำหรับค้นหาเร็ว
donationSchema.index({ reference: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ donorName: 'text' });
donationSchema.index({ status: 1 });
donationSchema.index({ channel: 1 });

module.exports = mongoose.model('Donation', donationSchema);
