const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  certificateNumber: { type: String, unique: true, required: true },
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  qrCode: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  sentViaLine: { type: Boolean, default: false },
  lineUserId: { type: String, default: '' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ donationId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
