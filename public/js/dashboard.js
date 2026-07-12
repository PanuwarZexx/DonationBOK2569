// ===== Dashboard JS =====
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  const user = getUser();
  const nameEl = document.getElementById('admin-name');
  if (nameEl && user) nameEl.textContent = `สวัสดี, ${user.fullName}`;
  // Show admin menus
  if (user && user.role === 'admin') {
    document.getElementById('admin-menu-title').style.display = 'block';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
  }
  loadDashboard();
  initDashboardSocket();
});

async function loadDashboard() {
  try {
    const [summary, chart, top10, latest] = await Promise.all([
      fetchAPI('/dashboard/summary'),
      fetchAPI('/dashboard/chart'),
      fetchAPI('/dashboard/top10'),
      fetchAPI('/donations/latest')
    ]);
    // Stats
    if (summary.data) {
      document.getElementById('d-total-amount').textContent = formatCurrency(summary.data.totalAmount);
      document.getElementById('d-total-donors').textContent = formatNumber(summary.data.totalDonors);
      document.getElementById('d-today-amount').textContent = formatCurrency(summary.data.todayAmount);
      document.getElementById('d-month-amount').textContent = formatCurrency(summary.data.monthAmount);
    }
    // Charts
    if (chart.data) {
      createDashboardBarChart(chart.data.daily || []);
      createDashboardPieChart(chart.data.channels || []);
    }
    // Top 10
    if (top10.data) renderTop10(top10.data);
    // Recent
    if (latest.data) renderRecent(latest.data);
  } catch(e) { console.error('Dashboard load error:', e); }
}

async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await res.json();
  if (res.status === 401) { logout(); return; }
  return data;
}

function createDashboardBarChart(daily) {
  const ctx = document.getElementById('dashboard-daily-chart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: daily.map(d => { const dt = new Date(d._id); return `${dt.getDate()}/${dt.getMonth()+1}`; }),
      datasets: [{ label: 'บาท', data: daily.map(d => d.total), backgroundColor: 'rgba(255,215,0,0.6)', borderColor: '#FFD700', borderWidth: 1, borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { display: false } }, y: { ticks: { color: 'rgba(255,255,255,0.5)', callback: v => formatNumber(v) }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
  });
}

function createDashboardPieChart(channels) {
  const ctx = document.getElementById('dashboard-channel-chart');
  if (!ctx) return;
  const labels = channels.map(c => c._id === 'transfer' ? 'โอนเงิน' : c._id === 'cash' ? 'เงินสด' : 'เช็ค');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: channels.map(c => c.total), backgroundColor: ['#40C4FF', '#00E676', '#B388FF'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 15 } } } }
  });
}

function renderTop10(data) {
  const body = document.getElementById('top10-body');
  if (!body) return;
  if (!data.length) { body.innerHTML = '<tr><td colspan="4" class="text-center" style="color:var(--color-text-muted)">ยังไม่มีข้อมูล</td></tr>'; return; }
  body.innerHTML = data.map((d, i) => `
    <tr><td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
    <td>${d._id}</td><td class="text-gold font-en">${formatCurrency(d.totalAmount)}</td><td>${d.count}</td></tr>
  `).join('');
}

function renderRecent(data) {
  const body = document.getElementById('recent-body');
  if (!body) return;
  if (!data.length) { body.innerHTML = '<tr><td colspan="4" class="text-center" style="color:var(--color-text-muted)">ยังไม่มีข้อมูล</td></tr>'; return; }
  body.innerHTML = data.slice(0, 10).map(d => `
    <tr><td>${d.donorName}</td><td class="font-en">${formatCurrency(d.amount)}</td>
    <td>${getStatusBadge(d.status)}</td><td>${formatTime(d.createdAt)}</td></tr>
  `).join('');
}

function initDashboardSocket() {
  const socket = io(window.location.origin);
  socket.on('new_donation', () => loadDashboard());
  socket.on('donation_verified', () => loadDashboard());
}
