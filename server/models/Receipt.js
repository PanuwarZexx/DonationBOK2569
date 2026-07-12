const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  receiptNumber: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  donorName: { type: String, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
