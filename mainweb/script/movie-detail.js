/* ============================================================
   MOVIE-DETAIL.JS — Movie Detail, Showtimes & Seat Selection
   ============================================================ */

/* ── Constants ─────────────────────────────────────────────── */
const SEAT_PRICES  = { standard: 100000, vip: 150000, sweetbox: 200000 };
const BOOKED_SEATS = ['A2','A3','B5','B6','C1','C4','D3','D7','E2','E8','F5'];
const LOCKED_SEATS = ['C5','C6','D5'];
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

/* ── Seat Modal ────────────────────────────────────────────── */
function openSeatModal() {
  if (!selectedShow) {
    const first = document.querySelector('.showtime-btn');
    if (first) selectShowtime(first, SHOWTIMES[0], HALLS[0]);
  }
  document.getElementById('modalInfo').textContent =
    `${movie.title} • ${selectedShow?.time || '19:00'} • ${selectedShow?.hall || 'Phòng 2'}`;

  document.getElementById('seatModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!document.getElementById('seatGrid').children.length) buildSeatGrid();

  selectedSeats.clear();
  updateOrderSummary();
  startRealtimeSimulation();
}

function closeSeatModal() {
  document.getElementById('seatModal').classList.remove('open');
  document.body.style.overflow = '';
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
      // Aisle gap in middle
      if (!row.paired && i === 6) {
        const gap = document.createElement('div');
        gap.className = 'seat-gap';
        rowEl.appendChild(gap);
      }

      // For sweetbox: pair gap every 2 seats
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

      if (BOOKED_SEATS.includes(seatId)) {
        seat.classList.add('seat--booked');
      } else if (LOCKED_SEATS.includes(seatId)) {
        seat.classList.add('seat--locked');
      } else {
        seat.addEventListener('click', () => toggleSeat(seat, seatId, row.type));
      }

      rowEl.appendChild(seat);
    }

    grid.appendChild(rowEl);
  });
}

/* ── Toggle seat selection ─────────────────────────────────── */
function toggleSeat(el, id, type) {
  if (selectedSeats.has(id)) {
    selectedSeats.delete(id);
    el.classList.remove('seat--selected');
  } else {
    if (selectedSeats.size >= 8) {
      showToast('Tối đa 8 ghế mỗi lần đặt!', 'warning');
      return;
    }
    selectedSeats.add(id);
    el.classList.add('seat--selected');
  }
  updateOrderSummary();
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

/* ── Realtime viewer simulation ────────────────────────────── */
let realtimeInterval = null;
function startRealtimeSimulation() {
  clearInterval(realtimeInterval);
  const counts = [3, 4, 2, 5, 3, 6, 2];
  let i = 0;
  realtimeInterval = setInterval(() => {
    const el = document.getElementById('viewerCount');
    if (el) el.textContent = counts[i++ % counts.length];
  }, 3000);
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
