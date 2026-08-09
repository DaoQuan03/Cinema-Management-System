/* ============================================================
   SHARED.JS — Common utilities, data, nav helpers
   ============================================================ */

/* ── Movie Data Store ──────────────────────────────────────── */
const MOVIES = [
  { id:1,  title:"Inception 2",              genre:"scifi",     genreLabel:"Khoa học viễn tưởng", rating:9.1, duration:"2h 28m", durationMins:148, badge:"HOT", tab:"showing", year:"2025", rated:"C13", lang:"Tiếng Anh", director:"Christopher Nolan", poster:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80", desc:"Cuộc hành trình vào sâu trong giấc mơ lần thứ hai với những bí ẩn sâu hơn, nguy hiểm hơn.", cast:["Leonardo DiCaprio","Joseph G-L","Elliot Page"] },
  { id:2,  title:"Avengers: Endgame 2",      genre:"action",    genreLabel:"Hành động",           rating:8.8, duration:"3h 5m",  durationMins:185, badge:"HOT", tab:"showing", year:"2025", rated:"C13", lang:"Tiếng Anh", director:"Russo Brothers",       poster:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80", desc:"Sau thảm họa Infinity War, những anh hùng còn lại phải đối mặt với kẻ thù mạnh mẽ nhất.", cast:["Robert Downey Jr","Chris Evans","Scarlett Johansson"] },
  { id:3,  title:"Dune: Part Three",         genre:"scifi",     genreLabel:"Khoa học viễn tưởng", rating:8.5, duration:"2h 45m", durationMins:165, badge:"NEW", tab:"showing", year:"2025", rated:"C18", lang:"Tiếng Anh", director:"Denis Villeneuve",     poster:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", desc:"Trên hành tinh Arrakis, Paul Atreides tiếp tục hành trình định mệnh.", cast:["Timothée Chalamet","Zendaya","Rebecca Ferguson"] },
  { id:4,  title:"The Dark Knight Returns",  genre:"action",    genreLabel:"Hành động",           rating:9.3, duration:"2h 15m", durationMins:135, badge:"HOT", tab:"showing", year:"2025", rated:"C16", lang:"Tiếng Anh", director:"Christopher Nolan",    poster:"https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80", desc:"Batman trở lại sau 10 năm ẩn dật để đối mặt với mối đe dọa lớn nhất lịch sử.", cast:["Christian Bale","Heath Ledger Jr","Anne Hathaway"] },
  { id:5,  title:"Spider-Man: Brand New Day", genre:"action",    genreLabel:"Hành động",           rating:8.9, duration:"2h 20m", durationMins:140, badge:"HOT", tab:"showing", year:"2025", rated:"P",   lang:"Tiếng Anh", director:"Jon Watts",            poster:"https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&q=80", desc:"Peter Parker bắt đầu chương mới trong cuộc đời nhện sau khi thế giới quên đi danh tính của anh.", cast:["Tom Holland","Zendaya","Benedict Cumberbatch"] },
  { id:6,  title:"La La Land 2",             genre:"romance",   genreLabel:"Tình cảm",            rating:8.2, duration:"2h 5m",  durationMins:125, badge:"NEW", tab:"showing", year:"2025", rated:"P",   lang:"Tiếng Anh", director:"Damien Chazelle",      poster:"https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", desc:"5 năm sau, Sebastian và Mia tình cờ gặp lại nhau. Tình yêu và ước mơ, liệu có cùng tồn tại?", cast:["Ryan Gosling","Emma Stone","John Legend"] },
  { id:7,  title:"Parasite 2",               genre:"thriller",  genreLabel:"Tâm lý",              rating:8.7, duration:"2h 20m", durationMins:140, badge:"",    tab:"showing", year:"2025", rated:"C18", lang:"Tiếng Hàn", director:"Bong Joon-ho",         poster:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80", desc:"Gia đình Kim đối mặt với hậu quả của những lựa chọn trong quá khứ.", cast:["Song Kang-ho","Lee Sun-kyun","Cho Yeo-jeong"] },
  { id:8,  title:"Frozen 3",                 genre:"animation", genreLabel:"Hoạt hình",           rating:8.0, duration:"1h 50m", durationMins:110, badge:"",    tab:"upcoming",year:"2025", rated:"P",   lang:"Tiếng Anh", director:"Jennifer Lee",         poster:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80", desc:"Elsa và Anna bước vào vương quốc băng giá huyền bí chưa từng được khám phá.", cast:["Idina Menzel","Kristen Bell","Josh Gad"] },
  { id:9,  title:"Interstellar 2",           genre:"scifi",     genreLabel:"Khoa học viễn tưởng", rating:9.0, duration:"3h 0m",  durationMins:180, badge:"HOT", tab:"upcoming",year:"2025", rated:"P",   lang:"Tiếng Anh", director:"Christopher Nolan",    poster:"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80", desc:"Cooper trở lại từ chiều không gian thứ 5 với kiến thức có thể cứu nhân loại.", cast:["Matthew McConaughey","Anne Hathaway","Jessica Chastain"] },
  { id:10, title:"Avatar 3",                 genre:"scifi",     genreLabel:"Khoa học viễn tưởng", rating:8.9, duration:"3h 20m", durationMins:200, badge:"HOT", tab:"upcoming",year:"2025", rated:"P",   lang:"Tiếng Anh", director:"James Cameron",        poster:"https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=400&q=80", desc:"Jake Sully và gia đình Na'vi tiếp tục cuộc chiến chống lại sự xâm lược của Trái Đất.", cast:["Sam Worthington","Zoe Saldana","Sigourney Weaver"] },
];

/* ── Get movies from Django Backend REST API with fallback ────── */
async function getMoviesAsync(params = {}) {
  const host = window.location.hostname || '127.0.0.1';
  let apiMovies = [];

  try {
    const res = await fetch(`http://${host}:8000/api/movies/`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        apiMovies = data.map(m => ({
          id: m.id,
          title: m.title,
          genre: m.genre,
          genreLabel: m.genre,
          rating: m.rating || 8.0,
          duration: m.duration_mins ? `${Math.floor(m.duration_mins / 60)}h ${m.duration_mins % 60}m` : '2h 0m',
          durationMins: m.duration_mins || 120,
          badge: m.badge || (m.rating >= 9.0 ? 'HOT' : (m.status === 'COMING_SOON' ? 'NEW' : '')),
          tab: m.status === 'SHOWING' ? 'showing' : (m.status === 'COMING_SOON' ? 'upcoming' : 'special'),
          poster: m.poster_url || m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
          poster_url: m.poster_url || m.poster,
          trailer_url: m.trailer_url || 'https://www.youtube.com/embed/YoHD9XEInc0',
          director: m.director || 'N/A',
          cast: m.cast || '',
          desc: m.description || '',
          description: m.description || '',
          rated: m.age_rating || 'C13',
          age_rating: m.age_rating || 'C13',
          lang: m.language || 'Tiếng Anh',
          language: m.language || 'Tiếng Anh - Phụ đề Tiếng Việt',
          year: m.release_year || 2025,
          release_year: m.release_year || 2025,
          vote_count: m.vote_count || 500
        }));
      }
    }
  } catch (err) {
    console.warn('[CineVerse] REST API offline, using local list:', err);
  }

  // Get Admin-added movies from localStorage if any
  let localAdminMovies = [];
  try {
    localAdminMovies = JSON.parse(localStorage.getItem('cv_admin_added_movies') || '[]');
  } catch {}

  // Combine DB movies, Admin-added movies, and fallback MOVIES (preventing duplicates)
  const combined = [...apiMovies, ...localAdminMovies, ...MOVIES];
  const uniqueMap = new Map();
  combined.forEach(m => {
    const key = (m.title || '').toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, m);
    }
  });

  const resultList = Array.from(uniqueMap.values());
  localStorage.setItem('cineverse_movies', JSON.stringify(resultList));
  return resultList;
}

function getMovies() {
  try {
    return JSON.parse(localStorage.getItem('cineverse_movies')) || MOVIES;
  } catch {
    return MOVIES;
  }
}

/* ── Get / Set current user ────────────────────────────────── */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('cineverse_user')) || null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('cineverse_user', JSON.stringify(user));
}

