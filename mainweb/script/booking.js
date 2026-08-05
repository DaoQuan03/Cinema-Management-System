/* ============================================================
   BOOKING.JS — Payment / Checkout Logic
   ============================================================ */

const PROMO_CODES = { 'WED30': 0.30, 'CINEMA10': 0.10, 'NEWUSER': 0.15, 'VIP20': 0.20 };

let promoDiscount       = 0;
let selectedPayment     = 'card';
let bookingSeats        = [];
let bookingBaseTotal    = 0;
let bookingMovie        = {};

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Load data from previous page
  bookingSeats     = JSON.parse(localStorage.getItem('cv_booking_seats') || '["D4","D5","E3"]');
  bookingBaseTotal = parseInt(localStorage.getItem('cv_booking_total')  || '450000');
  bookingMovie     = JSON.parse(localStorage.getItem('cv_booking_movie') || JSON.stringify({
    title: 'Inception 2',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    showtime: { time: '19:00', hall: 'Phòng 2' },
    duration: '2h 28m',
    date: 'Thứ 4, 12/03/2025',
  }));

  populateSummary();
  renderOrderRows();
  addPromoEnterListener();
});

/* ── Populate order summary sidebar ───────────────────────── */
function populateSummary() {
  const posterEl = document.getElementById('summaryPoster');
  const titleEl  = document.getElementById('summaryTitle');
  const metaEl   = document.getElementById('summaryMeta');
  const tagsEl   = document.getElementById('seatTagsDisplay');

  if (posterEl) posterEl.src = bookingMovie.poster;
  if (titleEl)  titleEl.textContent = bookingMovie.title;
  if (metaEl)   metaEl.innerHTML = `
    📅 ${bookingMovie.date || bookingMovie.showtime?.date || ''}<br>
    🕐 ${bookingMovie.showtime?.time || '19:00'} • ${bookingMovie.showtime?.hall || 'Phòng 2'}<br>
    ⏱ ${bookingMovie.duration}`;

  if (tagsEl) {
    tagsEl.innerHTML = bookingSeats.map(s =>
      `<div class="seat-tag">${s}</div>`
    ).join('');
  }
}

/* ── Render order rows ─────────────────────────────────────── */
function renderOrderRows() {
  const { base, discount, final } = calcTotal();
  let std = 0, vip = 0, sweet = 0;

  bookingSeats.forEach(id => {
    const row = id[0];
    if      (['A','B','C'].includes(row)) std++;
    else if (['D','E'].includes(row))     vip++;
    else                                  sweet++;
  });

  let html = '';
  if (std)   html += `<div class="order-row"><span class="label">Standard × ${std}</span><span>${formatVND(std   * 100000)}</span></div>`;
  if (vip)   html += `<div class="order-row"><span class="label">VIP × ${vip}</span><span>${formatVND(vip   * 150000)}</span></div>`;
  if (sweet) html += `<div class="order-row"><span class="label">Sweetbox × ${sweet}</span><span>${formatVND(sweet * 200000)}</span></div>`;
  html += `<div class="order-row"><span class="label">Phí dịch vụ</span><span>0đ</span></div>`;

  if (discount > 0) {
    html += `<div class="order-row order-row--discount"><span class="label">Giảm giá (${Math.round(promoDiscount * 100)}%)</span><span>-${formatVND(discount)}</span></div>`;
  }

  const rowsEl = document.getElementById('orderRows');
  const totalEl = document.getElementById('finalTotal');
  const btnTextEl = document.getElementById('payBtnText');

  if (rowsEl)    rowsEl.innerHTML = html;
  if (totalEl)   totalEl.textContent = formatVND(final);
  if (btnTextEl) btnTextEl.textContent = `Thanh Toán ${formatVND(final)}`;
}

/* ── Calc total ────────────────────────────────────────────── */
function calcTotal() {
  const base     = bookingBaseTotal;
  const discount = Math.round(base * promoDiscount);
  return { base, discount, final: base - discount };
}

