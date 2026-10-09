/* ════════════════════════════════════════════════════
   CinéLux — app.js
   State, dữ liệu mẫu, Auth, Navigation, Modal, Toast
   ════════════════════════════════════════════════════ */

// ─── STATE ─────────────────────────────────────────
const state = {
  currentUser: null,
  currentPage: 'dashboard',
  selectedFilm: null,
  selectedShowtime: null,
  selectedSeats: [],
  bookingData: {}
};

// ─── DYNAMIC STATE & DATA COLLECTIONS ────────────────
let movies = [];
let tickets = [];
let reviews = [];

const INITIAL_MOVIES = [
  {id:1,emoji:'🦸',title:'Avengers: Secret Wars',genre:'Action',duration:155,rating:9.2,startDate:'20/02/2026',status:'active',c1:'#1a0a2e',c2:'#3d1f5e'},
  {id:2,emoji:'🌊',title:'Biển Khát',genre:'Thriller',duration:112,rating:7.8,startDate:'15/02/2026',status:'active',c1:'#0a1a2e',c2:'#1a3a5e'},
  {id:3,emoji:'👻',title:'Quỷ Nhập Tràng',genre:'Horror',duration:105,rating:8.1,startDate:'10/02/2026',status:'active',c1:'#1a0a0a',c2:'#3a1a1a'},
  {id:4,emoji:'❤️',title:'Tình Yêu Mùa Đông',genre:'Romantic',duration:98,rating:7.4,startDate:'01/02/2026',status:'active',c1:'#2e0a1a',c2:'#5e1a3a'},
  {id:5,emoji:'😂',title:'Bố Già 2',genre:'Comedy',duration:118,rating:8.5,startDate:'07/02/2026',status:'active',c1:'#1a2e0a',c2:'#3a5e1a'},
  {id:6,emoji:'🚀',title:'Interstellar 2',genre:'Sci-Fi',duration:170,rating:9.0,startDate:'01/03/2026',status:'upcoming',c1:'#0a1a1a',c2:'#1a3a3a'},
];

const INITIAL_ROOMS = [
  {id:1, name:'Phòng 1 - IMAX', room_type:'IMAX', total_seats:300, status:'Hoạt động', usage_pct:85},
  {id:2, name:'Phòng 2 - 4DX', room_type:'4DX', total_seats:120, status:'Hoạt động', usage_pct:60},
  {id:3, name:'Phòng 3 - 2D', room_type:'2D', total_seats:150, status:'Bảo trì', usage_pct:0},
  {id:4, name:'Phòng 4 - 3D', room_type:'3D', total_seats:200, status:'Hoạt động', usage_pct:45},
];

const INITIAL_SHOWTIMES = [
  {id:1, movie:1, movie_title:'Avengers: Secret Wars', room:1, room_name:'Phòng 1 - IMAX', show_date:'2026-02-27', start_time:'09:15', available_seats:'296/300'},
  {id:2, movie:1, movie_title:'Avengers: Secret Wars', room:1, room_name:'Phòng 1 - IMAX', show_date:'2026-02-27', start_time:'14:00', available_seats:'250/300'},
  {id:3, movie:1, movie_title:'Avengers: Secret Wars', room:1, room_name:'Phòng 1 - IMAX', show_date:'2026-02-27', start_time:'19:15', available_seats:'280/300'},
  {id:4, movie:2, movie_title:'Biển Khát', room:3, room_name:'Phòng 3 - 2D', show_date:'2026-02-27', start_time:'15:00', available_seats:'140/150'},
  {id:5, movie:3, movie_title:'Quỷ Nhập Tràng', room:2, room_name:'Phòng 2 - 4DX', show_date:'2026-02-27', start_time:'16:15', available_seats:'110/120'},
];

async function loadAppData() {
  try {
    if (typeof api !== 'undefined') {
      const [m, r, s, t, rev] = await Promise.allSettled([
        api.movies.getAll(),
        api.rooms.getAll(),
        api.showtimes.getAll(),
        api.tickets.getAll(),
        api.reviews.getAll()
      ]);
      movies = (m.status === 'fulfilled' && Array.isArray(m.value) && m.value.length) ? m.value : INITIAL_MOVIES;
      state.rooms = (r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length) ? r.value : INITIAL_ROOMS;
      state.showtimes = (s.status === 'fulfilled' && Array.isArray(s.value) && s.value.length) ? s.value : INITIAL_SHOWTIMES;
      tickets = (t.status === 'fulfilled' && Array.isArray(t.value) && t.value.length) ? t.value : (JSON.parse(localStorage.getItem('cinelux_tickets') || '[]'));
      reviews = (rev.status === 'fulfilled' && Array.isArray(rev.value) && rev.value.length) ? rev.value : (JSON.parse(localStorage.getItem('cinelux_reviews') || '[]'));
    }
  } catch (e) {
    movies = INITIAL_MOVIES;
    state.rooms = INITIAL_ROOMS;
    state.showtimes = INITIAL_SHOWTIMES;
  }
}

