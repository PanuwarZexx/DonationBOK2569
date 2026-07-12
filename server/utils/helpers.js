const generateCertificateNumber = (year = '2569') => {
  const random = Math.floor(Math.random() * 99999) + 1;
  return `BOK${year}-${String(random).padStart(5, '0')}`;
};

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9\u0E00-\u0E7F._-]/g, '_');

const getStatusThai = (status) => {
  const map = { waiting_slip: 'รอสลิป', pending_review: 'รอตรวจสอบ', verified: 'ยืนยันแล้ว', cash: 'เงินสด', cancel: 'ยกเลิก' };
  return map[status] || status;
};

const getChannelThai = (channel) => {
  const map = { transfer: 'โอนเงิน', cash: 'เงินสด', check: 'เช็ค' };
  return map[channel] || channel;
};

const getCategoryThai = (category) => {
  const map = { alumni: 'ศิษย์เก่า', parent: 'ผู้ปกครอง', company: 'บริษัท', general: 'ทั่วไป', other: 'อื่นๆ' };
  return map[category] || category;
};

module.exports = { generateCertificateNumber, sanitizeFilename, getStatusThai, getChannelThai, getCategoryThai };
