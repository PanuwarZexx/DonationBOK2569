// ===== Socket.IO Client =====
let socket = null;

function initSocket() {
  socket = io(window.location.origin, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    updateConnectionStatus(true);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
    updateConnectionStatus(false);
  });

  // รายการบริจาคใหม่
  socket.on('new_donation', (donation) => {
    console.log('🆕 New donation:', donation);
    addDonationToTop(donation);
    loadStats(); // รีเฟรชยอดรวม
    if (typeof loadTopDonors === 'function') loadTopDonors();
    if (typeof showDonationPopup === 'function') showDonationPopup(donation);
    if (typeof speakDonation === 'function') speakDonation(donation);
    showToast(`🙏 ${donation.donorName} บริจาค ${formatCurrency(donation.amount)} บาท`, 'success');
  });

  // อัปเดตรายการ
  socket.on('donation_updated', (donation) => {
    console.log('✏️ Donation updated:', donation);
    const item = document.getElementById(`donation-${donation._id}`);
    if (item) {
      item.innerHTML = renderDonationItem(donation).replace(/<div[^>]*>/, '').replace(/<\/div>$/, '');
    }
    loadStats();
    if (typeof loadTopDonors === 'function') loadTopDonors();
  });

  // ยืนยันรายการ
  socket.on('donation_verified', (donation) => {
    console.log('✅ Donation verified:', donation);
    loadStats();
    loadLatestDonations();
    if (typeof loadTopDonors === 'function') loadTopDonors();
  });

  // สถิติอัปเดต
  socket.on('stats_updated', (stats) => {
    if (stats.totalAmount !== undefined) updateTotalDisplay(stats.totalAmount);
    if (stats.goalAmount !== undefined) updateProgressBar(stats.totalAmount, stats.goalAmount);
  });
}

function updateConnectionStatus(connected) {
  let indicator = document.querySelector('.connection-status');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'connection-status';
    document.body.appendChild(indicator);
  }
  indicator.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
  indicator.innerHTML = `
    <span class="live-dot" style="background: ${connected ? 'var(--color-success)' : 'var(--color-danger)'}"></span>
    <span>${connected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}</span>
  `;
}

// Init when DOM ready
document.addEventListener('DOMContentLoaded', initSocket);
