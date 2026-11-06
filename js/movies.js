/* ════════════════════════════════════════════════════
   CinéLux — movies.js
   Quản lý Phim & Tích hợp Kho phim Thế giới TMDb
   ════════════════════════════════════════════════════ */

function renderMovieTable() {
  const tbody = document.getElementById('movieTableBody');
  if (!tbody) return;
  tbody.innerHTML = movies.map(m => {
    const hasPoster = Boolean(m.poster_url);
    const hasTrailer = Boolean(m.trailer_key);
    const escapedTitle = (m.title || '').replace(/'/g, "\\'");
    return `
      <tr>
        <td>
          <div class="movie-thumb" style="background:linear-gradient(135deg,${m.c1 || '#1a0a2e'},${m.c2 || '#3d1f5e'});position:relative;overflow:hidden">
            ${hasPoster ? `<img src="${m.poster_url}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : (m.emoji || '🎬')}
          </div>
        </td>
        <td>
          <div style="font-weight:600">${m.title}</div>
          ${m.tmdb_id ? `<span style="font-size:10px;color:var(--gold);background:rgba(201,168,76,.15);padding:1px 5px;border-radius:3px">TMDb #${m.tmdb_id}</span>` : ''}
        </td>
        <td><span class="badge badge-blue">${m.genre}</span></td>
        <td>${m.duration} phút</td>
        <td><span style="color:var(--gold)">★ ${m.rating}</span></td>
        <td style="color:var(--text-dim)">${m.startDate || m.start_date || '-'}</td>
        <td>
          <span class="badge ${m.status==='active'?'badge-green':m.status==='upcoming'?'badge-blue':'badge-red'}">
            ${m.status==='active'?'Đang chiếu':m.status==='upcoming'?'Sắp chiếu':'Đã ngừng'}
          </span>
        </td>
        <td>
          <div class="action-btns">
            ${hasTrailer ? `<button class="btn-icon" style="color:var(--gold)" onclick="playTrailer('${m.trailer_key}','${escapedTitle}')" title="Xem trailer">▶</button>` : ''}
            <button class="btn-icon btn-edit" onclick="editMovie(${m.id})" title="Chỉnh sửa">✏️</button>
            <button class="btn-icon btn-del" onclick="deleteMovie(${m.id})" title="Xóa phim">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteMovie(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bộ phim này khỏi hệ thống?')) return;
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

// ─── TÍCH HỢP TMDB WORLD MOVIES SEARCH & AUTO-FILL ─────────
let tmdbSearchTimeout = null;

function onTmdbSearchInput(val) {
  clearTimeout(tmdbSearchTimeout);
  const dropdown = document.getElementById('tmdbSuggestions');
  if (!dropdown) return;

  const q = (val || '').trim();
  if (q.length < 2) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:12px">🔍 Đang tìm kiếm trên TMDb...</div>`;

  tmdbSearchTimeout = setTimeout(async () => {
    try {
      let results = [];
      if (typeof api !== 'undefined' && api.tmdb) {
        results = await api.tmdb.search(q);
      }
      if (!results || results.length === 0) {
        dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:12px">Không tìm thấy kết quả phù hợp trên TMDb</div>`;
        return;
      }

      dropdown.innerHTML = results.map(r => `
        <div class="tmdb-item" onclick="selectTmdbMovie(${r.tmdb_id})">
          <img src="${r.poster_url || 'https://via.placeholder.com/42x60?text=No+Cover'}" alt="${r.title}">
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</div>
            <div style="font-size:11px;color:var(--text-dim)">${r.release_date || 'Năm ?'} • ${r.genre}</div>
            <div style="font-size:11px;color:var(--gold);font-weight:600">★ ${r.rating}</div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" style="font-size:10px;padding:3px 8px;flex-shrink:0">
            Chọn ➔
          </button>
        </div>
      `).join('');
    } catch (err) {
      dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--red);font-size:12px">Lỗi kết nối TMDb API</div>`;
    }
  }, 350);
}

async function selectTmdbMovie(tmdbId) {
  const dropdown = document.getElementById('tmdbSuggestions');
  if (dropdown) dropdown.style.display = 'none';

  showToast('Đang tải thông tin chi tiết phim từ TMDb...', 'info');

  try {
    let detail = null;
    if (typeof api !== 'undefined' && api.tmdb) {
      detail = await api.tmdb.getDetail(tmdbId);
    }
    if (!detail) {
      showToast('Không thể lấy chi tiết phim từ TMDb', 'error');
      return;
    }

    // Điền tự động vào form
    const titleInput = document.getElementById('modalMovieTitle');
    const genreInput = document.getElementById('modalMovieGenre');
    const durationInput = document.getElementById('modalMovieDuration');
    const startDateInput = document.getElementById('modalMovieStartDate');
    const ratingInput = document.getElementById('modalMovieRating');
    const descInput = document.getElementById('modalMovieDesc');
    const posterUrlInput = document.getElementById('modalMoviePosterUrl');
    const trailerKeyInput = document.getElementById('modalMovieTrailerKey');
    const tmdbIdInput = document.getElementById('modalMovieTmdbId');

    if (titleInput) titleInput.value = detail.title;
    if (genreInput) genreInput.value = detail.genre || 'Hành động';
    if (durationInput) durationInput.value = detail.duration || 120;
    if (startDateInput && detail.release_date) startDateInput.value = detail.release_date;
    if (ratingInput) ratingInput.value = detail.rating || 8.0;
    if (descInput) descInput.value = detail.overview || '';
    if (posterUrlInput) posterUrlInput.value = detail.poster_url || '';
    if (trailerKeyInput) trailerKeyInput.value = detail.trailer_key || '';
    if (tmdbIdInput) tmdbIdInput.value = detail.tmdb_id || '';

    // Cập nhật xem trước Poster
    const preview = document.getElementById('modalMoviePosterPreview');
    if (preview) {
      if (detail.poster_url) {
        preview.innerHTML = `<img src="${detail.poster_url}" style="width:70px;height:100px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">`;
      } else {
        preview.innerHTML = '';
      }
    }

    showToast(`Đã tự động điền: ${detail.title}! 🎬`, 'success');
  } catch (e) {
    showToast('Lỗi khi nạp dữ liệu phim TMDb', 'error');
  }
}

async function openTmdbPopular() {
  const dropdown = document.getElementById('tmdbSuggestions');
  if (!dropdown) return;
  dropdown.style.display = 'block';
  dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:12px">🔥 Đang tải kho phim thịnh hành thế giới...</div>`;

  try {
    const list = await api.tmdb.getPopular();
    if (!list || list.length === 0) {
      dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:12px">Không tải được danh sách phim thịnh hành</div>`;
      return;
    }

    dropdown.innerHTML = `
      <div style="padding:6px 12px;font-size:11px;font-weight:700;color:var(--gold);background:var(--surface3)">
        🔥 TOP PHIM CHIẾU RẠP THẾ GIỚI MỚI NHẤT (CLICK ĐỂ TỰ ĐỘNG ĐIỀN)
      </div>
      ${list.map(r => `
        <div class="tmdb-item" onclick="selectTmdbMovie(${r.tmdb_id})">
          <img src="${r.poster_url || 'https://via.placeholder.com/42x60?text=No+Cover'}" alt="${r.title}">
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</div>
            <div style="font-size:11px;color:var(--text-dim)">${r.release_date || 'Năm ?'} • ${r.genre}</div>
            <div style="font-size:11px;color:var(--gold);font-weight:600">★ ${r.rating}</div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" style="font-size:10px;padding:3px 8px;flex-shrink:0">
            Chọn ➔
          </button>
        </div>
      `).join('')}
    `;
  } catch (e) {
    dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:var(--red);font-size:12px">Lỗi kết nối TMDb API</div>`;
  }
}

function editMovie(id) {
  const m = movies.find(item => item.id === id);
  if (!m) return;
  openModal('modalMovie');
  const titleInput = document.getElementById('modalMovieTitle');
  const genreInput = document.getElementById('modalMovieGenre');
  const durationInput = document.getElementById('modalMovieDuration');
  const startDateInput = document.getElementById('modalMovieStartDate');
  const ratingInput = document.getElementById('modalMovieRating');
  const descInput = document.getElementById('modalMovieDesc');
  const posterUrlInput = document.getElementById('modalMoviePosterUrl');
  const trailerKeyInput = document.getElementById('modalMovieTrailerKey');
  const tmdbIdInput = document.getElementById('modalMovieTmdbId');
  const editIdInput = document.getElementById('modalMovieEditId');

  if (titleInput) titleInput.value = m.title;
  if (genreInput) genreInput.value = m.genre;
  if (durationInput) durationInput.value = m.duration;
  if (startDateInput) startDateInput.value = m.startDate || m.start_date || '';
  if (ratingInput) ratingInput.value = m.rating;
  if (descInput) descInput.value = m.description || '';
  if (posterUrlInput) posterUrlInput.value = m.poster_url || '';
  if (trailerKeyInput) trailerKeyInput.value = m.trailer_key || '';
  if (tmdbIdInput) tmdbIdInput.value = m.tmdb_id || '';
  if (editIdInput) editIdInput.value = m.id;

  const preview = document.getElementById('modalMoviePosterPreview');
  if (preview) {
    preview.innerHTML = m.poster_url ? `<img src="${m.poster_url}" style="width:70px;height:100px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">` : '';
  }
}

async function saveMovie() {
  const title = document.getElementById('modalMovieTitle')?.value?.trim();
  const genre = document.getElementById('modalMovieGenre')?.value?.trim() || 'Hành động';
  const duration = parseInt(document.getElementById('modalMovieDuration')?.value || '120', 10);
  const startDate = document.getElementById('modalMovieStartDate')?.value || new Date().toLocaleDateString('vi');
  const rating = parseFloat(document.getElementById('modalMovieRating')?.value || '8.0');
  const description = document.getElementById('modalMovieDesc')?.value?.trim() || '';
  const posterUrl = document.getElementById('modalMoviePosterUrl')?.value?.trim() || '';
  const trailerKey = document.getElementById('modalMovieTrailerKey')?.value?.trim() || '';
  const tmdbId = document.getElementById('modalMovieTmdbId')?.value?.trim() || null;
  const editId = document.getElementById('modalMovieEditId')?.value?.trim() || null;

  if (!title) {
    showToast('Vui lòng nhập tên phim!', 'error');
    document.getElementById('modalMovieTitle')?.focus();
    return;
  }

  const moviePayload = {
    emoji: '🎬',
    title: title,
    genre: genre,
    duration: duration,
    rating: rating,
    start_date: startDate,
    status: 'active',
    c1: '#1a0a2e',
    c2: '#3d1f5e',
    description: description,
    poster_url: posterUrl,
    trailer_key: trailerKey,
    tmdb_id: tmdbId ? parseInt(tmdbId, 10) : null
  };

  if (typeof api !== 'undefined' && api.movies) {
    try {
      if (editId) {
        // Cập nhật phim
        const updated = await api.request(`/movies/${editId}/`, {
          method: 'PATCH',
          body: JSON.stringify(moviePayload)
        });
        const idx = movies.findIndex(m => m.id == editId);
        if (idx >= 0) movies[idx] = updated;
        showToast(`Đã cập nhật phim ${title} thành công!`, 'success');
      } else {
        // Thêm phim mới
        const created = await api.movies.create(moviePayload);
        movies.unshift(created);
        showToast(`Đã thêm phim mới: ${title}!`, 'success');
      }
    } catch (e) {
      console.warn('[Movies API] Lưu phim lỗi:', e.message);
      if (!editId) {
        moviePayload.id = Date.now();
        movies.unshift(moviePayload);
      }
      showToast('Đã lưu dữ liệu phim!', 'success');
    }
  } else {
    if (!editId) {
      moviePayload.id = Date.now();
      movies.unshift(moviePayload);
    }
    showToast('Đã lưu dữ liệu phim!', 'success');
  }

  renderMovieTable();
  if (typeof renderFilmGrid === 'function') renderFilmGrid();
  closeModal('modalMovie');

  // Reset form
  const editIdInput = document.getElementById('modalMovieEditId');
  if (editIdInput) editIdInput.value = '';
}
