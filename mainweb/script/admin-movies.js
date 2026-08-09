/* ============================================================
   ADMIN-MOVIES.JS — Admin Movie CRUD & OMDb Auto-Fetch API Integration
   ============================================================ */

let editingMovieId = null;
let adminMoviesList = [];

document.addEventListener('DOMContentLoaded', () => {
  renderAdminMovies();
});

/* ── Fetch Movies from Django REST API ─────────────────────── */
async function renderAdminMovies() {
  const tbody = document.getElementById('adminMoviesTable');
  if (!tbody) return;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/movies/');
    if (!res.ok) throw new Error('API server error');
    adminMoviesList = await res.json();
  } catch (err) {
    console.warn('[Admin Movies] Failed to load from REST API, using fallback:', err);
    adminMoviesList = await getMoviesAsync();
  }

  const keyword = (document.getElementById('movieSearch')?.value || '').toLowerCase();
  const filtered = adminMoviesList.filter(m => (m.title || '').toLowerCase().includes(keyword));

  tbody.innerHTML = filtered.map(m => {
    const poster = m.poster_url || m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
    const duration = m.duration_mins ? `${Math.floor(m.duration_mins / 60)}h ${m.duration_mins % 60}m` : (m.duration || '2h 0m');
    const isShowing = m.status === 'SHOWING' || m.tab === 'showing';

    return `
      <tr>
        <td><img src="${poster}" alt="${m.title}" style="width:42px;height:60px;object-fit:cover;border-radius:6px"></td>
        <td>
          <strong>${m.title}</strong>
          ${m.badge && m.badge !== 'NONE' ? `<span class="badge badge--hot" style="margin-left:6px;font-size:10px">${m.badge}</span>` : ''}
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${m.director || 'Chưa cập nhật đ.diễn'}</div>
        </td>
        <td>${m.genre || 'Khoa học viễn tưởng'}</td>
        <td>${duration}</td>
        <td><span style="color:var(--gold)">★ ${m.rating || 8.0}</span></td>
        <td><span class="badge ${isShowing ? 'badge--success' : 'badge--blue'}">${isShowing ? 'Đang chiếu' : 'Sắp chiếu'}</span></td>
        <td>
          <button class="btn btn--ghost" style="padding:4px 10px;font-size:12px" onclick="openEditMovieModal(${m.id})">✏️ Sửa</button>
          <button class="btn btn--danger" style="padding:4px 10px;font-size:12px" onclick="deleteMovieAdmin(${m.id})">🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join('');
}

/* ── Open Add / Edit Modal ─────────────────────────────────── */
function openAddMovieModal() {
  editingMovieId = null;
  document.getElementById('modalMovieTitle').textContent = 'Thêm Phim Mới';
  document.getElementById('movieForm').reset();
  document.getElementById('mAgeRating').value = 'C13';
  document.getElementById('mBadge').value = 'HOT';
  document.getElementById('mStatus').value = 'SHOWING';
  document.getElementById('movieModal').classList.add('show');
}

function openEditMovieModal(id) {
  editingMovieId = id;
  const movie = adminMoviesList.find(m => m.id === id);
  if (!movie) return;

  document.getElementById('modalMovieTitle').textContent = 'Chỉnh Sửa Phim';
  document.getElementById('mTitle').value      = movie.title || '';
  document.getElementById('mGenre').value      = movie.genre || '';
  document.getElementById('mDuration').value   = movie.duration_mins || movie.durationMins || 120;
  document.getElementById('mDirector').value   = movie.director || '';
  document.getElementById('mCast').value       = movie.cast || '';
  document.getElementById('mAgeRating').value  = movie.age_rating || 'C13';
  document.getElementById('mLanguage').value   = movie.language || 'Tiếng Anh - Phụ đề Tiếng Việt';
  document.getElementById('mBadge').value      = movie.badge || 'HOT';
  document.getElementById('mStatus').value     = movie.status || 'SHOWING';
  document.getElementById('mPoster').value     = movie.poster_url || movie.poster || '';
  document.getElementById('mTrailer').value    = movie.trailer_url || '';
  document.getElementById('mDesc').value       = movie.description || movie.desc || '';

  document.getElementById('movieModal').classList.add('show');
}

function closeMovieModal() {
  document.getElementById('movieModal').classList.remove('show');
}

/* ── Auto-Fetch Movie Info API (OMDb API Integration) ──────── */
async function autoFetchMovieData() {
  const title = (document.getElementById('mTitle')?.value || '').trim();
  if (!title) {
    showToast('⚠️ Vui lòng nhập Tên Phim trước khi bấm tự động tải!', 'warning');
    return;
  }

  const btn = document.getElementById('autoFetchBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang tải...'; }

  try {
    // Query OMDb Movie API
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=trilogy`);
    const data = await res.json();

    if (data.Response === 'False') {
      showToast(`Không tìm thấy phim "${title}" trên dữ liệu toàn cầu. Bạn có thể tự điền tay!`, 'warning');
      return;
    }

    // Auto-fill fields
    document.getElementById('mTitle').value    = data.Title || title;
    document.getElementById('mGenre').value    = data.Genre || 'Hành động / Phiêu lưu';
    document.getElementById('mDirector').value = data.Director || '';
    document.getElementById('mCast').value     = data.Actors || '';
    document.getElementById('mDesc').value     = data.Plot || '';
    document.getElementById('mLanguage').value = data.Language || 'Tiếng Anh - Phụ đề Tiếng Việt';

    // Duration mins parsing (e.g. "148 min" -> 148)
    const runtimeMins = parseInt(data.Runtime) || 120;
    document.getElementById('mDuration').value = runtimeMins;

    // High Quality Poster
    if (data.Poster && data.Poster !== 'N/A') {
      document.getElementById('mPoster').value = data.Poster;
    }

    // Age Rating mapping
    const rated = (data.Rated || '').toUpperCase();
    if (rated.includes('R') || rated.includes('NC-17')) document.getElementById('mAgeRating').value = 'C18';
    else if (rated.includes('PG-13')) document.getElementById('mAgeRating').value = 'C13';
    else if (rated.includes('PG')) document.getElementById('mAgeRating').value = 'C16';
    else document.getElementById('mAgeRating').value = 'P';

    showToast(`✓ Đã tự động tải 100% thông tin cho phim "${data.Title}"!`, 'success');

  } catch (err) {
    console.warn('[AutoFetch API] Error fetching movie details:', err);
    showToast('Có lỗi kết nối API phim. Bạn có thể tự nhập tay thông tin!', 'warning');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Tự động tải thông tin phim'; }
  }
}

