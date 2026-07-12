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
    <div class="popup-content">
      <div class="popup-emoji">🙏</div>
      <div class="popup-title">ขออนุโมทนาบุญ</div>
      <div class="popup-name">${donation.donorName}</div>
      <div class="popup-label">บริจาค</div>
      <div class="popup-amount font-en">${formatCurrency(donation.amount)}</div>
      <div class="popup-unit">บาท</div>
      <div class="popup-time">${formatTime(donation.createdAt || new Date())}</div>
      <div class="popup-channel">${donation.channel === 'transfer' ? '💳 โอนเงิน' : donation.channel === 'cash' ? '💵 เงินสด' : '📄 เช็ค'}</div>
    </div>
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
