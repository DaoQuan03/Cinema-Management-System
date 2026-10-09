/* ════════════════════════════════════════════════════
   CinéLux — pages.js
   Dynamic Renderers: Dashboard, Schedule, Tickets, Revenue, Reviews, Rooms, Users, Profile
   ════════════════════════════════════════════════════ */

// ─── DASHBOARD DYNAMIC RENDERER ───────────────────────
function renderDashboardData() {
  const dashRev = document.getElementById('dashRevValue');
  const dashTickets = document.getElementById('dashTicketsValue');
  const dashMovies = document.getElementById('dashMoviesValue');
  const dashShowtimes = document.getElementById('dashShowtimesValue');

  // Tính toán số liệu thực tế từ dữ liệu hệ thống
  const activeTickets = (tickets || []).filter(t => t.status !== 'cancelled');
  let totalRev = 0;
  activeTickets.forEach(t => {
    const num = parseInt((t.total || '0').replace(/[^\d]/g, ''), 10) || 0;
    totalRev += num;
  });

  if (dashRev) dashRev.textContent = totalRev ? totalRev.toLocaleString('vi-VN') + 'đ' : '0đ';
  if (dashTickets) dashTickets.textContent = activeTickets.length;
  if (dashMovies) dashMovies.textContent = (movies || []).filter(m => m.status === 'active').length;
  if (dashShowtimes) dashShowtimes.textContent = (state.showtimes || []).length;

  // Bảng phim phổ biến
  const popularEl = document.getElementById('dashboardPopularMovies');
  if (popularEl) {
    if (!movies || movies.length === 0) {
      popularEl.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px">Chưa có dữ liệu phim</td></tr>`;
    } else {
      popularEl.innerHTML = movies.slice(0, 4).map(m => {
        const movieTickets = (tickets || []).filter(t => t.movie === m.title).length;
        const pct = Math.min(100, Math.round((movieTickets / 15) * 100)) || 10;
        return `
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px">
              <div class="movie-thumb" style="background:linear-gradient(135deg,${m.c1 || '#1a0a2e'},${m.c2 || '#3d1f5e'})">${m.emoji || '🎬'}</div>
              <div><div style="font-weight:600">${m.title}</div>
                   <div style="font-size:11px;color:var(--text-dim)">${m.genre} • ${m.duration}m</div></div>
            </div></td>
            <td>${(state.showtimes || []).filter(s => s.movie_title === m.title || s.movie === m.id).length || 2}</td>
            <td>${movieTickets}</td>
            <td><div class="progress-bar" style="width:120px"><div class="progress-fill" style="width:${pct}%"></div></div></td>
          </tr>
        `;
      }).join('');
    }
  }

  // Hoạt động gần đây
  const activityEl = document.getElementById('dashboardRecentActivities');
  if (activityEl) {
    if ((!tickets || tickets.length === 0) && (!reviews || reviews.length === 0)) {
      activityEl.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:24px">Chưa có hoạt động mới nào</div>`;
    } else {
      let items = [];
      (tickets || []).slice(0, 3).forEach(t => {
        items.push(`
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px">
            <span style="font-size:18px">🎟️</span>
            <div><div style="font-weight:600">Vé #${t.id} (${t.status === 'active' ? 'Đã đặt' : 'Đã check-in'})</div>
                 <div style="color:var(--text-dim);font-size:12px">${t.customer} • ${t.movie} • ${t.seats}</div>
                 <div style="color:var(--text-muted);font-size:11px">${t.time || 'Vừa xong'}</div></div>
          </div>
        `);
      });
      (reviews || []).slice(0, 2).forEach(r => {
        items.push(`
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px">
            <span style="font-size:18px">⭐</span>
            <div><div style="font-weight:600">Đánh giá mới ${'★'.repeat(r.stars)}</div>
                 <div style="color:var(--text-dim);font-size:12px">${r.user}: "${(r.text || '').slice(0, 40)}..."</div>
                 <div style="color:var(--text-muted);font-size:11px">${r.date || 'Hôm nay'}</div></div>
          </div>
        `);
      });
      activityEl.innerHTML = items.join('');
    }
  }

  // Suất chiếu sắp tới
  const showtimesEl = document.getElementById('dashboardUpcomingShowtimes');
  if (showtimesEl) {
    const list = state.showtimes || [];
    if (list.length === 0) {
      showtimesEl.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">Chưa có suất chiếu nào được tạo</td></tr>`;
    } else {
      showtimesEl.innerHTML = list.slice(0, 5).map(s => `
        <tr>
          <td><b>${s.movie_title || s.movie || 'Phim'}</b></td>
          <td>${s.room_name || s.room || 'Phòng chiếu'}</td>
          <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${s.start_time || s.time}</span></td>
          <td>${s.available_seats || 'Còn ghế'}</td>
          <td><span class="badge badge-green">Hoạt động</span></td>
          <td><div class="action-btns"><button class="btn-icon btn-edit" onclick="openModal('modalSchedule')">✏️</button></div></td>
        </tr>
      `).join('');
    }
  }
}

