/* ════════════════════════════════════════════════════
   CinéLux — booking.js
   Đặt vé: Film Grid, Showtime, Seat Map, Payment
   ════════════════════════════════════════════════════ */

// ─── FILM GRID ───────────────────────────────────────
function renderFilmGrid() {
  const grid = document.getElementById('filmGrid');
  if (!grid) return;
  grid.innerHTML = movies
    .filter(m => m.status === 'active' || m.status === 'upcoming')
    .map(m => `
      <div class="film-card" id="film-${m.id}" onclick="selectFilm(${m.id})">
        <div class="film-poster">
          <div class="film-poster-bg" style="--c1:${m.c1};--c2:${m.c2}"></div>
          <div class="film-poster-emoji">${m.emoji}</div>
          <div class="film-rating">★ ${m.rating}</div>
        </div>
        <div class="film-info">
          <div class="film-name">${m.title}</div>
          <div class="film-meta">${m.genre} • ${m.duration} phút</div>
        </div>
      </div>
    `).join('');
}

function selectFilm(id) {
  state.selectedFilm = movies.find(m => m.id === id);
  state.selectedSeats = [];
  document.querySelectorAll('.film-card').forEach(c => c.classList.remove('selected-film'));
  document.getElementById(`film-${id}`)?.classList.add('selected-film');
  const titleEl = document.getElementById('selectedMovieTitle');
  if (titleEl) titleEl.textContent = state.selectedFilm.title;
  setTimeout(() => bookingStep(2), 300);
}

