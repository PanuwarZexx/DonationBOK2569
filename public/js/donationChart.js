// ===== Chart.js — กราฟยอดบริจาค =====
let donationChart = null;

async function initDonationChart() {
  try {
    const { data } = await fetchAPI('/dashboard/chart');
    createBarChart(data.daily || []);
  } catch (e) {
    console.log('Chart init skipped');
  }
}

function createBarChart(dailyData) {
  const canvas = document.getElementById('donation-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = dailyData.map(d => {
    const date = new Date(d._id);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const amounts = dailyData.map(d => d.total);
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 165, 0, 0.1)');

  if (donationChart) donationChart.destroy();
  donationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'ยอดบริจาค (บาท)',
        data: amounts,
        backgroundColor: gradient,
        borderColor: 'rgba(255, 215, 0, 0.8)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          titleColor: '#FFD700',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 215, 0, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `${formatCurrency(ctx.raw)} บาท`
          }
        }
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, callback: (v) => formatNumber(v) }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function updateChart(newData) {
  if (donationChart && newData) {
    createBarChart(newData);
  }
}

document.addEventListener('DOMContentLoaded', initDonationChart);