/* ── Toast notification ────────────────────────────────────── */
function showToast(message, type = '') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ── Scroll reveal ─────────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Sticky nav on scroll ──────────────────────────────────── */
function initStickyNav(navSelector = '.nav--fixed') {
  const nav = document.querySelector(navSelector);
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ── Render movie card HTML ────────────────────────────────── */
function movieCardHTML(movie, linkPrefix = '') {
  const badgeMap = { HOT: 'badge--hot', NEW: 'badge--new', '': '' };
  const badgeClass = badgeMap[movie.badge] || '';
  return `
    <a href="${linkPrefix}movie-detail.html?id=${movie.id}" class="movie-card">
      <div class="movie-card__poster">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        <div class="movie-card__overlay">
          <div class="movie-card__play">▶</div>
        </div>
        ${movie.badge ? `<div class="movie-card__badge badge ${badgeClass}">${movie.badge}</div>` : ''}
      </div>
      <div class="movie-card__info">
        <div class="movie-card__title">${movie.title}</div>
        <div class="movie-card__meta">
          <span class="movie-card__rating">★ ${movie.rating}</span>
          <span class="genre-tag">${movie.genreLabel || movie.genre}</span>
        </div>
        <div class="movie-card__meta" style="margin-top:5px;">
          <span>⏱ ${movie.duration}</span>
        </div>
      </div>
    </a>`;
}

/* ── Generate random ticket ID ─────────────────────────────── */
function generateTicketId() {
  return 'CVE-2025-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

/* ── Format currency ───────────────────────────────────────── */
function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

/* ── URL params helper ─────────────────────────────────────── */
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

/* ── Update Navbar Auth Status ──────────────────────────────── */
function updateNavbarAuth() {
  const actions = document.querySelector('.nav__actions');
  if (!actions) return;
  const user = getCurrentUser();

  if (user && user.name) {
    const initial = user.name[0].toUpperCase();
    actions.innerHTML = `
      <a href="profile.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text);font-weight:600;font-size:14px">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--gold);color:var(--dark);display:flex;align-items:center;justify-content:center;font-weight:700">${initial}</div>
        <span>${user.name}</span>
      </a>
      <button onclick="logoutUserNav()" class="btn btn--outline" style="padding:6px 12px;font-size:12px">Đăng Xuất</button>
    `;
  } else {
    actions.innerHTML = `
      <a href="auth.html" class="btn btn--outline">Đăng Nhập</a>
      <a href="auth.html?mode=register" class="btn btn--primary">Đăng Ký</a>
    `;
  }
}

function logoutUserNav() {
  localStorage.removeItem('cineverse_user');
  localStorage.removeItem('cineverse_auth_token');
  showToast('Đã đăng xuất tài khoản', 'info');
  setTimeout(() => { location.reload(); }, 600);
}

/* ── Run on DOM ready ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initStickyNav();
  updateNavbarAuth();
});