// ─── AUTH ───────────────────────────────────────────
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.auth-tab[onclick*="${tab}"]`).classList.add('active');
  document.getElementById('loginForm').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? '' : 'none';
}

// ─── USER ACCOUNTS DATABASE ─────────────────────────
const DEFAULT_ACCOUNTS = [
  {
    email: 'admin@cinelux.vn',
    password: 'admin123',
    name: 'Admin CinéLux',
    role: 'Admin',
    phone: '0901 000 000'
  },
  {
    email: 'staff@cinelux.vn',
    password: 'staff123',
    name: 'Nguyễn Thị Lan',
    role: 'Staff',
    phone: '0901 234 567'
  },
  {
    email: 'lan@cinelux.vn',
    password: 'staff123',
    name: 'Nguyễn Thị Lan',
    role: 'Staff',
    phone: '0901 234 567'
  },
  {
    email: 'user@cinelux.vn',
    password: 'user123',
    name: 'Trần Văn Toàn',
    role: 'User',
    phone: '0908 999 888'
  },
  {
    email: 'user1@cinelux.vn',
    password: 'user123',
    name: 'Hoàng Văn Nam',
    role: 'User',
    phone: '0912 345 678'
  },
  {
    email: 'user2@cinelux.vn',
    password: 'user123',
    name: 'Lê Thị Mai',
    role: 'User',
    phone: '0934 567 890'
  },
  {
    email: 'toan@gmail.com',
    password: 'user123',
    name: 'Trần Văn Toàn',
    role: 'User',
    phone: '0908 999 888'
  }
];

function getAccounts() {
  try {
    const saved = localStorage.getItem('cinelux_accounts');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  saveAccounts(DEFAULT_ACCOUNTS);
  return DEFAULT_ACCOUNTS;
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem('cinelux_accounts', JSON.stringify(accounts));
  } catch (e) {}
}

function fillDemo(email, pass) {
  const emailInput = document.getElementById('loginEmail');
  const passInput  = document.getElementById('loginPass');
  if (emailInput) emailInput.value = email;
  if (passInput)  passInput.value  = pass;
  showToast(`Đã điền tài khoản: ${email}`, 'info');
}

function applyRolePermissions(role) {
  const currentRole = (role || 'User').trim().toLowerCase();
  document.querySelectorAll('.nav-item').forEach(item => {
    const raw = item.getAttribute('data-roles') || 'Admin';
    const roles = raw.split(',').map(r => r.trim().toLowerCase());
    if (roles.includes(currentRole)) {
      item.style.setProperty('display', 'flex', 'important');
    } else {
      item.style.setProperty('display', 'none', 'important');
    }
  });

  document.querySelectorAll('.sidebar-nav .nav-section-title').forEach(title => {
    let el = title.nextElementSibling;
    let hasVisible = false;
    while (el && !el.classList.contains('nav-section-title')) {
      if (el.classList.contains('nav-item') && el.style.display !== 'none') {
        hasVisible = true;
        break;
      }
      el = el.nextElementSibling;
    }
    title.style.display = hasVisible ? 'block' : 'none';
  });
}

async function doLogin() {
  const emailInput = document.getElementById('loginEmail');
  const passInput  = document.getElementById('loginPass');
  const email = (emailInput?.value || '').trim();
  const pass  = (passInput?.value || '').trim();

  if (!email) {
    showToast('Vui lòng nhập email đăng nhập!', 'error');
    emailInput?.focus();
    return;
  }
  if (!pass) {
    showToast('Vui lòng nhập mật khẩu!', 'error');
    passInput?.focus();
    return;
  }

  let account = null;

  // 1. Kết nối xác thực trực tiếp qua Django REST API
  if (typeof api !== 'undefined' && api.auth) {
    try {
      const res = await api.auth.login(email, pass);
      if (res && res.user) {
        account = res.user;
        if (res.token) localStorage.setItem('cinelux_token', res.token);
      }
    } catch (apiErr) {
      console.warn('[Auth API] Đăng nhập backend không thành công:', apiErr.message);
    }
  }

  // 2. Dự phòng tài khoản cục bộ nếu backend offline hoặc test
  if (!account) {
    const accounts = getAccounts();
    account = accounts.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && a.password === pass
    );
  }

  if (!account) {
    showToast('Sai email hoặc mật khẩu! Vui lòng thử lại.', 'error');
    return;
  }

  state.currentUser = account;
  document.getElementById('authPage').style.display  = 'none';
  document.getElementById('mainApp').style.display   = 'flex';
  document.getElementById('sidebarAvatar').textContent = ((account.name || 'U')[0] || 'U').toUpperCase();
  document.getElementById('sidebarName').textContent   = account.name || account.email;
  
  const roleLabels = {
    admin: 'Administrator',
    staff: 'Nhân viên rạp',
    user:  'Khách hàng'
  };
  const roleKey = (account.role || 'User').trim().toLowerCase();
  document.getElementById('sidebarRole').textContent = roleLabels[roleKey] || account.role;

  applyRolePermissions(account.role);

  // Nạp dữ liệu mới nhất từ Django Backend
  await loadAppData();
  initApp();

  // Điều hướng trang theo vai trò thực tế của tài khoản trong hệ thống
  if (roleKey === 'user') {
    nav('booking');
  } else if (roleKey === 'staff') {
    nav('staff');
  } else {
    nav('dashboard');
  }

  showToast(`Chào mừng ${account.name || account.email} (${roleLabels[roleKey] || account.role})! 👋`, 'success');
}

async function doRegister() {
  const name  = document.getElementById('regName')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pass  = document.getElementById('regPass')?.value.trim();
  const pass2 = document.getElementById('regPassConfirm')?.value.trim();

  if (!name || !email || !pass) {
    showToast('Vui lòng điền đầy đủ họ tên, email và mật khẩu!', 'error');
    return;
  }
  if (pass !== pass2) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  let registered = false;
  if (typeof api !== 'undefined' && api.auth) {
    try {
      const res = await api.auth.register({ email, password: pass, name, phone, role: 'User' });
      if (res && res.user) {
        registered = true;
      }
    } catch (e) {
      console.warn('[Register API] Lỗi backend:', e.message);
    }
  }

  const accounts = getAccounts();
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase()) && !registered) {
    showToast('Email này đã tồn tại trong hệ thống!', 'error');
    return;
  }

  if (!registered) {
    accounts.push({ email, password: pass, name, role: 'User', phone: phone || '' });
    saveAccounts(accounts);
  }

  showToast(`Đăng ký thành công! Hãy đăng nhập bằng ${email}.`, 'success');
  fillDemo(email, pass);
  switchAuthTab('login');
}

async function saveNewUser() {
  const name  = document.getElementById('newUserName')?.value.trim();
  const email = document.getElementById('newUserEmail')?.value.trim();
  const pass  = document.getElementById('newUserPass')?.value.trim() || '123456';
  const role  = document.getElementById('newUserRole')?.value || 'Staff';

  if (!name || !email) {
    showToast('Vui lòng nhập họ tên và email nhân viên!', 'error');
    return;
  }

  if (typeof api !== 'undefined' && api.users) {
    try {
      await api.users.create({ name, email, password: pass, role });
    } catch (e) {
      console.warn('[Users API] Lỗi tạo user backend:', e.message);
    }
  }

  const accounts = getAccounts();
  accounts.push({ email, password: pass, name, role, phone: '' });
  saveAccounts(accounts);
  closeModal('modalUser');
  if (typeof renderUsersTable === 'function') renderUsersTable();
  showToast(`Đã tạo tài khoản ${role}: ${email}!`, 'success');
}

function doLogout() {
  localStorage.removeItem('cinelux_token');
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('mainApp').style.display  = 'none';
  state.currentUser = null;
}

// ─── NAVIGATION ─────────────────────────────────────
function nav(page) {
  const targetItem = document.querySelector(`.nav-item[onclick*="'${page}'"]`);
  if (targetItem && targetItem.style.display === 'none') {
    showToast('Tài khoản của bạn không có quyền truy cập trang này!', 'error');
    return;
  }
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('onclick')?.includes(`'${page}'`)) item.classList.add('active');
  });
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  state.currentPage = page;
  const titles = {
    dashboard:'Dashboard', movies:'Quản lý Phim',
    rooms:'Phòng chiếu',   schedule:'Lịch chiếu',
    booking:'Đặt vé Online', tickets:'Danh sách vé',
    staff:'Nhân viên',     revenue:'Doanh thu',
    reviews:'Đánh giá',    profile:'Hồ sơ cá nhân',
    users:'Người dùng'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  if (page === 'booking') bookingStep(1);
}

// ─── MODALS ─────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'modalSeatMap') renderAdminSeatMap();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Đóng khi click nền
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
  // Demo: điền sẵn email
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) emailInput.value = 'admin@cinelux.vn';
  const passInput  = document.getElementById('loginPass');
  if (passInput)  passInput.value  = 'admin123';
});

// ─── TOASTS ─────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── INIT ────────────────────────────────────────────
function initApp() {
  renderMovieTable();
  renderFilmGrid();
  renderSchedule();
  renderTicketTable();
  renderRevenue();
  renderReviews();
  renderMyTickets();
}
