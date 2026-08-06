/* ============================================================
   ADMIN-ROOMS.JS — Admin Seat Map Editor Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderSeatEditor();
});

function renderSeatEditor() {
  const container = document.getElementById('editorSeatGrid');
  if (!container) return;
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = 10;
  let html = '';
  rows.forEach(r => {
    for (let c = 1; c <= cols; c++) {
      const seatId = `${r}${c}`;
      let seatType = 'standard';
      if (r === 'C' || r === 'D') seatType = 'vip';
      if (r === 'F') seatType = 'sweetbox';

      html += `<div class="seat seat--${seatType}" onclick="cycleSeatType(this, '${seatId}')" title="${seatId} (${seatType.toUpperCase()})">${seatId}</div>`;
    }
  });
  container.innerHTML = html;
}

function cycleSeatType(el, seatId) {
  if (el.classList.contains('seat--standard')) {
    el.className = 'seat seat--vip';
  } else if (el.classList.contains('seat--vip')) {
    el.className = 'seat seat--sweetbox';
  } else if (el.classList.contains('seat--sweetbox')) {
    el.className = 'seat seat--booked';
  } else {
    el.className = 'seat seat--standard';
  }
}

function selectRoomEditor(roomName, triggerEl) {
  document.querySelectorAll('.card__body .nav-item').forEach(n => n.classList.remove('active'));
  if (triggerEl) triggerEl.classList.add('active');
  document.getElementById('editorRoomTitle').textContent = `Trình Thiết Kế Sơ Đồ Ghế: ${roomName}`;
  renderSeatEditor();
}

function logoutAdmin() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
