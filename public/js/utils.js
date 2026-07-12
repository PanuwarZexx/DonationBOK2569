// ===== Utility Functions =====
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};
const throttle = (fn, limit = 300) => {
  let inThrottle;
  return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
};
const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num);
const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
const truncateText = (text, max = 20) => text.length > max ? text.substring(0, max) + '...' : text;
const getRelativeTime = (date) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'เมื่อสักครู่';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
};
const formatTime = (date) => new Date(date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
const formatDate = (date) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
const copyToClipboard = async (text) => { try { await navigator.clipboard.writeText(text); } catch(e) {} };
const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
const getStatusBadge = (status) => {
  const map = {
    waiting_slip: '<span class="badge-status badge-waiting_slip"><i class="fas fa-clock"></i> รอสลิป</span>',
    pending_review: '<span class="badge-status badge-pending_review"><i class="fas fa-search"></i> รอตรวจสอบ</span>',
    verified: '<span class="badge-status badge-verified"><i class="fas fa-check-circle"></i> ยืนยันแล้ว</span>',
    cash: '<span class="badge-status badge-cash"><i class="fas fa-money-bill"></i> เงินสด</span>',
    cancel: '<span class="badge-status badge-cancel"><i class="fas fa-times-circle"></i> ยกเลิก</span>'
  };
  return map[status] || status;
};
const getChannelBadge = (channel) => {
  const map = {
    transfer: '<span class="badge-channel badge-channel-transfer"><i class="fas fa-exchange-alt"></i> โอน</span>',
    cash: '<span class="badge-channel badge-channel-cash"><i class="fas fa-money-bill-wave"></i> เงินสด</span>',
    check: '<span class="badge-channel badge-channel-check"><i class="fas fa-money-check"></i> เช็ค</span>'
  };
  return map[channel] || channel;
};
