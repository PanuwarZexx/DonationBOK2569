// ===== Main Application — Public Page =====
const API_BASE = window.location.origin + '/api';

// ===== Fetch API Wrapper =====
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== Animate Number Counting Up =====
function animateValue(element, start, end, duration = 1500) {
  if (!element) return;
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(start + (end - start) * eased);
    element.textContent = formatCurrency(current);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ===== Load Public Settings =====
async function loadPublicSettings() {
  try {
    const { data } = await fetchAPI('/settings/public');
    if (data.schoolName) {
      const el = document.getElementById('school-name');
      if (el) el.textContent = `${data.schoolName} ประจำปี ${data.year}`;
    }
    if (data.projectName) {
      const el = document.getElementById('project-name');
      if (el) el.textContent = data.projectName;
    }
    if (data.goalAmount) {
      const el = document.getElementById('goal-amount');
      if (el) el.textContent = formatNumber(data.goalAmount);
    }
    if (data.promptPayId) {
      const el = document.getElementById('promptpay-id');
      if (el) el.textContent = data.promptPayId;
    }
    if (data.announcementText) {
      const el = document.getElementById('announcement-text');
      if (el) el.textContent = data.announcementText;
    }
  } catch (e) {
    console.log('Settings load skipped (dev mode)');
  }
}

// ===== Load Stats =====
async function loadStats() {
  try {
    const { data } = await fetchAPI('/dashboard/summary');
    updateTotalDisplay(data.totalAmount);
    updateProgressBar(data.totalAmount, data.goalAmount);
    const donorsEl = document.getElementById('total-donors');
    if (donorsEl) donorsEl.textContent = formatNumber(data.totalDonors);
    const todayEl = document.getElementById('today-amount');
    if (todayEl) todayEl.textContent = formatCurrency(data.todayAmount);
  } catch (e) {
    console.log('Stats load skipped');
  }
}

// ===== Update Total Display =====
function updateTotalDisplay(amount) {
  const el = document.getElementById('total-amount');
  if (!el) return;
  const current = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
  animateValue(el, current, amount);
}

// ===== Update Progress Bar =====
function updateProgressBar(current, goal) {
  const bar = document.getElementById('progress-bar');
  const percent = document.getElementById('progress-percent');
  if (!bar || !percent) return;
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100).toFixed(1) : 0;
  bar.style.width = `${pct}%`;
  percent.textContent = `${pct}%`;
}

// ===== Load Latest Donations =====
async function loadLatestDonations() {
  try {
    const { data } = await fetchAPI('/donations/latest');
    renderDonationList(data);
  } catch (e) {
    console.log('Donations load skipped');
  }
}

// ===== Render Donation List =====
function renderDonationList(donations) {
  const list = document.getElementById('donation-list');
  const empty = document.getElementById('empty-state');
  if (!list) return;
  if (!donations || donations.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  list.innerHTML = donations.map((d, i) => renderDonationItem(d, i)).join('');
}

// ===== Render Single Donation Item =====
function renderDonationItem(donation, index = 0) {
  const time = formatTime(donation.createdAt || donation.transactionTime);
  return `
    <div class="donation-item glass-card animate-slide-in-right" style="animation-delay: ${index * 0.05}s" id="donation-${donation._id}">
      <div class="donation-item-left">
        <div class="donation-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="donation-info">
          <div class="donation-name">${donation.donorName}</div>
          <div class="donation-meta">
            <span class="donation-time"><i class="far fa-clock"></i> ${time}</span>
            ${getChannelBadge(donation.channel)}
          </div>
        </div>
      </div>
      <div class="donation-item-right">
        <div class="donation-amount font-en">${formatCurrency(donation.amount)}</div>
        <div class="donation-currency">บาท</div>
      </div>
    </div>
  `;
}

// ===== Add New Donation to Top =====
function addDonationToTop(donation) {
  const list = document.getElementById('donation-list');
  const empty = document.getElementById('empty-state');
  if (!list) return;
  if (empty) empty.style.display = 'none';
  const newItem = document.createElement('div');
  newItem.innerHTML = renderDonationItem(donation);
  const itemEl = newItem.firstElementChild;
  itemEl.classList.add('new-donation-highlight');
  list.insertBefore(itemEl, list.firstChild);
  // Remove last item if > 15
  const items = list.querySelectorAll('.donation-item');
  if (items.length > 15) items[items.length - 1].remove();
}

// ===== Toast Notification =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// ===== Load Top Donors =====
async function loadTopDonors() {
  try {
    const { data } = await fetchAPI('/dashboard/top10');
    renderTopDonors(data);
  } catch (e) {
    console.log('Top donors load skipped');
  }
}

// ===== Render Top Donors =====
function renderTopDonors(topList) {
  const container = document.getElementById('top3-list');
  if (!container) return;
  
  if (!topList || topList.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="fas fa-medal mb-1"></i>
        <p class="mb-0" style="font-size: 0.9rem;">ยังไม่มีผู้บริจาคยอดสูงสุด</p>
      </div>
    `;
    return;
  }
  
  // Get top 3
  const top3 = topList.slice(0, 3);
  
  // Fill missing ranks with placeholders if less than 3
  while (top3.length < 3) {
    top3.push({ _id: '-', totalAmount: 0 });
  }
  
  // Map ranks to gold, silver, bronze cards
  const ranks = [
    { class: 'podium-gold', crown: '👑', label: 'อันดับ 1' },
    { class: 'podium-silver', crown: '🥈', label: 'อันดับ 2' },
    { class: 'podium-bronze', crown: '🥉', label: 'อันดับ 3' }
  ];
  
  container.innerHTML = top3.map((d, index) => {
    const r = ranks[index];
    const name = d._id === '-' ? 'ว่าง' : d._id;
    const amountText = d.totalAmount > 0 ? `${formatCurrency(d.totalAmount)} <small>บาท</small>` : '-';
    
    return `
      <div class="podium-card ${r.class}">
        <div class="podium-crown">${r.crown}</div>
        <div class="podium-name">${name}</div>
        <div class="podium-amount">${amountText}</div>
      </div>
    `;
  }).join('');
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadPublicSettings();
  loadStats();
  loadLatestDonations();
  loadTopDonors();
});
