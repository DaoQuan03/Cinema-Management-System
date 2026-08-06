/* ============================================================
   ADMIN-MOVIES.JS — Admin Movie CRUD Operations Logic
   ============================================================ */

let editingMovieId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAdminMovies();
});

async function renderAdminMovies() {
  const tbody = document.getElementById('adminMoviesTable');
  if (!tbody) return;

  const keyword = (document.getElementById('movieSearch')?.value || '').toLowerCase();
  const allMovies = await getMoviesAsync();
  const movies = allMovies.filter(m => m.title.toLowerCase().includes(keyword));

  tbody.innerHTML = movies.map(m => `
    <tr>
      <td><img src="${m.poster}" alt="${m.title}" style="width:40px;height:56px;object-fit:cover;border-radius:4px"></td>
      <td><strong>${m.title}</strong></td>
      <td>${m.genreLabel || m.genre}</td>
      <td>${m.duration}</td>
      <td><span style="color:var(--gold)">★ ${m.rating}</span></td>
      <td><span class="badge badge--success">${m.tab === 'showing' ? 'Đang chiếu' : 'Sắp chiếu'}</span></td>
      <td>
        <button class="btn btn--ghost" style="padding:4px 10px;font-size:12px" onclick="openEditMovieModal(${m.id})">✏️ Sửa</button>
        <button class="btn btn--danger" style="padding:4px 10px;font-size:12px" onclick="deleteMovieAdmin(${m.id})">🗑️ Xóa</button>
      </td>
    </tr>
  `).join('');
}

function openAddMovieModal() {
  editingMovieId = null;
  document.getElementById('modalMovieTitle').textContent = 'Thêm Phim Mới';
  document.getElementById('movieForm').reset();
  document.getElementById('movieModal').classList.add('show');
}

function openEditMovieModal(id) {
  editingMovieId = id;
  const movie = getMovies().find(m => m.id === id);
  if (!movie) return;

  document.getElementById('modalMovieTitle').textContent = 'Chỉnh Sửa Phim';
  document.getElementById('mTitle').value = movie.title;
  document.getElementById('mGenre').value = movie.genre;
  document.getElementById('mDuration').value = movie.durationMins || 120;
  document.getElementById('mDirector').value = movie.director || '';
  document.getElementById('mPoster').value = movie.poster;
  document.getElementById('mDesc').value = movie.desc || '';

  document.getElementById('movieModal').classList.add('show');
}

function closeMovieModal() {
  document.getElementById('movieModal').classList.remove('show');
}

function saveMovie(e) {
  e.preventDefault();
  const movies = getMovies();

  const title = document.getElementById('mTitle').value;
  const genre = document.getElementById('mGenre').value;
  const mins = parseInt(document.getElementById('mDuration').value);
  const director = document.getElementById('mDirector').value;
  const poster = document.getElementById('mPoster').value || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
  const desc = document.getElementById('mDesc').value;

  if (editingMovieId) {
    const movie = movies.find(m => m.id === editingMovieId);
    if (movie) {
      movie.title = title;
      movie.genre = genre;
      movie.durationMins = mins;
      movie.duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      movie.director = director;
      movie.poster = poster;
      movie.desc = desc;
    }
    showToast(`✓ Đã cập nhật phim: ${title}`, 'success');
  } else {
    const newMovie = {
      id: Date.now(),
      title,
      genre,
      genreLabel: genre,
      rating: 8.0,
      durationMins: mins,
      duration: `${Math.floor(mins / 60)}h ${mins % 60}m`,
      tab: 'showing',
      director,
      poster,
      desc,
    };
    movies.unshift(newMovie);
    showToast(`✓ Đã thêm phim mới: ${title}`, 'success');
  }

  localStorage.setItem('cineverse_movies', JSON.stringify(movies));
  closeMovieModal();
  renderAdminMovies();
}

function deleteMovieAdmin(id) {
  let movies = getMovies();
  const movie = movies.find(m => m.id === id);
  if (movie && confirm(`Xác nhận xóa phim "${movie.title}"?`)) {
    movies = movies.filter(m => m.id !== id);
    localStorage.setItem('cineverse_movies', JSON.stringify(movies));
    showToast(`Đã xóa phim: ${movie.title}`, 'warning');
    renderAdminMovies();
  }
}

function logoutAdmin() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
