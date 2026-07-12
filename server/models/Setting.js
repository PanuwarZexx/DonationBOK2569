const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  goalAmount: { type: Number, default: 500000 },
  schoolName: { type: String, default: 'โรงเรียนบ้านบกหนองทันน้ำ' },
  year: { type: String, default: '2569' },
  projectName: { type: String, default: 'ผ้าป่าสามัคคีเพื่อการศึกษา' },
  promptPayId: { type: String, default: '' },
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String
  }],
  announcementText: { type: String, default: 'ร่วมบุญผ้าป่าสามัคคีเพื่อการศึกษา โรงเรียนบ้านบกหนองทันน้ำ ประจำปี 2569' },
  soundEnabled: { type: Boolean, default: true },
  tvModeEnabled: { type: Boolean, default: true },
  popupDuration: { type: Number, default: 8000 },
  lineNotifyEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
