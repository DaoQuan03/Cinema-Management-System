/* ============================================================
   MOVIE-DETAIL.JS — Movie Detail, Showtimes & Seat Selection
   ============================================================ */

/* ── Constants ─────────────────────────────────────────────── */
const SEAT_PRICES  = { standard: 100000, vip: 150000, sweetbox: 200000 };
const BOOKED_SEATS = [];
const LOCKED_SEATS = [];
const SHOWTIMES    = ['09:15','11:30','14:00','16:30','19:00','21:30'];
const HALLS        = ['P.1 – 4K','P.2 – IMAX','P.3 – Dolby','P.4 – VIP','P.5 – 4DX','P.2 – IMAX'];
const CAST_AVATARS = [
  'https://i.pravatar.cc/60?img=1',
  'https://i.pravatar.cc/60?img=2',
  'https://i.pravatar.cc/60?img=3',
  'https://i.pravatar.cc/60?img=4',
  'https://i.pravatar.cc/60?img=5',
];

const SAMPLE_REVIEWS = [
  { name:'Minh Tuấn', rating:5, text:'Tuyệt vời! Một bộ phim xuất sắc, không thể bỏ lỡ. Hiệu ứng hình ảnh đỉnh cao!', date:'01/03/2025', initial:'MT' },
  { name:'Thu Hà',    rating:4, text:'Phim hay, câu chuyện hấp dẫn. Chỉ tiếc là kết thúc hơi vội. Sẽ xem lại lần 2!', date:'28/02/2025', initial:'TH' },
  { name:'Quang Vinh',rating:5, text:'Đỉnh của đỉnh! Diễn xuất siêu thực, đạo diễn thiên tài. 10/10!',                 date:'25/02/2025', initial:'QV' },
];

/* ── State ─────────────────────────────────────────────────── */
let movie          = null;
let selectedSeats  = new Set();
let selectedShow   = null;
let userRating     = 0;
let reviews        = [...SAMPLE_REVIEWS];

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const id = parseInt(getParam('id')) || 1;
  const allMovies = await getMoviesAsync();
  movie = allMovies.find(m => m.id === id) || allMovies[0];

  populateHero();
  populateCast();
  renderReviews();
  updateShowtimes();
});

/* ── Populate hero section ─────────────────────────────────── */
function populateHero() {
  document.getElementById('heroBg').style.backgroundImage  = `url(${movie.poster})`;
  document.getElementById('mainPoster').src                = movie.poster;
  document.getElementById('movieTitle').textContent        = movie.title;
  document.getElementById('breadcrumbTitle').textContent   = movie.title;
  document.getElementById('imdbBadge').textContent         = `IMDb ${movie.rating}`;
  document.getElementById('movieStars').textContent        = '★'.repeat(Math.round(movie.rating / 2)) + '☆'.repeat(5 - Math.round(movie.rating / 2));
  document.getElementById('voteCount').textContent         = `(${(Math.floor(Math.random() * 800) + 200).toLocaleString()} lượt)`;
  document.getElementById('movieDesc').textContent         = movie.desc;

  // Info row
  document.getElementById('infoRow').innerHTML = [
    { label: 'Năm',        value: movie.year      },
    { label: 'Thời Lượng', value: movie.duration  },
    { label: 'Giới Hạn',   value: movie.rated     },
    { label: 'Ngôn Ngữ',   value: movie.lang      },
    { label: 'Đạo Diễn',   value: movie.director  },
  ].map(i => `
    <div class="info-item">
      <div class="info-item__label">${i.label}</div>
      <div class="info-item__value">${i.value}</div>
    </div>`).join('');

  // Tags
  const badgeMap = { HOT:'badge--hot', NEW:'badge--new' };
  document.getElementById('movieTags').innerHTML = `
    <span class="tag">${movie.genreLabel || movie.genre}</span>
    <span class="tag">${movie.duration}</span>
    <span class="tag tag--age">${movie.rated}</span>
    ${movie.badge ? `<span class="tag tag--hot badge ${badgeMap[movie.badge]||''}">${movie.badge}</span>` : ''}
  `;
}

/* ── Populate cast ─────────────────────────────────────────── */
function populateCast() {
  const castRow = document.getElementById('castRow');
  if (!castRow) return;
  castRow.innerHTML = (movie.cast || []).map((name, i) => `
    <div class="cast-card">
      <img class="cast-avatar" src="${CAST_AVATARS[i] || CAST_AVATARS[0]}" alt="${name}">
      <div class="cast-name">${name}</div>
      <div class="cast-role">Diễn viên</div>
    </div>`).join('');
}

