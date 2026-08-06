/* ============================================================
   STAFF-POS.JS — Staff POS Ticket Counter Sales Logic
   ============================================================ */

let selectedMovie = null;
let selectedShowtime = null;
let selectedSeats = [];
let fnbItems = [
  { id: 1, name: 'Combo Popcorn Single', price: 75000, qty: 0 },
  { id: 2, name: 'Combo Bắp + 2 Pepsi', price: 105000, qty: 0 },
  { id: 3, name: 'Combo Đôi Sweet Box', price: 145000, qty: 0 },
  { id: 4, name: 'Nước Ngọt Pepsi Lớn', price: 35000, qty: 0 },
];

document.addEventListener('DOMContentLoaded', () => {
  renderPosMovies();
  renderPosFnb();
});

function renderPosMovies() {
  const container = document.getElementById('posMovieList');
  if (!container) return;
  const movies = getMovies();
  container.innerHTML = movies.map(m => `
    <div class="pos-movie-card ${selectedMovie && selectedMovie.id === m.id ? 'selected' : ''}" onclick="selectPosMovie(${m.id})">
      <div class="pos-movie-poster"><img src="${m.poster}" alt="${m.title}"></div>
      <div class="pos-movie-name">${m.title}</div>
    </div>
  `).join('');
}

function selectPosMovie(id) {
  selectedMovie = getMovies().find(m => m.id === id);
  selectedShowtime = null;
  selectedSeats = [];
  renderPosMovies();
  loadPosShowtimes();
  updateReceipt();
}

function loadPosShowtimes() {
  const container = document.getElementById('posShowtimeGrid');
  if (!container) return;
  if (!selectedMovie) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px">Vui lòng chọn phim ở bước 1...</div>';
    return;
  }
  const showtimes = ['10:00', '13:30', '16:15', '19:00', '21:30'];
  container.innerHTML = showtimes.map(st => `
    <button class="showtime-btn ${selectedShowtime === st ? 'active' : ''}" onclick="selectPosShowtime('${st}')">
      <div class="time">${st}</div>
      <div class="type">Phòng 1 (2D)</div>
    </button>
  `).join('');
}

function selectPosShowtime(time) {
  selectedShowtime = time;
  document.getElementById('posSeatBox').style.display = 'block';
  renderPosSeats();
  loadPosShowtimes();
  updateReceipt();
}

function renderPosSeats() {
  const container = document.getElementById('posSeatGrid');
  if (!container) return;
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = 8;
  let html = '';
  rows.forEach(r => {
    for (let c = 1; c <= cols; c++) {
      const seatId = `${r}${c}`;
      const isSelected = selectedSeats.includes(seatId);
      const isBooked = (r === 'B' && c === 3) || (r === 'D' && c === 5);
      html += `
        <div class="seat ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}" 
             onclick="${isBooked ? '' : `togglePosSeat('${seatId}')`}">
          ${seatId}
        </div>`;
    }
  });
  container.innerHTML = html;
}

function togglePosSeat(seatId) {
  if (selectedSeats.includes(seatId)) {
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else {
    selectedSeats.push(seatId);
  }
  renderPosSeats();
  updateReceipt();
}

function renderPosFnb() {
  const container = document.getElementById('posFnbGrid');
  if (!container) return;
  container.innerHTML = fnbItems.map(item => `
    <div class="fnb-card">
      <div class="fnb-title">${item.name}</div>
      <div class="fnb-price">${formatVND(item.price)}</div>
      <div class="fnb-counter">
        <button class="fnb-btn" onclick="updateFnbQty(${item.id}, -1)">-</button>
        <span style="font-weight:700">${item.qty}</span>
        <button class="fnb-btn" onclick="updateFnbQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function updateFnbQty(id, delta) {
  const item = fnbItems.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(0, item.qty + delta);
    renderPosFnb();
    updateReceipt();
  }
}

function updateReceipt() {
  document.getElementById('receiptMovie').textContent = selectedMovie ? selectedMovie.title : 'Chưa chọn phim';
  document.getElementById('receiptShowtime').textContent = selectedShowtime ? `${selectedShowtime} - Phòng 1` : '--:--';
  document.getElementById('receiptSeats').textContent = selectedSeats.length ? selectedSeats.join(', ') : 'Chưa chọn ghế';

  const selectedFnb = fnbItems.filter(i => i.qty > 0);
  document.getElementById('receiptFnb').innerHTML = selectedFnb.length
    ? selectedFnb.map(i => `<div>${i.name} × ${i.qty} (${formatVND(i.price * i.qty)})</div>`).join('')
    : 'Chưa chọn';

  const ticketPrice = selectedSeats.length * 100000;
  const fnbPrice = selectedFnb.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = ticketPrice + fnbPrice;

  document.getElementById('posTotal').textContent = formatVND(total);
}

function processPosCheckout() {
  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    showToast('Vui lòng chọn Phim, Suất chiếu và Ghế trước khi bán vé!', 'warning');
    return;
  }
  const ticketId = generateTicketId();
  showToast(`✓ Đã in vé thành công! Mã vé: ${ticketId}`, 'success');
  // Reset pos state
  selectedSeats = [];
  fnbItems.forEach(i => i.qty = 0);
  renderPosSeats();
  renderPosFnb();
  updateReceipt();
}

function logoutStaff() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