function selectShowtime(btn, time, room, id = null) {
  state.selectedSeats = [];
  btn.closest('.showtime-list').querySelectorAll('.showtime-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedShowtime = { time, room, id };
  const fields = {
    summaryMovie: state.selectedFilm?.title || '-',
    summaryTime:  time,
    summaryRoom:  room
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
  setTimeout(() => bookingStep(3), 300);
}

function selectBookingDate(btn, date) {
  state.selectedDate = date;
  if (btn) {
    btn.parentElement.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderBookingShowtimes();
}

function renderBookingShowtimes() {
  const container = document.getElementById('bookingShowtimeContainer');
  if (!container) return;
  const film = state.selectedFilm;
  if (!film) {
    container.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:12px 0">Vui lòng chọn phim trước</div>`;
    return;
  }

  const currentDate = state.selectedDate || '2026-02-27';
  const showtimes = (state.showtimes || []).filter(s => 
    (s.movie === film.id || s.movie_title === film.title || !s.movie) &&
    (!s.show_date || s.show_date === currentDate)
  );

  if (showtimes.length === 0) {
    container.innerHTML = `
      <div style="color:var(--text-muted);font-size:13px;padding:24px 0;text-align:center;width:100%">
        <div>📅 Chưa có suất chiếu cho ngày ${currentDate}</div>
        <div style="font-size:11px;margin-top:4px">Vui lòng chọn ngày khác hoặc Admin có thể thêm suất chiếu ở mục Lịch chiếu</div>
      </div>
    `;
    return;
  }

  // Nhóm theo phòng chiếu
  const byRoom = {};
  showtimes.forEach(st => {
    const rName = st.room_name || st.room || 'Phòng 1 - IMAX';
    if (!byRoom[rName]) byRoom[rName] = [];
    byRoom[rName].push(st);
  });

  let html = '';
  Object.entries(byRoom).forEach(([roomName, list]) => {
    html += `<div style="width:100%;margin:12px 0 6px;font-size:12px;color:var(--text-muted);font-weight:600">${roomName}</div>`;
    list.forEach(st => {
      const timeStr = st.start_time || st.time || '19:00';
      html += `<button class="showtime-btn" onclick="selectShowtime(this,'${timeStr}','${roomName}', ${st.id || 'null'})">${timeStr}</button>`;
    });
  });

  container.innerHTML = html;
}

// ─── PER-SHOWTIME SEAT REPOSITORY ────────────────────
function getShowtimeKey() {
  if (state.selectedShowtime && state.selectedShowtime.id) {
    return `showtime_${state.selectedShowtime.id}`;
  }
  const filmId = state.selectedFilm ? state.selectedFilm.id : '1';
  const date = state.selectedDate || '2026-02-27';
  const time = state.selectedShowtime ? state.selectedShowtime.time : '19:15';
  const room = state.selectedShowtime ? state.selectedShowtime.room : 'P1-IMAX';
  return `showtime_${filmId}_${date}_${room}_${time}`;
}

function getBookedSeatsMap() {
  try {
    return JSON.parse(localStorage.getItem('cinelux_booked_seats_map') || '{}');
  } catch (e) {
    return {};
  }
}

function saveBookedSeatsMap(map) {
  try {
    localStorage.setItem('cinelux_booked_seats_map', JSON.stringify(map));
  } catch (e) {}
}

function getTakenSeatsForCurrentShowtime() {
  const key = getShowtimeKey();
  const map = getBookedSeatsMap();
  return new Set(map[key] || []);
}

// ─── REALTIME SOCKET MANAGER ─────────────────────────
class CinemaSocket {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cinelux_realtime_socket') : null;
    this.handlers = {};

    if (this.channel) {
      this.channel.onmessage = (e) => {
        const { event, data } = e.data || {};
        if (event && this.handlers[event]) {
          this.handlers[event].forEach(fn => fn(data));
        }
      };
    }
  }

  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  emit(event, data) {
    if (this.channel) {
      this.channel.postMessage({ event, data });
    }
    if (this.handlers[event]) {
      this.handlers[event].forEach(fn => fn(data));
    }
  }
}

const socket = new CinemaSocket();
const CLIENT_ID = 'client_' + Math.random().toString(36).substr(2, 9);
const remoteHeldSeatsMap = {}; // showtimeKey -> { [seatId]: { clientId, userName } }

// 1. Lắng nghe sự kiện giữ ghế tạm thời (realtime seat lock) khi có user click chọn ghế ở tab khác
socket.on('SEAT_LOCK_CHANGED', (payload) => {
  if (!payload || payload.clientId === CLIENT_ID) return;
  const currentKey = getShowtimeKey();
  if (!remoteHeldSeatsMap[payload.showtimeKey]) {
    remoteHeldSeatsMap[payload.showtimeKey] = {};
  }

  // Dọn các ghế cũ của client này trên suất chiếu này
  Object.keys(remoteHeldSeatsMap[payload.showtimeKey]).forEach(sId => {
    if (remoteHeldSeatsMap[payload.showtimeKey][sId]?.clientId === payload.clientId) {
      delete remoteHeldSeatsMap[payload.showtimeKey][sId];
    }
  });

  // Cập nhật ghế mới đang được giữ
  (payload.selectedSeats || []).forEach(sId => {
    remoteHeldSeatsMap[payload.showtimeKey][sId] = {
      clientId: payload.clientId,
      userName: payload.userName || 'Khách hàng khác'
    };
  });

  if (state.currentPage === 'booking' && currentKey === payload.showtimeKey) {
    // Nếu tab này đang chọn trùng ghế mà tab kia vừa chọn trước
    const conflicts = state.selectedSeats.filter(s => (payload.selectedSeats || []).includes(s));
    if (conflicts.length > 0) {
      state.selectedSeats = state.selectedSeats.filter(s => !(payload.selectedSeats || []).includes(s));
      showToast(`⚠️ [Realtime Lock] Ghế ${conflicts.join(', ')} vừa được ${payload.userName || 'người khác'} chọn trước!`, 'error');
      updateSeatSummary();
    }
    renderSeatMap('seatGrid');
  }
});

// 2. Lắng nghe sự kiện thanh toán hoàn tất từ bất kỳ client/tab nào
socket.on('PAYMENT_COMPLETED', (payload) => {
  const currentKey = getShowtimeKey();
  if (state.currentPage === 'booking' && currentKey === payload.showtimeKey) {
    // Xóa khỏi danh sách đang giữ
    if (remoteHeldSeatsMap[payload.showtimeKey]) {
      payload.seats.forEach(s => delete remoteHeldSeatsMap[payload.showtimeKey][s]);
    }
    const conflicts = state.selectedSeats.filter(s => payload.seats.includes(s));
    if (conflicts.length > 0) {
      state.selectedSeats = state.selectedSeats.filter(s => !payload.seats.includes(s));
      showToast(`⚠️ [Socket Realtime] Ghế ${conflicts.join(', ')} vừa được thanh toán thành công!`, 'error');
    } else {
      showToast(`🔔 [Socket Realtime] Vừa có người đặt thành công ghế ${payload.seats.join(', ')}!`, 'info');
    }
    renderSeatMap('seatGrid');
    updateSeatSummary();
  }
});

// ─── SEAT MAP ────────────────────────────────────────
const SEAT_PRICES  = { std: 90000, vip: 150000, sweet: 250000 };
const ROWS         = 'ABCDEFGHIJ';
const SEATS_PER_ROW = 12;

function renderSeatMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const takenSeats = getTakenSeatsForCurrentShowtime();
  const currentKey = getShowtimeKey();
  const remoteHeld = remoteHeldSeatsMap[currentKey] || {};

  let html = '';
  ROWS.split('').forEach(row => {
    const type = ['D','E','F'].includes(row) ? 'vip' : row === 'J' ? 'sweet' : 'std';
    html += `<div class="seat-row"><div class="row-label">${row}</div>`;
    if (type === 'sweet') {
      for (let i = 1; i <= 6; i++) {
        const id    = `${row}${i * 2 - 1}`;
        const taken = takenSeats.has(id);
        const sel   = state.selectedSeats.includes(id);
        const holding = !taken && !sel && Boolean(remoteHeld[id]);

        let seatClass = `seat sweet`;
        if (taken) seatClass += ' taken';
        else if (sel) seatClass += ' selected';
        else if (holding) seatClass += ' holding';

        html += `<button class="${seatClass}"
          data-seat="${id}" data-type="sweet"
          ${taken ? 'disabled title="Ghế đã được đặt"' : holding ? `disabled title="Đang được ${remoteHeld[id].userName} giữ chỗ (Realtime)"` : ''}
          onclick="toggleSeat('${id}','sweet')">${i}</button>`;
      }
    } else {
      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        const id    = `${row}${i}`;
        const taken = takenSeats.has(id);
        const sel   = state.selectedSeats.includes(id);
        const holding = !taken && !sel && Boolean(remoteHeld[id]);

        let seatClass = `seat ${type}`;
        if (taken) seatClass += ' taken';
        else if (sel) seatClass += ' selected';
        else if (holding) seatClass += ' holding';

        html += `<button class="${seatClass}"
          data-seat="${id}" data-type="${type}"
          ${taken ? 'disabled title="Ghế đã được đặt"' : holding ? `disabled title="Đang được ${remoteHeld[id].userName} giữ chỗ (Realtime)"` : ''}
          onclick="toggleSeat('${id}','${type}')">${i}</button>`;
      }
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function broadcastSeatLock() {
  const showtimeKey = getShowtimeKey();
  socket.emit('SEAT_LOCK_CHANGED', {
    showtimeKey,
    clientId: CLIENT_ID,
    userName: state.currentUser?.name || 'Khách hàng',
    selectedSeats: [...state.selectedSeats]
  });
}

function toggleSeat(id, type) {
  const takenSeats = getTakenSeatsForCurrentShowtime();
  if (takenSeats.has(id)) {
    showToast('Ghế này đã có người đặt!', 'error');
    return;
  }
  const currentKey = getShowtimeKey();
  const remoteHeld = remoteHeldSeatsMap[currentKey] || {};
  if (remoteHeld[id]) {
    showToast(`Ghế này đang được ${remoteHeld[id].userName || 'khách hàng khác'} giữ chỗ!`, 'warning');
    return;
  }

  const idx = state.selectedSeats.indexOf(id);
  if (idx >= 0) state.selectedSeats.splice(idx, 1);
  else           state.selectedSeats.push(id);

  broadcastSeatLock();
  renderSeatMap('seatGrid');
  updateSeatSummary();
}

function updateSeatSummary() {
  let total = 0;
  const seatLines = [];
  state.selectedSeats.forEach(id => {
    const btn  = document.querySelector(`[data-seat="${id}"]`);
    const type = btn?.dataset?.type || 'std';
    total += SEAT_PRICES[type] || 0;
    seatLines.push(`${id} (${type === 'vip' ? 'VIP' : type === 'sweet' ? 'Sweet' : 'STD'})`);
  });
  const sumEl = document.getElementById('selectedSeatsSummary');
  if (sumEl) sumEl.innerHTML = state.selectedSeats.length
    ? `<div class="summary-row"><span>Ghế:</span>
       <span style="color:var(--text-dim);text-align:right">${seatLines.join(', ')}</span></div>`
    : '';
  const totalEl = document.getElementById('totalPrice');
  if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + 'đ';
  const btn = document.getElementById('btnProceedPayment');
  if (btn) btn.disabled = state.selectedSeats.length === 0;
}

function renderAdminSeatMap() {
  const container = document.getElementById('adminSeatGrid');
  if (!container) return;
  let html = '';
  ROWS.split('').forEach(row => {
    const type = ['D','E','F'].includes(row) ? 'vip' : row === 'J' ? 'sweet' : 'std';
    html += `<div class="seat-row"><div class="row-label">${row}</div>`;
    if (type === 'sweet') {
      for (let i = 1; i <= 6; i++) html += `<button class="seat sweet">${i}</button>`;
    } else {
      for (let i = 1; i <= 12; i++) html += `<button class="seat ${type}">${i}</button>`;
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

// ─── BOOKING STEPS ────────────────────────────────────
function bookingStep(step) {
  [1, 2, 3, 4, 5].forEach(s => {
    const el     = document.getElementById(`bookingStep${s}`);
    const stepEl = document.getElementById(`step${s}`);
    if (el) el.style.display = s === step ? '' : 'none';
    if (stepEl) {
      stepEl.classList.remove('active', 'done');
      if (s === step)  stepEl.classList.add('active');
      else if (s < step) stepEl.classList.add('done');
    }
  });
  if (step === 2) {
    renderBookingShowtimes();
  }
  if (step === 3) {
    renderSeatMap('seatGrid');
    updateSeatSummary();
  }
  if (step === 4) {
    const total = calcTotal();
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('pay-movie',  state.selectedFilm?.title  || '-');
    set('pay-time',   state.selectedShowtime?.time || '-');
    set('pay-seats',  state.selectedSeats.join(', ') || '-');
    set('pay-total',  total.toLocaleString('vi-VN') + 'đ');
  }
}

function calcTotal() {
  return state.selectedSeats.reduce((acc, id) => {
    const btn = document.querySelector(`[data-seat="${id}"]`);
    return acc + (SEAT_PRICES[btn?.dataset?.type] || 0);
  }, 0);
}

// ─── PAYMENT ─────────────────────────────────────────
function selectPayMethod(method) {
  document.querySelectorAll('[id^="pay-"]').forEach(el => {
    if (el.classList.contains('room-card')) el.style.borderColor = '';
  });
  const el = document.getElementById(`pay-${method}`);
  if (el) el.style.borderColor = 'var(--gold)';
}

function doPayment() {
  showToast('Đang xử lý giao dịch thanh toán...', 'info');
  setTimeout(() => {
    const total = calcTotal();
    const code  = '#VX-' + Math.floor(8000 + Math.random() * 1000);
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    const movieTitle = state.selectedFilm?.title || 'Phim';
    const showtime = state.selectedShowtime?.time || '-';
    const seatsStr = state.selectedSeats.join(', ');
    const totalStr = total.toLocaleString('vi-VN') + 'đ';

    set('ticket-movie',  movieTitle);
    set('ticket-time',   showtime);
    set('ticket-seats',  seatsStr || '-');
    set('ticket-total',  totalStr);
    set('ticket-code',   code);

    // Lưu vé vào mảng dữ liệu toàn cục
    tickets.unshift({
      id: code.replace('#', ''),
      customer: state.currentUser?.name || 'Khách hàng',
      movie: movieTitle,
      time: `T.5 27/02 ${showtime}`,
      seats: seatsStr,
      total: totalStr,
      status: 'active'
    });
    if (typeof renderTicketTable === 'function') renderTicketTable();
    if (typeof renderMyTickets === 'function') renderMyTickets();

    // Cập nhật ghế đã đặt cho suất chiếu này
    const showtimeKey = getShowtimeKey();
    const map = getBookedSeatsMap();
    if (!map[showtimeKey]) map[showtimeKey] = [];
    const bookedSeats = [...state.selectedSeats];
    map[showtimeKey].push(...bookedSeats);
    saveBookedSeatsMap(map);

    // Bắn sự kiện socket real-time chuẩn
    socket.emit('PAYMENT_COMPLETED', {
      showtimeKey,
      seats: bookedSeats,
      ticketCode: code,
      movie: movieTitle,
      time: showtime,
      timestamp: Date.now()
    });

    // Gửi lưu vé vào Django backend database
    if (typeof api !== 'undefined' && api.booking) {
      api.booking.createTicket({
        ticket_code: code.replace('#', ''),
        customer: state.currentUser?.name || 'Khách hàng',
        customer_phone: state.currentUser?.phone || '',
        movie: movieTitle,
        room: state.selectedShowtime?.room || 'Phòng 1 - IMAX',
        showtime_id: state.selectedShowtime?.id || null,
        time: `T.5 27/02 ${showtime}`,
        seats: bookedSeats,
        total: totalStr,
        total_amount: total,
        payment_method: 'Chuyển khoản / Thẻ'
      }).then(() => {
        // Tải lại tickets từ backend nếu cần
        if (typeof api.tickets !== 'undefined') {
          api.tickets.getAll().then(list => {
            if (Array.isArray(list) && list.length) {
              tickets = list;
              if (typeof renderTicketTable === 'function') renderTicketTable();
              if (typeof renderMyTickets === 'function') renderMyTickets();
            }
          }).catch(() => {});
        }
      }).catch(err => {
        console.warn('[Booking API] Lưu vé backend lỗi:', err.message);
      });
    }

    state.selectedSeats = [];
    broadcastSeatLock();
    bookingStep(5);
    showToast('Thanh toán thành công! Vé đã được kích hoạt 🎉', 'success');
  }, 1500);
}
