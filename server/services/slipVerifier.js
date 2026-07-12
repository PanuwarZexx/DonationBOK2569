const Donation = require('../models/Donation');

// ตรวจสอบสลิปซ้ำ / สลิปปลอม
const verifySlip = async (ocrData) => {
  const result = { isValid: true, isDuplicate: false, duplicateId: null, message: 'ผ่านการตรวจสอบ' };
  if (!ocrData || !ocrData.reference) return result;
  // ตรวจ reference ซ้ำ
  const existingRef = await Donation.findOne({ reference: ocrData.reference, status: { $ne: 'cancel' } });
  if (existingRef) {
    return { isValid: false, isDuplicate: true, duplicateId: existingRef._id, message: `พบสลิปซ้ำ (Ref: ${ocrData.reference})` };
  }
  // ตรวจยอด + เวลาซ้ำ (ภายใน 5 นาที)
  if (ocrData.amount && ocrData.time) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Donation.findOne({
      amount: ocrData.amount, createdAt: { $gte: fiveMinAgo }, status: { $ne: 'cancel' }
    });
    if (duplicate) {
      return { isValid: false, isDuplicate: true, duplicateId: duplicate._id, message: `พบรายการยอดเดียวกันในช่วงเวลาใกล้เคียง` };
    }
  }
  return result;
};

module.exports = { verifySlip };