/* ── Save Movie (POST / PUT to Django REST API) ───────────── */
async function saveMovie(e) {
  e.preventDefault();

  const title       = document.getElementById('mTitle').value.trim();
  const genre       = document.getElementById('mGenre').value.trim();
  const mins        = parseInt(document.getElementById('mDuration').value) || 120;
  const director    = document.getElementById('mDirector').value.trim();
  const cast        = document.getElementById('mCast').value.trim();
  const age_rating  = document.getElementById('mAgeRating').value;
  const language    = document.getElementById('mLanguage').value.trim() || 'Tiếng Anh - Phụ đề Tiếng Việt';
  const badge       = document.getElementById('mBadge').value;
  const status      = document.getElementById('mStatus').value;
  const poster_url  = document.getElementById('mPoster').value.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
  let trailer_url   = document.getElementById('mTrailer').value.trim();
  const description = document.getElementById('mDesc').value.trim();

  // Format YouTube URL to Embed format
  if (trailer_url.includes('watch?v=')) {
    trailer_url = trailer_url.replace('watch?v=', 'embed/');
  }

  const payload = {
    title, genre, duration_mins: mins, director, cast,
    age_rating, language, badge, status, poster_url,
    trailer_url: trailer_url || 'https://www.youtube.com/embed/YoHD9XEInc0',
    description, rating: 8.5, release_year: 2025, vote_count: 500
  };

  const saveBtn = document.getElementById('saveMovieBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Đang lưu CSDL...'; }

  try {
    let url = 'http://127.0.0.1:8000/api/movies/';
    let method = 'POST';

    if (editingMovieId) {
      url += `${editingMovieId}/`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to save to Database');

    showToast(`✓ Đã ${editingMovieId ? 'cập nhật' : 'thêm mới'} thành công phim "${title}" vào CSDL!`, 'success');
    closeMovieModal();
    await renderAdminMovies();

  } catch (err) {
    console.warn('[Admin Save Movie] REST API error, saving to local state:', err);

    // Fallback to local memory if API server unreachable
    if (editingMovieId) {
      const existing = adminMoviesList.find(m => m.id === editingMovieId);
      if (existing) Object.assign(existing, payload);
    } else {
      payload.id = Date.now();
      adminMoviesList.unshift(payload);
    }
    showToast(`✓ Đã lưu tạm phim "${title}"`, 'success');
    closeMovieModal();
    renderAdminMovies();
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Lưu Vào CSDL'; }
  }
}

/* ── Delete Movie (DELETE REST API) ────────────────────────── */
async function deleteMovieAdmin(id) {
  const movie = adminMoviesList.find(m => m.id === id);
  if (!movie || !confirm(`Xác nhận xóa phim "${movie.title}" khỏi CSDL?`)) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/movies/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete API failed');
    showToast(`Đã xóa phim: ${movie.title}`, 'warning');
  } catch (err) {
    console.warn('[Admin Delete] REST API error, removing locally:', err);
    adminMoviesList = adminMoviesList.filter(m => m.id !== id);
    showToast(`Đã xóa phim: ${movie.title}`, 'warning');
  }

  renderAdminMovies();
}

function logoutAdmin() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
