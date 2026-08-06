/* ============================================================
   ADMIN-SHOWTIMES.JS — Admin Showtime Management Logic
   ============================================================ */

function openAddShowtimeModal() {
  showToast('Mở form tạo suất chiếu mới (kết nối Backend API...)', 'success');
}

function logoutAdmin() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