/* ── Reviews ───────────────────────────────────────────────── */
function renderReviews() {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-avatar">${r.initial}</div>
        <div>
          <div class="reviewer-name">${r.name}</div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      </div>
      <div class="review-text">${r.text}</div>
    </div>`).join('');
}

function setRating(n) {
  userRating = n;
  document.querySelectorAll('#starInput span').forEach((s, i) =>
    s.classList.toggle('active', i < n)
  );
}

function submitReview() {
  const text = document.getElementById('reviewText').value.trim();
  if (!text || !userRating) {
    showToast('Vui lòng chọn số sao và viết nhận xét!', 'warning');
    return;
  }
  reviews.unshift({
    name: 'Bạn', rating: userRating, text,
    date: new Date().toLocaleDateString('vi-VN'), initial: 'B',
  });
  renderReviews();
  document.getElementById('reviewText').value = '';
  setRating(0);
  showToast('Cảm ơn bạn đã đánh giá! ⭐', 'success');
}

/* ── Showtimes ─────────────────────────────────────────────── */
function updateShowtimes() {
  const grid = document.getElementById('showtimeGrid');
  if (!grid) return;
  selectedShow = null;
  document.getElementById('bookNowBtn').disabled = true;

  grid.innerHTML = SHOWTIMES.map((t, i) => `
    <div class="showtime-btn" onclick="selectShowtime(this,'${t}','${HALLS[i]}')">
      <div class="showtime-btn__time">${t}</div>
      <div class="showtime-btn__hall">${HALLS[i]}</div>
    </div>`).join('');
}

function selectShowtime(el, time, hall) {
  document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedShow = { time, hall };
  document.getElementById('bookNowBtn').disabled = false;
}

/* ── Realtime & Queue Management (Socket.io Backend Port 4000) ── */
const SOCKET_SERVER_URL = 'http://127.0.0.1:4000';
let realtimePollInterval = null;
let holdTimerInterval    = null;
let holdRemainingSeconds = 300; // 5 minutes (300 seconds)

function getClientId() {
  let id = sessionStorage.getItem('cv_client_id');
  if (!id) {
    id = 'cli_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('cv_client_id', id);
  }
  return id;
}

/* ── Seat Modal Open / Close ───────────────────────────────── */
function openSeatModal() {
  if (!selectedShow) {
    const first = document.querySelector('.showtime-btn');
    if (first) selectShowtime(first, SHOWTIMES[0], HALLS[0]);
  }
  document.getElementById('modalInfo').textContent =
    `${movie.title} • ${selectedShow?.time || '19:00'} • ${selectedShow?.hall || 'Phòng 2'}`;

  if (!document.getElementById('seatGrid').children.length) buildSeatGrid();

  // Start Realtime Session sync
  syncRealtimeRoomState();
  clearInterval(realtimePollInterval);
  realtimePollInterval = setInterval(syncRealtimeRoomState, 1500);
}

function closeSeatModal() {
  document.getElementById('seatModal').classList.remove('open');
  document.getElementById('waitingModal').classList.remove('open');
  document.body.style.overflow = '';
  clearInterval(realtimePollInterval);

  // Notify server of room exit
  const clientId = getClientId();
  fetch(`${SOCKET_SERVER_URL}/api/realtime/leave-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ showtimeId: '1', clientId }),
  }).catch(() => {});
}

function closeWaitingModal() {
  closeSeatModal();
}

