/* ============================================================
   MOVIES.JS — Movie List Page Logic
   ============================================================ */

const ITEMS_PER_PAGE = 8;
let currentTab  = 'showing';
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {

  /* ── Read URL params ─────────────────────────────────── */
  const tabParam = getParam('tab');
  if (tabParam) switchTab(tabParam);
  else filterMovies();

});

/* ── Switch tab (Đang chiếu / Sắp chiếu / Đặc biệt) ─── */
function switchTab(tab, triggerEl) {
  currentTab  = tab;
  currentPage = 1;

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (triggerEl) triggerEl.classList.add('active');
  else {
    const tabMap = { showing: 0, upcoming: 1, special: 2 };
    const tabs   = document.querySelectorAll('.tab');
    if (tabs[tabMap[tab]]) tabs[tabMap[tab]].classList.add('active');
  }

  const titles = { showing: 'Phim Đang Chiếu', upcoming: 'Phim Sắp Chiếu', special: 'Phim Đặc Biệt' };
  const descs  = {
    showing:  'Những bộ phim đang được chiếu tại CineVerse',
    upcoming: 'Phim sắp ra mắt – đặt vé sớm để có ghế tốt',
    special:  'Suất chiếu đặc biệt và phim giới hạn',
  };

  const titleEl = document.getElementById('pageTitle');
  const descEl  = document.getElementById('pageDesc');
  if (titleEl) titleEl.textContent = titles[tab] || '';
  if (descEl)  descEl.textContent  = descs[tab]  || '';

  filterMovies();
}

/* ── Filter + sort + render ──────────────────────────── */
async function filterMovies() {
  const q    = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const sort = document.getElementById('sortSelect')?.value || 'rating';

  const allMovies = await getMoviesAsync();
  let filtered = allMovies.filter(m => m.tab === currentTab);

  if (q) {
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.genreLabel || '').toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  else if (sort === 'newest') filtered.sort((a, b) => b.id - a.id);

  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = filtered.length;

  renderPage(filtered);
}

/* ── Render current page of results ─────────────────── */
function renderPage(movies) {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paged = movies.slice(start, start + ITEMS_PER_PAGE);
  const grid  = document.getElementById('moviesGrid');
  if (!grid) return;

  grid.innerHTML = paged.map(m => {
    const badgeMap = { HOT: 'badge--hot', NEW: 'badge--new', '': '' };
    const badgeClass = badgeMap[m.badge] || '';
    return `
      <a href="movie-detail.html?id=${m.id}" class="movie-card">
        <div class="movie-card__poster">
          <img src="${m.poster}" alt="${m.title}" loading="lazy">
          <div class="movie-card__overlay">
            <div class="book-overlay-btn">🎫 Đặt Vé</div>
          </div>
          ${m.badge ? `<div class="movie-card__badge badge ${badgeClass}">${m.badge}</div>` : ''}
        </div>
        <div class="movie-card__info">
          <div class="movie-card__title">${m.title}</div>
          <div class="movie-card__meta">
            <span class="movie-card__rating">★ ${m.rating}</span>
            <span class="genre-tag">${m.genreLabel || m.genre}</span>
          </div>
          <div class="movie-card__meta" style="margin-top:4px;"><span>⏱ ${m.duration}</span></div>
        </div>
      </a>`;
  }).join('');

  renderPagination(movies.length);
}

/* ── Render pagination ───────────────────────────────── */
function renderPagination(total) {
  const pg    = document.getElementById('pagination');
  if (!pg) return;
  const pages = Math.ceil(total / ITEMS_PER_PAGE);
  pg.innerHTML = '';

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      filterMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pg.appendChild(btn);
  }
}