/* ── Apply promo code ──────────────────────────────────────── */
function applyPromo() {
  const code  = (document.getElementById('promoInput')?.value || '').trim().toUpperCase();
  const msgEl = document.getElementById('promoMsg');

  if (PROMO_CODES[code]) {
    promoDiscount = PROMO_CODES[code];
    if (msgEl) {
      msgEl.style.color = 'var(--green)';
      msgEl.textContent = `✓ Áp dụng thành công! Giảm ${Math.round(promoDiscount * 100)}% tổng đơn hàng.`;
    }
    renderOrderRows();
  } else {
    if (msgEl) {
      msgEl.style.color = 'var(--red)';
      msgEl.textContent = '✕ Mã không hợp lệ hoặc đã hết hạn.';
    }
  }
}

function addPromoEnterListener() {
  const inp = document.getElementById('promoInput');
  if (inp) inp.addEventListener('keypress', e => { if (e.key === 'Enter') applyPromo(); });
}

/* ── Select payment method ─────────────────────────────────── */
function selectPayment(el, method) {
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  selectedPayment = method;

  const cardForm = document.getElementById('cardForm');
  const infoBox  = document.getElementById('paymentInfoBox');

  const infos = {
    momo:     '📱 Quét mã QR bằng app MoMo hoặc nhập số điện thoại MoMo để thanh toán.',
    banking:  '🏦 Chuyển khoản: <strong>1234567890</strong> – Vietcombank – CineVerse JSC<br>Nội dung: <strong>CINEVERSE + số điện thoại</strong>',
    vnpay:    '🔵 Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.',
    zalopay:  '🟢 Nhập số điện thoại Zalo để thanh toán nhanh.',
    counter:  '🏪 Mang mã đặt chỗ đến quầy vé và thanh toán tiền mặt trong vòng 30 phút.',
  };

  if (method === 'card') {
    if (cardForm) cardForm.classList.add('show');
    if (infoBox)  infoBox.style.display = 'none';
  } else {
    if (cardForm) cardForm.classList.remove('show');
    if (infoBox) {
      infoBox.style.display = 'block';
      infoBox.innerHTML     = infos[method] || '';
    }
  }
}

/* ── Card number formatter ─────────────────────────────────── */
function formatCardNumber(input) {
  const v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(\d{4})/g, '$1 ').trim();

  const iconEl = document.getElementById('cardIcon');
  if (!iconEl) return;
  if (v.startsWith('4')) iconEl.textContent = '💙'; // Visa
  else if (v.startsWith('5')) iconEl.textContent = '🔴'; // Mastercard
  else iconEl.textContent = '💳';
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
  input.value = v;
}

/* ── Process payment ───────────────────────────────────────── */
function processPayment() {
  const name  = document.getElementById('fullname')?.value.trim();
  const email = document.getElementById('email')?.value.trim();

  if (!name || !email) {
    showToast('Vui lòng nhập đầy đủ thông tin liên hệ!', 'warning');
    return;
  }

  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('show');

  setTimeout(() => {
    if (overlay) overlay.classList.remove('show');
    showSuccess(name, email);
  }, 2500);
}

/* ── Show success screen ───────────────────────────────────── */
function showSuccess(name, email) {
  const { final } = calcTotal();
  const ticketId  = generateTicketId();

  const tidEl  = document.getElementById('ticketId');
  const infEl  = document.getElementById('ticketInfo');
  const ovEl   = document.getElementById('successOverlay');

  if (tidEl) tidEl.textContent = ticketId;
  if (infEl) infEl.innerHTML = `
    <strong style="color:var(--text)">${bookingMovie.title}</strong><br>
    🕐 ${bookingMovie.showtime?.time || '19:00'} • ${bookingMovie.showtime?.hall || 'Phòng 2'}<br>
    🪑 Ghế: ${bookingSeats.join(', ')}<br>
    💰 Đã thanh toán: ${formatVND(final)}<br>
    📧 Vé gửi đến: ${email}
  `;

  if (ovEl) ovEl.classList.add('show');

  // Save ticket
  localStorage.setItem('cv_last_ticket', JSON.stringify({
    id: ticketId, movie: bookingMovie.title,
    seats: bookingSeats, total: final, email, name,
  }));

  // Realtime payment notification
  setTimeout(() => showToast('✅ Thanh toán hoàn tất! Vé đã được gửi qua email.', 'success'), 500);
}

/* ── Download ticket (mock) ────────────────────────────────── */
function downloadTicket() {
  showToast('⬇ Đang tải vé PDF...', 'success');
}
