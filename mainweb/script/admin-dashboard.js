/* ============================================================
   ADMIN-DASHBOARD.JS — Admin Dashboard Chart & Stats Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderAdminChart();
});

function renderAdminChart() {
  const chartEl = document.getElementById('adminRevenueChart');
  if (!chartEl) return;
  const data = [1.8, 2.1, 2.8, 1.9, 2.3, 2.4];
  const maxVal = Math.max(...data);
  chartEl.innerHTML = data.map(v => `
    <div class="bar-wrap">
      <div class="bar-value">${v} Tỷ</div>
      <div class="bar" style="height:${(v / maxVal * 100)}%;"></div>
    </div>
  `).join('');
}

function logoutAdmin() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
