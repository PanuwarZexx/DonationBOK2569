const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_donation', 'waiting_slip', 'duplicate_slip', 'pending_review', 'backup_success', 'system_error'],
    required: true
  },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
