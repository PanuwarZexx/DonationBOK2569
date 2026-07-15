const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
donorProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
