// ===== Popup อนุโมทนาบุญ =====
let popupQueue = [];
let isShowingPopup = false;

function showDonationPopup(donation) {
  popupQueue.push(donation);
  if (!isShowingPopup) processPopupQueue();
}

function processPopupQueue() {
  if (popupQueue.length === 0) { isShowingPopup = false; return; }
  isShowingPopup = true;
  const donation = popupQueue.shift();
  const container = document.getElementById('popup-container');
  if (!container) return;

  const popup = document.createElement('div');
  popup.className = 'donation-popup';
  popup.innerHTML = `
    <div class="popup-glow"></div>
    <div class="popup-header">
      <div class="popup-emoji">
        <i class="fas fa-bell popup-bell-ring"></i>
      </div>
      <div class="popup-title-section">
        <div class="popup-label">ร่วมอนุโมทนาบุญ</div>
        <div class="popup-title">มีรายการบริจาคใหม่เข้ามา</div>
      </div>
      <button class="popup-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
    <div class="popup-body">
      <div class="popup-donor-name">${donation.donorName}</div>
      <div class="popup-amount">${formatCurrency(donation.amount)} <small>บาท</small></div>
    </div>
    <div class="popup-footer">
      <span class="popup-time">${formatTime(donation.createdAt || new Date())}</span>
      <span class="popup-channel badge-status badge-verified">${donation.channel === 'transfer' ? '💳 โอนเงิน' : donation.channel === 'cash' ? '💵 เงินสด' : '📄 เช็ค'}</span>
    </div>
    <div class="popup-timer"></div>
  `;

  container.appendChild(popup);
  // Force reflow
  popup.offsetHeight;
  popup.classList.add('show');

  // Auto remove after 8 seconds
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(() => {
      popup.remove();
      processPopupQueue();
    }, 500);
  }, 8000);
}
