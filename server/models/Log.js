const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, default: 'system' },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  targetModel: { type: String, default: '' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  ip: { type: String, default: '' },
  browser: { type: String, default: '' }
}, { timestamps: true });

// ลบ log เก่ากว่า 90 วันอัตโนมัติ
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