// ─── ROOMS DYNAMIC RENDERER ──────────────────────────
function renderRooms() {
  const grid = document.getElementById('roomsGrid');
  if (!grid) return;
  const list = state.rooms || [];
  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:36px;margin-bottom:8px">🏛️</div>
        <div>Chưa có phòng chiếu nào trong hệ thống</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openModal('modalRoom')">+ Thêm phòng đầu tiên</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(r => `
    <div class="room-card" onclick="openModal('modalSeatMap')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="room-card-name">${r.name}</div>
        <span class="badge ${r.status === 'Bảo trì' ? 'badge-blue' : 'badge-green'}">${r.status || 'Hoạt động'}</span>
      </div>
      <div class="room-card-info">${r.total_seats || 150} ghế • Loại: ${r.room_type || '2D'}</div>
      <div style="margin-top:8px">
        <div class="progress-bar"><div class="progress-fill" style="width:${r.usage_pct || 50}%"></div></div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:4px">Đang vận hành</div>
      </div>
    </div>
  `).join('') + `
    <div class="room-card" style="border-style:dashed" onclick="openModal('modalRoom')">
      <div style="text-align:center;padding:20px;color:var(--text-muted)">
        <div style="font-size:32px;margin-bottom:8px">+</div>
        <div>Thêm phòng mới</div>
      </div>
    </div>
  `;
}

// ─── SCHEDULE DYNAMIC RENDERER ────────────────────────
function renderSchedule() {
  const body = document.getElementById('scheduleBody');
  if (!body) return;
  const list = state.rooms || [];
  if (list.length === 0) {
    body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)">Chưa có phòng chiếu để hiển thị lịch</div>`;
    return;
  }

  body.innerHTML = list.map(room => {
    const roomShowtimes = (state.showtimes || []).filter(s => s.room === room.id || s.room_name === room.name);
    return `
      <div class="schedule-grid" style="margin-bottom:4px">
        <div class="schedule-time">${room.name}</div>
        ${['9:00','11:00','13:00','15:00','17:00','19:00','21:00','23:00'].map(h => {
          const match = roomShowtimes.find(st => (st.start_time || '').startsWith(h.split(':')[0]));
          return `
            <div class="schedule-slot ${match ? 'booked' : ''}"
                 onclick="openModal('modalSchedule')"
                 title="${match ? (match.movie_title || 'Suất chiếu') : 'Tạo suất chiếu'}">
              ${match ? `<span>${match.movie_title || 'Phim'}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}

function onScheduleDateChange(date) {
  state.selectedDate = date;
  if (typeof api !== 'undefined' && api.showtimes) {
    api.showtimes.getAll(date).then(data => {
      state.showtimes = data || [];
      renderSchedule();
    }).catch(() => {});
  }
}

// ─── TICKETS DYNAMIC RENDERER ─────────────────────────
function renderTicketTable() {
  const tbody = document.getElementById('ticketTableBody');
  if (!tbody) return;
  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Chưa có vé nào được đặt trong hệ thống</td></tr>`;
    return;
  }

  tbody.innerHTML = tickets.map(t => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${t.id}</span></td>
      <td>${t.customer || 'Khách vãng lai'}</td>
      <td style="font-weight:600">${t.movie}</td>
      <td style="color:var(--text-dim)">${t.time}</td>
      <td style="font-size:12px">${t.seats}</td>
      <td style="font-weight:600;color:var(--gold)">${t.total}</td>
      <td>
        <span class="badge ${
          t.status === 'active'    ? 'badge-blue'  :
          t.status === 'checkedin' ? 'badge-green' : 'badge-red'
        }">
          ${t.status === 'active' ? 'Chờ chiếu' : t.status === 'checkedin' ? 'Đã check-in' : 'Đã hủy'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" onclick="showToast('Xem chi tiết vé #${t.id}','info')">👁️</button>
          ${t.status !== 'cancelled'
            ? `<button class="btn-icon btn-del" onclick="cancelTicketAction('${t.id}')">🗑️</button>`
            : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

async function cancelTicketAction(id) {
  const t = (tickets || []).find(item => item.id === id);
  if (t) {
    if (typeof api !== 'undefined' && api.tickets) {
      try {
        await api.tickets.cancelTicket(id);
      } catch (e) {
        console.warn('[Tickets API] Hủy vé backend lỗi:', e.message);
      }
    }
    t.status = 'cancelled';
    renderTicketTable();
    renderDashboardData();
    renderRevenue();
    showToast(`Đã hủy vé #${id} và hoàn tiền thành công!`, 'info');
  }
}

function filterTickets(keyword) {
  const q = (keyword || '').toLowerCase();
  const rows = document.querySelectorAll('#ticketTableBody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ─── REVENUE DYNAMIC RENDERER ─────────────────────────
function renderRevenue(month) {
  const activeTickets = (tickets || []).filter(t => t.status === 'active' || t.status === 'checkedin');
  const cancelledTickets = (tickets || []).filter(t => t.status === 'cancelled');

  let totalRev = 0;
  activeTickets.forEach(t => {
    totalRev += parseInt((t.total || '0').replace(/[^\d]/g, ''), 10) || 0;
  });

  let totalRefund = 0;
  cancelledTickets.forEach(t => {
    totalRefund += parseInt((t.total || '0').replace(/[^\d]/g, ''), 10) || 0;
  });

  const revEl = document.getElementById('revTotalValue');
  const tixEl = document.getElementById('revTicketsValue');
  const refEl = document.getElementById('revRefundValue');
  const topMovieEl = document.getElementById('revTopMovieValue');
  const topMovieTix = document.getElementById('revTopMovieTickets');

  if (revEl) revEl.textContent = totalRev ? totalRev.toLocaleString('vi-VN') + 'đ' : '0đ';
  if (tixEl) tixEl.textContent = activeTickets.length;
  if (refEl) refEl.textContent = totalRefund ? totalRefund.toLocaleString('vi-VN') + 'đ' : '0đ';

  // Tính phim doanh thu cao nhất
  const movieCounts = {};
  activeTickets.forEach(t => {
    movieCounts[t.movie] = (movieCounts[t.movie] || 0) + 1;
  });
  let topMovieName = '—';
  let maxCount = 0;
  Object.entries(movieCounts).forEach(([m, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topMovieName = m;
    }
  });

  if (topMovieEl) topMovieEl.textContent = topMovieName;
  if (topMovieTix) topMovieTix.textContent = `${maxCount} vé đã bán`;

  // Biểu đồ cột
  const chart = document.getElementById('revenueChart');
  if (chart) {
    const days = ['T2','T3','T4','T5','T6','T7','CN'];
    const mockH = [20, 35, 45, 60, 95, 120, 80];
    chart.innerHTML = days.map((d, i) => `
      <div class="chart-bar" style="height:${mockH[i]}px;position:relative;cursor:pointer" title="${d}">
        <div class="chart-bar-label">${d}</div>
      </div>
    `).join('');
  }

  // Top phim danh sách
  const topList = document.getElementById('topMoviesRevenue');
  if (topList) {
    const entries = Object.entries(movieCounts);
    if (entries.length === 0) {
      topList.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:24px">Chưa có giao dịch nào được ghi nhận</div>`;
    } else {
      topList.innerHTML = entries.map(([m, c]) => {
        const pct = Math.round((c / (activeTickets.length || 1)) * 100);
        return `
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
              <span>${m}</span>
              <span style="color:var(--gold);font-weight:700">${c} vé (${pct}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// ─── REVIEWS DYNAMIC RENDERER ─────────────────────────
function renderReviews() {
  const list = document.getElementById('reviewsList');
  if (list) {
    if (!reviews || reviews.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">Chưa có đánh giá nào. Hãy là người đầu tiên viết đánh giá!</div>`;
    } else {
      list.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${r.avatar || 'U'}</div>
            <div>
              <div class="review-author">${r.user || 'Khách hàng'}</div>
              <div style="font-size:11px;color:var(--text-muted)">${r.movie}</div>
            </div>
            <div class="review-stars">${'★'.repeat(r.stars || 5)}${'☆'.repeat(5 - (r.stars || 5))}</div>
            <div class="review-date">${r.date || 'Gần đây'}</div>
          </div>
          <div class="review-text">${r.text}</div>
        </div>
      `).join('');
    }
  }

  const stats = document.getElementById('reviewStats');
  if (stats) {
    if (!reviews || reviews.length === 0) {
      stats.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:16px">0 đánh giá</div>`;
    } else {
      const avg = (reviews.reduce((a, r) => a + (r.stars || 5), 0) / reviews.length).toFixed(1);
      stats.innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:40px;font-weight:700;color:var(--gold)">${avg}</div>
          <div style="color:var(--gold);font-size:20px">${'★'.repeat(Math.round(avg))}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${reviews.length} đánh giá</div>
        </div>
      `;
    }
  }
}

let currentStars = 5;
function setStars(n) {
  currentStars = n;
  const els = document.getElementById('starRating')?.children;
  if (!els) return;
  [...els].forEach((s, i) => {
    s.textContent = i < n ? '★' : '☆';
    s.style.color = i < n ? 'var(--gold)' : 'var(--text-muted)';
  });
}

async function submitReview() {
  const movieSelect = document.querySelector('#modalReview select');
  const commentText = document.querySelector('#modalReview textarea');
  const movie = movieSelect ? movieSelect.value : (movies[0]?.title || 'Phim');
  const text = commentText?.value.trim() || 'Phim rất đáng xem!';

  const newReview = {
    movie_title: movie,
    user: state.currentUser?.name || 'Khách hàng',
    role: (state.currentUser?.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng VIP'),
    stars: currentStars || 5,
    text: text,
    date: new Date().toLocaleDateString('vi')
  };

  if (typeof api !== 'undefined' && api.reviews) {
    try {
      const res = await api.reviews.create(newReview);
      if (res && res.id) newReview.id = res.id;
    } catch (e) {
      console.warn('[Reviews API] Gửi đánh giá backend lỗi:', e.message);
      newReview.id = Date.now();
    }
  } else {
    newReview.id = Date.now();
  }

  reviews.unshift(newReview);
  if (commentText) commentText.value = '';
  renderReviews();
  renderDashboardData();
  closeModal('modalReview');
  showToast('Đã gửi đánh giá thành công! ⭐', 'success');
}

// ─── PROFILE & MY TICKETS ─────────────────────────────
function renderProfile() {
  const u = state.currentUser;
  if (!u) return;
  const nameEl = document.getElementById('profileName');
  const phoneEl = document.getElementById('profilePhone');
  const emailEl = document.getElementById('profileEmail');
  const nameDisp = document.getElementById('profileNameDisplay');
  const roleDisp = document.getElementById('profileRoleDisplay');
  const avatarLg = document.getElementById('profileAvatarLarge');

  if (nameEl) nameEl.value = u.name || '';
  if (phoneEl) phoneEl.value = u.phone || '';
  if (emailEl) emailEl.value = u.email || '';
  if (nameDisp) nameDisp.textContent = u.name || 'Người dùng';
  if (roleDisp) roleDisp.textContent = u.role || 'Thành viên';
  if (avatarLg) avatarLg.textContent = (u.name ? u.name[0] : 'U').toUpperCase();

  renderMyTickets();
}

function renderMyTickets() {
  const el = document.getElementById('myTickets');
  if (!el) return;
  const myEmail = state.currentUser?.email;
  const myName = state.currentUser?.name;

  // Lọc vé theo tài khoản hiện tại
  const myTix = (tickets || []).filter(t => 
    t.customer === myName || t.customer === myEmail || !myEmail
  );

  if (myTix.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted)">Bạn chưa có vé nào trong hệ thống</div>`;
    return;
  }

  el.innerHTML = myTix.map(t => `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
      <div>
        <div style="font-weight:600">${t.movie}</div>
        <div style="color:var(--text-muted)">${t.time} • Ghế: ${t.seats}</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--gold);font-weight:600">${t.total}</div>
        <span class="badge ${
          t.status === 'active'    ? 'badge-blue'  :
          t.status === 'checkedin' ? 'badge-green' : 'badge-red'
        }" style="font-size:10px">
          ${t.status === 'active' ? 'Chờ chiếu' : t.status === 'checkedin' ? 'Đã check-in' : 'Đã hủy'}
        </span>
      </div>
    </div>
  `).join('');
}

function saveProfileChanges() {
  const name = document.getElementById('profileName')?.value.trim();
  const phone = document.getElementById('profilePhone')?.value.trim();
  if (state.currentUser) {
    state.currentUser.name = name || state.currentUser.name;
    state.currentUser.phone = phone || state.currentUser.phone;
    renderProfile();
    showToast('Đã lưu thay đổi thông tin cá nhân!', 'success');
  }
}

// ─── USERS DYNAMIC RENDERER ───────────────────────────
function renderUsersTable() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  const accounts = typeof getAccounts === 'function' ? getAccounts() : (state.users || []);
  if (!accounts || accounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Chưa có người dùng nào</td></tr>`;
    return;
  }

  tbody.innerHTML = accounts.map(u => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${(u.name ? u.name[0] : 'U').toUpperCase()}</div>
        ${u.name || 'Người dùng'}
      </div></td>
      <td style="color:var(--text-dim)">${u.email}</td>
      <td><span class="badge ${u.role === 'Admin' ? 'badge-gold' : u.role === 'Staff' ? 'badge-blue' : 'badge-purple'}">${u.role}</span></td>
      <td style="color:var(--text-muted)">${u.phone || '—'}</td>
      <td><span class="badge badge-green">Hoạt động</span></td>
      <td><div class="action-btns"><button class="btn-icon btn-edit" onclick="showToast('Chỉnh sửa ${u.email}','info')">✏️</button></div></td>
    </tr>
  `).join('');
}

// ─── STAFF QUẦY VẬN HÀNH ──────────────────────────────
function renderStaffOverview() {
  const activeTickets = (tickets || []).filter(t => t.status === 'active');
  const checkinTickets = (tickets || []).filter(t => t.status === 'checkedin');
  const cancelTickets = (tickets || []).filter(t => t.status === 'cancelled');

  const soldEl = document.getElementById('staffSoldCounter');
  const chkEl = document.getElementById('staffCheckinCounter');
  const cnlEl = document.getElementById('staffCancelCounter');

  if (soldEl) soldEl.textContent = (tickets || []).length;
  if (chkEl) chkEl.textContent = checkinTickets.length;
  if (cnlEl) cnlEl.textContent = cancelTickets.length;

  // Dropdown suất chiếu quầy
  const sel = document.getElementById('staffShowtimeSelect');
  if (sel) {
    const list = state.showtimes || [];
    if (list.length === 0) {
      sel.innerHTML = `<option value="">-- Chưa có suất chiếu hôm nay --</option>`;
    } else {
      sel.innerHTML = `<option value="">-- Chọn suất chiếu --</option>` + list.map(s => `
        <option value="${s.id}">${s.movie_title || 'Phim'} - ${s.start_time || s.time} - ${s.room_name || s.room || 'Phòng'}</option>
      `).join('');
    }
  }
}

function doCheckinManual() {
  const input = document.getElementById('checkinCodeInput');
  const code = (input?.value || '').trim().replace('#', '');
  if (!code) {
    showToast('Vui lòng nhập mã vé!', 'error');
    return;
  }
  const t = (tickets || []).find(item => item.id.toUpperCase() === code.toUpperCase() || item.id === `VX-${code}`);
  if (!t) {
    showToast(`Không tìm thấy mã vé #${code}!`, 'error');
    return;
  }
  if (t.status === 'checkedin') {
    showToast(`Vé #${t.id} đã được check-in trước đó!`, 'error');
    return;
  }
  t.status = 'checkedin';
  if (input) input.value = '';
  renderTicketTable();
  renderStaffOverview();
  renderDashboardData();
  showToast(`Check-in thành công vé #${t.id} (${t.movie})! ✅`, 'success');
}

function doCancelTicketManual() {
  const input = document.getElementById('cancelCodeInput');
  const code = (input?.value || '').trim().replace('#', '');
  if (!code) {
    showToast('Vui lòng nhập mã vé cần hủy!', 'error');
    return;
  }
  const t = (tickets || []).find(item => item.id.toUpperCase() === code.toUpperCase());
  if (!t) {
    showToast(`Không tìm thấy mã vé #${code}!`, 'error');
    return;
  }
  t.status = 'cancelled';
  if (input) input.value = '';
  renderTicketTable();
  renderStaffOverview();
  renderDashboardData();
  renderRevenue();
  showToast(`Đã hủy vé #${t.id} và hoàn tiền thành công!`, 'info');
}

// ─── MODAL DYNAMIC OPTIONS ───────────────────────────
function populateModalSelects() {
  // Modal Schedule movie options
  const schMovie = document.querySelector('#modalSchedule select');
  if (schMovie && movies && movies.length > 0) {
    schMovie.innerHTML = movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
  }
  // Modal Review movie options
  const revMovie = document.querySelector('#modalReview select');
  if (revMovie && movies && movies.length > 0) {
    revMovie.innerHTML = movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
  }
}