/* ── Sync Room State from Socket Server ────────────────────── */
async function syncRealtimeRoomState() {
  const user     = getCurrentUser();
  const userName = user?.name || 'Khách';
  const clientId = getClientId();

  try {
    const res = await fetch(`${SOCKET_SERVER_URL}/api/realtime/room-state?showtimeId=1&clientId=${clientId}&userName=${encodeURIComponent(userName)}`);
    if (!res.ok) return;
    const data = await res.json();

    // Check Capacity / Queue Status
    if (data.status === 'queued') {
      document.getElementById('seatModal').classList.remove('open');
      document.getElementById('waitingModal').classList.add('open');
      document.getElementById('queuePosText').textContent = `#${data.queuePosition || 1}`;
      document.body.style.overflow = 'hidden';
      return;
    }

    // Admitted to seat selection screen
    document.getElementById('waitingModal').classList.remove('open');
    document.getElementById('seatModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    // Update Live Viewer Count
    const vEl = document.getElementById('viewerCount');
    if (vEl) vEl.textContent = data.activeViewerCount || 1;

    // Update Seat States Realtime
    updateSeatGridStates(data.seatStates || {}, data.expiredSeats || []);

  } catch (err) {
    console.warn('[Realtime Sync] Server connecting...', err);
  }
}

/* ── Update Grid Seat Elements ────────────────────────────── */
function updateSeatGridStates(seatStates, expiredSeats) {
  const myClientId = getClientId();

  // If my held seats expired from 5-minute timeout
  expiredSeats.forEach(sid => {
    if (selectedSeats.has(sid)) {
      selectedSeats.delete(sid);
      showToast(`⚠️ Ghế ${sid} đã hết 5 phút giữ chỗ và tự động bị hủy!`, 'warning');
    }
  });

  document.querySelectorAll('.seat').forEach(seatEl => {
    const sid = seatEl.dataset.id;
    const state = seatStates[sid];

    // Reset lock classes
    seatEl.classList.remove('seat--locked-other');

    if (state) {
      if (state.status === 'booked') {
        seatEl.classList.add('seat--booked');
        seatEl.title = `${sid} (Đã mua)`;
      } else if (state.status === 'locked') {
        if (state.lockedBy === myClientId) {
          // Seat locked by ME
          seatEl.classList.add('seat--selected');
          selectedSeats.add(sid);
        } else {
          // Seat locked by ANOTHER user
          seatEl.classList.add('seat--locked-other');
          seatEl.title = `${sid} (Đang được giữ bởi ${state.userName} - còn ${state.remainingSeconds}s)`;
        }
      }
    } else {
      if (!selectedSeats.has(sid)) {
        seatEl.classList.remove('seat--selected', 'seat--booked');
      }
    }
  });

  updateOrderSummary();
}

/* ── Build seat grid ───────────────────────────────────────── */
function buildSeatGrid() {
  const rows = [
    { label: 'A', count: 10, type: 'standard' },
    { label: 'B', count: 10, type: 'standard' },
    { label: 'C', count: 10, type: 'standard' },
    { label: 'D', count: 10, type: 'vip'      },
    { label: 'E', count: 10, type: 'vip'      },
    { label: 'F', count:  8, type: 'sweetbox', paired: true },
  ];

  const grid = document.getElementById('seatGrid');
  grid.innerHTML = '';

  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    rowEl.innerHTML = `<div class="row-label">${row.label}</div>`;

    for (let i = 1; i <= row.count; i++) {
      if (!row.paired && i === 6) {
        const gap = document.createElement('div');
        gap.className = 'seat-gap';
        rowEl.appendChild(gap);
      }
      if (row.paired && i > 1 && i % 2 === 1) {
        const gap = document.createElement('div');
        gap.className = 'seat-gap';
        rowEl.appendChild(gap);
      }

      const seatId = `${row.label}${i}`;
      const seat   = document.createElement('div');
      seat.className = `seat seat--${row.type}`;
      seat.dataset.id   = seatId;
      seat.dataset.type = row.type;
      seat.title        = seatId;

      seat.addEventListener('click', () => toggleSeatRealtime(seat, seatId, row.type));

      rowEl.appendChild(seat);
    }
    grid.appendChild(rowEl);
  });
}

