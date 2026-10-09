/* ════════════════════════════════════════════════════
   CinéLux — movies.js
   Quản lý Phim: render, thêm, xóa
   ════════════════════════════════════════════════════ */

function renderMovieTable() {
  const tbody = document.getElementById('movieTableBody');
  if (!tbody) return;
  tbody.innerHTML = movies.map(m => `
    <tr>
      <td>
        <div class="movie-thumb" style="background:linear-gradient(135deg,${m.c1},${m.c2})">
          ${m.emoji}
        </div>
      </td>
      <td><div style="font-weight:600">${m.title}</div></td>
      <td><span class="badge badge-blue">${m.genre}</span></td>
      <td>${m.duration} phút</td>
      <td><span style="color:var(--gold)">★ ${m.rating}</span></td>
      <td style="color:var(--text-dim)">${m.startDate}</td>
      <td>
        <span class="badge ${m.status==='active'?'badge-green':m.status==='upcoming'?'badge-blue':'badge-red'}">
          ${m.status==='active'?'Đang chiếu':m.status==='upcoming'?'Sắp chiếu':'Đã ngừng'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit"  onclick="openModal('modalMovie')">✏️</button>
          <button class="btn-icon btn-del"   onclick="deleteMovie(${m.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function deleteMovie(id) {
  if (typeof api !== 'undefined' && api.movies) {
    try {
      await api.movies.delete(id);
    } catch (e) {
      console.warn('[Movies API] Xóa phim backend lỗi:', e.message);
    }
  }
  const idx = movies.findIndex(m => m.id === id);
  if (idx >= 0) {
    movies.splice(idx, 1);
    renderMovieTable();
    if (typeof renderFilmGrid === 'function') renderFilmGrid();
    showToast('Đã xóa phim thành công!', 'info');
  }
}

async function saveMovie() {
  const title = document.querySelector('#modalMovie .form-input')?.value?.trim() || 'Phim mới';
  const newMovie = {
    emoji: '🎬',
    title: title,
    genre: 'Hành động',
    duration: 120,
    rating: 8.0,
    startDate: new Date().toLocaleDateString('vi'),
    status: 'active',
    c1: '#1a1a2e',
    c2: '#252535'
  };

  if (typeof api !== 'undefined' && api.movies) {
    try {
      const created = await api.movies.create(newMovie);
      if (created && created.id) {
        newMovie.id = created.id;
      }
    } catch (e) {
      console.warn('[Movies API] Thêm phim backend lỗi:', e.message);
      newMovie.id = Date.now();
    }
  } else {
    newMovie.id = Date.now();
  }

  movies.unshift(newMovie);
  renderMovieTable();
  if (typeof renderFilmGrid === 'function') renderFilmGrid();
  closeModal('modalMovie');
  showToast('Đã thêm phim mới thành công!', 'success');
}

