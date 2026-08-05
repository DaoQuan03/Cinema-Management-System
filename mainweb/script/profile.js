/* ============================================================
   PROFILE.JS — Dashboard / Profile Page Logic
   ============================================================ */

const MOCK_TICKETS = [
  { title:"Inception 2",           poster:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80", date:"12/03/2025 19:00", seat:"D4, D5",     price:"300,000đ", status:"Đã xem",    badgeCls:"badge--success" },
  { title:"Avengers: Endgame 2",   poster:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&q=80", date:"05/03/2025 21:30", seat:"A3, A4",     price:"200,000đ", status:"Đã xem",    badgeCls:"badge--success" },
  { title:"Dune: Part Three",      poster:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80", date:"20/03/2025 16:30", seat:"F1, F2",     price:"400,000đ", status:"Sắp chiếu", badgeCls:"badge--blue"    },
  { title:"The Dark Knight Returns",poster:"https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=100&q=80",date:"25/03/2025 14:00", seat:"E5, E6, E7", price:"450,000đ", status:"Sắp chiếu", badgeCls:"badge--blue"    },
];

document.addEventListener('DOMContentLoaded', () => {

  loadUser();
  renderRecentTickets();
  renderTicketsTable();
  renderMoviesManage();
  renderRevenueChart();

  // Check if just came from a booking
  const lastTicket = JSON.parse(localStorage.getItem('cv_last_ticket') || 'null');
  if (lastTicket) {
    MOCK_TICKETS.unshift({
      title: lastTicket.movie,
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80',
      date: 'Vừa đặt',
      seat: (lastTicket.seats || []).join(', '),
      price: formatVND(lastTicket.total || 0),
      status: 'Mới đặt',
      badgeCls: 'badge--warning',
    });
  }
});

/* ── Load user data ────────────────────────────────────────── */
function loadUser() {
  const user = getCurrentUser() || { name: 'Nguyễn Văn An', email: 'user@example.com', role: 'admin' };

  const initial = user.name ? user.name[0].toUpperCase() : 'U';
  const roleLabels = { admin: 'Admin 👑', staff: 'Nhân viên ⚙️', user: 'Thành viên ⭐' };

  setText('sidebarAvatar',   initial);
  setText('sidebarName',     user.name);
  setText('sidebarRole',     roleLabels[user.role] || 'Thành viên');
  setText('bigAvatar',       initial);
  setText('avatarName',      user.name);
  setText('avatarRole',      roleLabels[user.role] || '');

  const nameInp  = document.getElementById('profileName');
  const emailInp = document.getElementById('profileEmail');
  if (nameInp)  nameInp.value  = user.name;
  if (emailInp) emailInp.value = user.email;

  // Show admin stats and nav if admin/staff
  if (user.role === 'admin' || user.role === 'staff') {
    const adminStats = document.getElementById('adminStats');
    if (adminStats) adminStats.style.display = '';
  }
}

/* ── Recent tickets (dashboard) ────────────────────────────── */
function renderRecentTickets() {
  const el = document.getElementById('recentTickets');
  if (!el) return;
  el.innerHTML = MOCK_TICKETS.slice(0, 4).map(t => `
    <div class="ticket-item">
      <div class="ticket-poster"><img src="${t.poster}" alt="${t.title}"></div>
      <div class="ticket-info">
        <div class="ticket-info__title">${t.title}</div>
        <div class="ticket-info__meta">📅 ${t.date} • 🪑 ${t.seat}</div>
      </div>
      <span class="badge ${t.badgeCls}">${t.status}</span>
      <div class="ticket-price">${t.price}</div>
    </div>`).join('');
}

/* ── Full tickets table ─────────────────────────────────────── */
function renderTicketsTable() {
  const tbody = document.getElementById('ticketsTableBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_TICKETS.map(t => `
    <tr>
      <td>${t.title}</td>
      <td>${t.date}</td>
      <td>${t.seat}</td>
      <td style="color:var(--gold);font-weight:600;">${t.price}</td>
      <td><span class="badge ${t.badgeCls}">${t.status}</span></td>
      <td>
        <button onclick="cancelTicket(this)" style="background:none;border:1px solid rgba(232,69,69,.3);color:var(--red);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">Hủy</button>
      </td>
    </tr>`).join('');
}

function cancelTicket(btn) {
  if (confirm('Xác nhận hủy vé này?')) {
    btn.closest('tr').style.opacity = '0.4';
    btn.textContent = 'Đã hủy';
    btn.disabled = true;
    showToast('Vé đã được hủy thành công.', 'success');
  }
}

/* ── Movies management table ───────────────────────────────── */
function renderMoviesManage() {
  const tbody = document.getElementById('moviesManageBody');
  if (!tbody) return;
  const movies = getMovies();
  tbody.innerHTML = movies.map(m => `
    <tr>
      <td><strong>${m.title}</strong></td>
      <td>${m.genreLabel || m.genre}</td>
      <td>★ ${m.rating}</td>
      <td>${m.duration}</td>
      <td><span class="badge badge--success">Đang chiếu</span></td>
      <td>
        <span class="action-icon action-icon--edit" onclick="editMovie(${m.id})" title="Chỉnh sửa">✏️</span>
        <span class="action-icon action-icon--del"  onclick="deleteMovie(${m.id})" title="Xóa">🗑</span>
      </td>
    </tr>`).join('');
}

function editMovie(id) {
  const movie = getMovies().find(m => m.id === id);
  if (movie) showToast(`Đang chỉnh sửa: ${movie.title}`, 'success');
}

function deleteMovie(id) {
  const movie = getMovies().find(m => m.id === id);
  if (movie && confirm(`Xác nhận ngừng chiếu phim "${movie.title}"?`)) {
    showToast(`Đã ngừng chiếu: ${movie.title}`, 'warning');
    // In production: remove from DB and re-render
  }
}

function showAddMovieForm() {
  showToast('Mở form thêm phim mới... (chức năng đầy đủ cần backend)', 'success');
}

/* ── Revenue chart ─────────────────────────────────────────── */
function renderRevenueChart() {
  const chartEl = document.getElementById('revenueChart');
  if (!chartEl) return;
  const data     = [1.8, 2.1, 2.8, 1.9, 2.3, 2.4];
  const maxVal   = Math.max(...data);
  chartEl.innerHTML = data.map(v => `
    <div class="bar-wrap">
      <div class="bar-value">${v}tỷ</div>
      <div class="bar" style="height:${(v / maxVal * 100)}%;"></div>
    </div>`).join('');
}

/* ── Panel switching ───────────────────────────────────────── */
function showPanel(name, triggerEl) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');

  if (triggerEl) triggerEl.classList.add('active');

  const labels = {
    dashboard:       'Tổng Quan',
    tickets:         'Vé Của Tôi',
    profile:         'Thông Tin Cá Nhân',
    'movies-manage': 'Quản Lý Phim',
    halls:           'Phòng Chiếu',
    schedules:       'Lịch Chiếu',
    revenue:         'Doanh Thu',
    scanner:         'Quét QR',
    sold:            'Vé Đã Bán',
  };

  const crumbEl = document.getElementById('currentPageLabel');
  if (crumbEl) crumbEl.textContent = labels[name] || name;
}

/* ── Save profile ──────────────────────────────────────────── */
function saveProfile() {
  const user = getCurrentUser() || {};
  user.name  = document.getElementById('profileName')?.value || user.name;
  user.email = document.getElementById('profileEmail')?.value || user.email;
  setCurrentUser(user);

  setText('sidebarName',  user.name);
  setText('bigAvatar',    user.name[0].toUpperCase());
  setText('sidebarAvatar',user.name[0].toUpperCase());
  setText('avatarName',   user.name);

  showToast('✓ Đã lưu thông tin cá nhân!', 'success');
}

/* ── QR scanner ────────────────────────────────────────────── */
function scanQR() {
  const code   = (document.getElementById('qrInput')?.value || '').trim().toUpperCase();
  const result = document.getElementById('qrResult');
  if (!result) return;

  if (!code) {
    result.className  = 'qr-result qr-result--error show';
    result.innerHTML  = '<span style="color:var(--red)">Vui lòng nhập mã vé!</span>';
    return;
  }

  if (code.startsWith('CVE-2025-') || code.startsWith('CVE-')) {
    result.className = 'qr-result show';
    result.innerHTML = `
      <div style="color:var(--green);font-size:20px;font-weight:700;margin-bottom:8px;">✓ Check-in Thành Công!</div>
      <div style="font-size:14px;color:var(--muted);">
        Mã vé: <strong style="color:var(--gold)">${code}</strong><br>
        Phim: Inception 2 – 19:00 Phòng 2<br>
        Ghế: D4, D5<br>
        Khách: Nguyễn Văn An
      </div>`;
  } else {
    result.className = 'qr-result qr-result--error show';
    result.innerHTML = `
      <div style="color:var(--red);font-size:16px;font-weight:700;">✕ Mã vé không hợp lệ!</div>
      <div style="font-size:13px;color:var(--muted);margin-top:4px;">Vui lòng kiểm tra lại.</div>`;
  }
}

/* ── Logout ────────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}

/* ── Utility ───────────────────────────────────────────────── */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