/* ── Toggle Seat Realtime ──────────────────────────────────── */
async function toggleSeatRealtime(el, id, type) {
  if (el.classList.contains('seat--booked') || el.classList.contains('seat--locked-other')) {
    showToast('Ghế này hiện không thể chọn!', 'warning');
    return;
  }

  const clientId = getClientId();
  const user = getCurrentUser();
  const userName = user?.name || 'Khách';

  if (selectedSeats.has(id)) {
    // Deselect Seat
    selectedSeats.delete(id);
    el.classList.remove('seat--selected');
    fetch(`${SOCKET_SERVER_URL}/api/realtime/deselect-seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showtimeId: '1', seatId: id, clientId }),
    }).catch(() => {});
  } else {
    // Select Seat
    if (selectedSeats.size >= 8) {
      showToast('Tối đa 8 ghế mỗi lần đặt!', 'warning');
      return;
    }
    selectedSeats.add(id);
    el.classList.add('seat--selected');

    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/realtime/select-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: '1', seatId: id, clientId, userName }),
      });
      const data = await res.json();
      if (!data.success) {
        selectedSeats.delete(id);
        el.classList.remove('seat--selected');
        showToast(data.message || 'Không thể chọn ghế này', 'warning');
        return;
      }
    } catch (err) {
      console.warn('Seat select error:', err);
    }
  }

  updateOrderSummary();
  manage5MinHoldTimer();
}

/* ── Manage 5-Minute Hold Timer ────────────────────────────── */
function manage5MinHoldTimer() {
  const timerBar = document.getElementById('holdTimerBar');

  if (selectedSeats.size === 0) {
    clearInterval(holdTimerInterval);
    if (timerBar) timerBar.style.display = 'none';
    localStorage.removeItem('cv_hold_start');
    return;
  }

  if (timerBar) timerBar.style.display = 'flex';

  if (!localStorage.getItem('cv_hold_start')) {
    localStorage.setItem('cv_hold_start', Date.now());
  }

  clearInterval(holdTimerInterval);
  holdTimerInterval = setInterval(updateTimerDisplay, 1000);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const start = parseInt(localStorage.getItem('cv_hold_start') || Date.now());
  const elapsed = Math.floor((Date.now() - start) / 1000);
  const remaining = Math.max(0, 300 - elapsed);

  const displayEl = document.getElementById('timerDisplay');
  const timerBar = document.getElementById('holdTimerBar');

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  if (displayEl) displayEl.textContent = `${mins}:${secs}`;

  if (timerBar) {
    if (remaining < 60) timerBar.classList.add('urgent');
    else timerBar.classList.remove('urgent');
  }

  // 5 Minutes Expired -> Cancel Transaction & Release Seats
  if (remaining <= 0) {
    clearInterval(holdTimerInterval);
    const clientId = getClientId();

    selectedSeats.forEach(sid => {
      fetch(`${SOCKET_SERVER_URL}/api/realtime/deselect-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: '1', seatId: sid, clientId }),
      }).catch(() => {});
    });

    selectedSeats.clear();
    localStorage.removeItem('cv_hold_start');
    if (timerBar) timerBar.style.display = 'none';

    document.querySelectorAll('.seat.seat--selected').forEach(s => s.classList.remove('seat--selected'));
    updateOrderSummary();
    showToast('⚠️ Hết 5 phút giữ ghế! Giao dịch của bạn đã tự động bị hủy.', 'warning');
  }
}

/* ── Order summary ─────────────────────────────────────────── */
function updateOrderSummary() {
  let std = 0, vip = 0, sweet = 0;
  selectedSeats.forEach(id => {
    const row = id[0];
    if      (['A','B','C'].includes(row)) std++;
    else if (['D','E'].includes(row))     vip++;
    else                                  sweet++;
  });

  const total = std * SEAT_PRICES.standard + vip * SEAT_PRICES.vip + sweet * SEAT_PRICES.sweetbox;

  const seatsDisplay = document.getElementById('selectedSeatsDisplay');
  if (seatsDisplay) seatsDisplay.textContent = selectedSeats.size ? [...selectedSeats].join(', ') : 'Chưa chọn';

  const setVisible = (id, show) => { const el = document.getElementById(id); if (el) el.style.display = show ? 'flex' : 'none'; };
  setVisible('standardRow', std > 0);
  setVisible('vipRow',      vip > 0);
  setVisible('sweetRow',    sweet > 0);

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('stdCount',  std);
  setText('vipCount',  vip);
  setText('sweetCount',sweet);
  setText('stdPrice',  formatVND(std   * SEAT_PRICES.standard));
  setText('vipPrice',  formatVND(vip   * SEAT_PRICES.vip));
  setText('sweetPrice',formatVND(sweet * SEAT_PRICES.sweetbox));
  setText('totalPrice',formatVND(total));

  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) confirmBtn.disabled = selectedSeats.size === 0;

  // Persist for booking page
  localStorage.setItem('cv_booking_seats', JSON.stringify([...selectedSeats]));
  localStorage.setItem('cv_booking_total', total);
  localStorage.setItem('cv_booking_movie', JSON.stringify({
    title:    movie.title,
    poster:   movie.poster,
    showtime: selectedShow || { time: '19:00', hall: 'Phòng 2' },
    duration: movie.duration,
    date:     document.getElementById('dateSelect')?.value || '',
  }));
}

/* ── Proceed to booking page ───────────────────────────────── */
function proceedToBooking() {
  if (selectedSeats.size === 0) return;

  const user = getCurrentUser();
  if (!user) {
    showToast('⚠️ Vui lòng đăng nhập tài khoản để tiếp tục đặt vé!', 'warning');
    setTimeout(() => {
      window.location.href = `auth.html?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    }, 1200);
    return;
  }

  window.location.href = 'booking.html';
}

/* ── Notification popup (page-level) ──────────────────────── */
function showNotifPopup(msg, type = '') {
  const n = document.getElementById('notifPopup');
  if (!n) return;
  n.textContent = msg;
  n.className = `notif-popup ${type ? 'notif-popup--' + type : ''} show`;
  clearTimeout(n._timer);
  n._timer = setTimeout(() => n.classList.remove('show'), 3000);
}

/* ── Close modal on backdrop click ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('seatModal');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeSeatModal();
    });
  }
});

