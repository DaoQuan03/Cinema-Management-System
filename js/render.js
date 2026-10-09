/* ════════════════════════════════════════════════════
   CinéLux — render.js
   Inject HTML layout của từng trang (Clean dynamic containers)
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DASHBOARD ── */
  document.getElementById('page-dashboard').innerHTML = `
    <div class="stat-grid" id="dashboardStatGrid">
      <div class="stat-card gold"><span class="stat-icon">💰</span>
        <div class="stat-label">Doanh thu hôm nay</div>
        <div class="stat-value" id="dashRevValue">0đ</div>
        <div class="stat-change" id="dashRevChange">Cập nhật thời gian thực</div>
      </div>
      <div class="stat-card blue"><span class="stat-icon">🎟️</span>
        <div class="stat-label">Vé đã bán</div>
        <div class="stat-value" id="dashTicketsValue">0</div>
        <div class="stat-change" id="dashTicketsChange">Đơn hàng trong ngày</div>
      </div>
      <div class="stat-card green"><span class="stat-icon">🎬</span>
        <div class="stat-label">Phim đang chiếu</div>
        <div class="stat-value" id="dashMoviesValue">0</div>
        <div class="stat-change" id="dashMoviesChange">Phim trong hệ thống</div>
      </div>
      <div class="stat-card red"><span class="stat-icon">🏛️</span>
        <div class="stat-label">Suất chiếu hôm nay</div>
        <div class="stat-value" id="dashShowtimesValue">0</div>
        <div class="stat-change" id="dashShowtimesChange">Số phòng đang hoạt động</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px">
      <div class="card">
        <div class="table-header">
          <span class="table-title">Phim đang chiếu phổ biến</span>
          <button class="btn btn-secondary btn-sm" onclick="nav('movies')">Xem tất cả</button>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Phim</th><th>Suất hôm nay</th><th>Đã bán</th><th>Lấp đầy</th></tr>
          </thead>
          <tbody id="dashboardPopularMovies">
            <tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px">Chưa có dữ liệu phim</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="table-title" style="margin-bottom:16px">Hoạt động gần đây</div>
        <div id="dashboardRecentActivities" style="display:flex;flex-direction:column;gap:12px">
          <div style="text-align:center;color:var(--text-muted);padding:24px">Chưa có hoạt động mới</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-header">
        <span class="table-title">Suất chiếu sắp tới hôm nay</span>
        <button class="btn btn-primary btn-sm" onclick="openModal('modalSchedule')">+ Tạo suất chiếu</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Phim</th><th>Phòng</th><th>Giờ chiếu</th><th>Ghế trống</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody id="dashboardUpcomingShowtimes">
          <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">Chưa có suất chiếu hôm nay</td></tr>
        </tbody>
      </table>
    </div>
  `;

  /* ── MOVIES ── */
  document.getElementById('page-movies').innerHTML = `
    <div class="section-header">
      <div class="section-title">Quản lý Phim</div>
      <button class="btn btn-primary" onclick="openModal('modalMovie')">+ Thêm phim mới</button>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="filterMovieTab('active', this)">Đang chiếu</button>
      <button class="tab" onclick="filterMovieTab('upcoming', this)">Sắp chiếu</button>
      <button class="tab" onclick="filterMovieTab('stopped', this)">Đã ngừng</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead>
          <tr><th></th><th>Tên phim</th><th>Thể loại</th><th>Thời lượng</th><th>Đánh giá</th><th>Ngày chiếu</th><th>Trạng thái</th><th>Hành động</th></tr>
        </thead>
        <tbody id="movieTableBody">
          <tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Đang tải danh sách phim...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  /* ── ROOMS ── */
  document.getElementById('page-rooms').innerHTML = `
    <div class="section-header">
      <div class="section-title">Phòng Chiếu</div>
      <button class="btn btn-primary" onclick="openModal('modalRoom')">+ Thêm phòng</button>
    </div>
    <div class="room-grid" id="roomsGrid">
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Đang tải danh sách phòng...</div>
    </div>
  `;

  /* ── SCHEDULE ── */
  document.getElementById('page-schedule').innerHTML = `
    <div class="section-header">
      <div class="section-title">Lịch Chiếu</div>
      <div style="display:flex;gap:10px">
        <input type="date" class="form-input" id="scheduleDateInput" style="width:160px" value="2026-02-27" onchange="onScheduleDateChange(this.value)">
        <button class="btn btn-primary" onclick="openModal('modalSchedule')">+ Tạo suất chiếu</button>
      </div>
    </div>
    <div class="card">
      <div style="overflow-x:auto">
        <div style="min-width:600px">
          <div class="schedule-grid">
            <div></div>
            ${['9:00','11:00','13:00','15:00','17:00','19:00','21:00','23:00'].map(h =>
              `<div style="font-size:11px;color:var(--text-muted);text-align:center;padding-bottom:8px">${h}</div>`
            ).join('')}
          </div>
          <div id="scheduleBody">
            <div style="text-align:center;padding:32px;color:var(--text-muted)">Đang nạp dữ liệu lịch chiếu...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── BOOKING ── */
  document.getElementById('page-booking').innerHTML = `
    <div class="section-title" style="margin-bottom:20px">Đặt vé Online</div>
    <div class="step-indicator">
      <div class="step active" id="step1"><div class="step-num">1</div><span>Chọn phim</span></div>
      <div class="step-line"></div>
      <div class="step" id="step2"><div class="step-num">2</div><span>Chọn suất</span></div>
      <div class="step-line"></div>
      <div class="step" id="step3"><div class="step-num">3</div><span>Chọn ghế</span></div>
      <div class="step-line"></div>
      <div class="step" id="step4"><div class="step-num">4</div><span>Thanh toán</span></div>
      <div class="step-line"></div>
      <div class="step" id="step5"><div class="step-num">5</div><span>Xác nhận</span></div>
    </div>

    <!-- Step 1: Film -->
    <div id="bookingStep1">
      <div class="film-grid" id="filmGrid">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Đang tải danh sách phim...</div>
      </div>
    </div>

    <!-- Step 2: Showtime -->
    <div id="bookingStep2" style="display:none">
      <div class="section-header">
        <div style="font-size:18px;font-weight:700" id="selectedMovieTitle"></div>
        <button class="btn btn-secondary btn-sm" onclick="bookingStep(1)">← Đổi phim</button>
      </div>
      <div class="card">
        <div style="margin-bottom:16px">
          <div class="form-label" style="margin-bottom:8px">Chọn ngày</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="dateButtons">
            <button class="showtime-btn active" onclick="selectBookingDate(this,'2026-02-27')">T.5 27/02</button>
            <button class="showtime-btn" onclick="selectBookingDate(this,'2026-02-28')">T.6 28/02</button>
            <button class="showtime-btn" onclick="selectBookingDate(this,'2026-03-01')">T.7 01/03</button>
            <button class="showtime-btn" onclick="selectBookingDate(this,'2026-03-02')">CN 02/03</button>
          </div>
        </div>
        <div>
          <div class="form-label" style="margin-bottom:8px">Suất chiếu</div>
          <div id="bookingShowtimeContainer" class="showtime-list">
            <div style="color:var(--text-muted);font-size:13px;padding:12px 0">Đang tải suất chiếu...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Seats -->
    <div id="bookingStep3" style="display:none">
      <div class="booking-flow">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div style="font-size:16px;font-weight:700">Sơ đồ ghế</div>
            <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--green)">
              <span class="realtime-dot"></span>Real-time lock đang hoạt động
            </div>
          </div>
          <div class="card">
            <div class="screen-label">MÀN HÌNH</div>
            <div class="screen-bar"></div>
            <div class="seat-legend">
              <div class="legend-item"><div class="legend-dot std"></div>Standard (90k)</div>
              <div class="legend-item"><div class="legend-dot vip"></div>VIP (150k)</div>
              <div class="legend-item"><div class="legend-dot sweet"></div>Sweetbox (250k/đôi)</div>
              <div class="legend-item"><div class="legend-dot taken"></div>Đã đặt</div>
              <div class="legend-item"><div class="legend-dot selected"></div>Đang chọn</div>
              <div class="legend-item"><div class="legend-dot holding"></div>Đang giữ chỗ (Realtime)</div>
            </div>
            <div class="seat-grid" id="seatGrid"></div>
          </div>
        </div>
        <div>
          <div class="booking-summary">
            <div class="summary-title">Thông tin đặt vé</div>
            <div class="summary-row"><span>Phim</span><span id="summaryMovie" style="font-weight:600;text-align:right;max-width:160px">—</span></div>
            <div class="summary-row"><span>Suất chiếu</span><span id="summaryTime" style="color:var(--gold)">—</span></div>
            <div class="summary-row"><span>Phòng</span><span id="summaryRoom">—</span></div>
            <div id="selectedSeatsSummary"></div>
            <div class="summary-row total"><span>Tổng cộng</span><span id="totalPrice">0đ</span></div>
            <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:16px"
                    onclick="bookingStep(4)" id="btnProceedPayment" disabled>
              Tiến hành thanh toán →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Payment -->
    <div id="bookingStep4" style="display:none">
      <div style="max-width:520px">
        <div class="card" style="margin-bottom:16px">
          <div style="font-size:16px;font-weight:700;margin-bottom:16px">Thanh toán</div>
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px">
            <div class="summary-title">Chi tiết đơn</div>
            <div class="summary-row"><span>Phim</span><span id="pay-movie" style="font-weight:600">-</span></div>
            <div class="summary-row"><span>Suất chiếu</span><span id="pay-time" style="color:var(--gold)">-</span></div>
            <div class="summary-row"><span>Ghế đã chọn</span><span id="pay-seats" style="color:var(--text-dim)">-</span></div>
            <div class="summary-row total"><span>Tổng cộng</span><span id="pay-total" style="color:var(--gold)">-</span></div>
          </div>
        </div>
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:16px">Phương thức thanh toán</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
            <div class="room-card" id="pay-momo"  onclick="selectPayMethod('momo')"  style="padding:12px;text-align:center"><div style="font-size:24px">💜</div><div style="font-size:13px;font-weight:600;margin-top:4px">MoMo</div></div>
            <div class="room-card" id="pay-vnpay" onclick="selectPayMethod('vnpay')" style="padding:12px;text-align:center"><div style="font-size:24px">💳</div><div style="font-size:13px;font-weight:600;margin-top:4px">VNPay</div></div>
            <div class="room-card" id="pay-bank"  onclick="selectPayMethod('bank')"  style="padding:12px;text-align:center"><div style="font-size:24px">🏦</div><div style="font-size:13px;font-weight:600;margin-top:4px">Chuyển khoản</div></div>
            <div class="room-card" id="pay-cash"  onclick="selectPayMethod('cash')"  style="padding:12px;text-align:center"><div style="font-size:24px">💵</div><div style="font-size:13px;font-weight:600;margin-top:4px">Tiền mặt</div></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="doPayment()">
            💳 Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>

    <!-- Step 5: Ticket -->
    <div id="bookingStep5" style="display:none">
      <div style="text-align:center;padding:20px 0 32px">
        <div style="font-size:56px;margin-bottom:12px">🎉</div>
        <div style="font-size:22px;font-weight:700;color:var(--green);margin-bottom:8px">Đặt vé thành công!</div>
        <div style="color:var(--text-dim);margin-bottom:32px">Vé điện tử đã được ghi nhận vào hệ thống</div>
      </div>
      <div class="ticket" id="ticketOutput">
        <div class="ticket-header">
          <div class="ticket-logo">✦ CinéLux ✦</div>
          <div class="ticket-movie" id="ticket-movie">—</div>
          <div class="ticket-sub" id="ticket-room-sub">IMAX 3D • Phòng 1</div>
        </div>
        <div class="ticket-perforation">
          <div class="ticket-hole"></div>
          <div class="ticket-hole" style="margin-left:auto"></div>
        </div>
        <div class="ticket-body">
          <div class="ticket-detail">
            <div><div class="ticket-detail-label">NGÀY CHIẾU</div><div class="ticket-detail-val" id="ticket-date-val">Hôm nay</div></div>
            <div style="text-align:right"><div class="ticket-detail-label">GIỜ CHIẾU</div><div class="ticket-detail-val" id="ticket-time">—</div></div>
          </div>
          <div class="ticket-detail">
            <div><div class="ticket-detail-label">GHẾ</div><div class="ticket-detail-val" id="ticket-seats">—</div></div>
            <div style="text-align:right"><div class="ticket-detail-label">TỔNG TIỀN</div><div class="ticket-detail-val" style="color:var(--gold)" id="ticket-total">—</div></div>
          </div>
          <div class="qr-placeholder">🎫</div>
          <div style="text-align:center;font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace" id="ticket-code">#VX-0000</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:24px">
        <button class="btn btn-secondary" onclick="nav('booking')">🎬 Đặt vé mới</button>
        <button class="btn btn-primary" onclick="showToast('Đã tải xuống vé!','success')">⬇️ Tải vé PDF</button>
      </div>
    </div>
  `;

  /* ── TICKETS ── */
  document.getElementById('page-tickets').innerHTML = `
    <div class="section-header">
      <div class="section-title">Danh sách vé đã bán</div>
      <div style="display:flex;gap:10px">
        <input type="text" class="form-input" id="ticketSearchInput" placeholder="Tìm mã vé / email..." style="width:220px" onkeyup="filterTickets(this.value)">
        <button class="btn btn-secondary btn-sm">Lọc</button>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead>
          <tr><th>Mã vé</th><th>Khách hàng</th><th>Phim</th><th>Suất chiếu</th><th>Ghế</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr>
        </thead>
        <tbody id="ticketTableBody">
          <tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Chưa có vé nào được đặt</td></tr>
        </tbody>
      </table>
    </div>
  `;

  /* ── STAFF ── */
  document.getElementById('page-staff').innerHTML = `
    <div class="section-title" style="margin-bottom:20px">Nhân viên Vận hành Quầy</div>
    <div class="staff-grid">
      <div class="card">
        <div style="font-size:16px;font-weight:700;margin-bottom:16px">🎟️ Bán vé tại quầy</div>
        <div class="form-group" style="margin-bottom:12px">
          <label class="form-label">Tên khách hàng</label>
          <input class="form-input" id="counterCustomerName" placeholder="Khách vãng lai">
        </div>
        <div class="form-group" style="margin-bottom:12px">
          <label class="form-label">Số điện thoại</label>
          <input class="form-input" id="counterCustomerPhone" placeholder="0901 234 567">
        </div>
        <div class="form-group" style="margin-bottom:12px">
          <label class="form-label">Suất chiếu</label>
          <select class="form-select" id="staffShowtimeSelect">
            <option value="">-- Chọn suất chiếu --</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label">Số lượng ghế</label>
          <input class="form-input" type="number" value="2" min="1" max="10">
        </div>
        <button class="btn btn-primary" onclick="showToast('Đang mở sơ đồ ghế...','info');nav('booking')"
                style="width:100%;justify-content:center">
          Chọn ghế & thanh toán
        </button>
      </div>

      <div class="card">
        <div style="font-size:16px;font-weight:700;margin-bottom:16px">📱 Quét mã QR check-in</div>
        <div class="qr-scanner" onclick="showToast('Mở camera để quét mã...','info')">
          <div class="qr-scanner-icon">📷</div>
          <div style="font-size:14px;font-weight:600">Nhấn để quét QR</div>
          <div style="font-size:12px;color:var(--text-muted)">Hoặc nhập mã thủ công</div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px">
          <input class="form-input" id="checkinCodeInput" placeholder="Nhập mã vé #VX-..." style="flex:1">
          <button class="btn btn-primary" onclick="doCheckinManual()">Xác nhận</button>
        </div>
      </div>

      <div class="card">
        <div style="font-size:16px;font-weight:700;margin-bottom:16px">🔄 Hủy / Đổi vé</div>
        <div class="form-group" style="margin-bottom:12px">
          <label class="form-label">Mã vé</label>
          <input class="form-input" id="cancelCodeInput" placeholder="#VX-8841">
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-danger" style="flex:1;justify-content:center"
                  onclick="doCancelTicketManual()">🗑️ Hủy vé</button>
          <button class="btn btn-secondary" style="flex:1;justify-content:center"
                  onclick="showToast('Đang mở form đổi vé...','info')">🔄 Đổi vé</button>
        </div>
      </div>

      <div class="card">
        <div style="font-size:16px;font-weight:700;margin-bottom:16px">📋 Hoạt động hôm nay</div>
        <div id="staffCounterStats">
          <div class="summary-row"><span>Vé đã bán tại quầy</span><span id="staffSoldCounter" style="color:var(--gold);font-weight:700">0</span></div>
          <div class="summary-row"><span>Check-in thành công</span><span id="staffCheckinCounter" style="color:var(--green);font-weight:700">0</span></div>
          <div class="summary-row"><span>Vé đã hủy</span><span id="staffCancelCounter" style="color:var(--red);font-weight:700">0</span></div>
        </div>
      </div>
    </div>
  `;

  /* ── REVENUE ── */
  document.getElementById('page-revenue').innerHTML = `
    <div class="section-header">
      <div class="section-title">Doanh thu & Báo cáo</div>
      <div style="display:flex;gap:10px">
        <select class="form-select" id="revenueMonthSelect" onchange="renderRevenue(this.value)">
          <option value="2026-02">Tháng 2/2026</option>
          <option value="2026-01">Tháng 1/2026</option>
          <option value="2025-12">Tháng 12/2025</option>
        </select>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Đang xuất báo cáo...','info')">⬇️ Xuất Excel</button>
      </div>
    </div>
    <div class="stat-grid" id="revenueStatGrid">
      <div class="stat-card gold"><span class="stat-icon">💰</span><div class="stat-label">Tổng doanh thu</div><div class="stat-value" id="revTotalValue">0đ</div><div class="stat-change" id="revTotalChange">Dữ liệu từ CSDL</div></div>
      <div class="stat-card blue"><span class="stat-icon">🎟️</span><div class="stat-label">Vé đã bán</div><div class="stat-value" id="revTicketsValue">0</div><div class="stat-change" id="revTicketsChange">Vé thành công</div></div>
      <div class="stat-card green"><span class="stat-icon">🎬</span><div class="stat-label">Phim bán chạy nhất</div><div class="stat-value" id="revTopMovieValue" style="font-size:15px">—</div><div class="stat-change" id="revTopMovieTickets">0 vé</div></div>
      <div class="stat-card red"><span class="stat-icon">💳</span><div class="stat-label">Hoàn tiền</div><div class="stat-value" id="revRefundValue">0đ</div><div class="stat-change" style="color:var(--red)">Vé đã hủy</div></div>
    </div>
    <div class="revenue-grid">
      <div class="card">
        <div class="table-title" style="margin-bottom:16px">Biểu đồ doanh thu gần đây</div>
        <div class="chart-placeholder" id="revenueChart"></div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:28px;flex-wrap:wrap" id="chartLabels"></div>
      </div>
      <div class="card">
        <div class="table-title" style="margin-bottom:16px">Top phim theo doanh thu</div>
        <div id="topMoviesRevenue">
          <div style="color:var(--text-muted);font-size:13px;padding:24px 0;text-align:center">Chưa có dữ liệu thống kê</div>
        </div>
      </div>
    </div>
  `;

  /* ── REVIEWS ── */
  document.getElementById('page-reviews').innerHTML = `
    <div class="section-header">
      <div class="section-title">Đánh giá Phim</div>
      <button class="btn btn-primary" onclick="openModal('modalReview')">+ Viết đánh giá</button>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
      <div id="reviewsList">
        <div style="text-align:center;padding:40px;color:var(--text-muted)">Đang tải đánh giá...</div>
      </div>
      <div class="card" style="height:fit-content">
        <div style="font-size:15px;font-weight:700;margin-bottom:16px">Thống kê đánh giá</div>
        <div id="reviewStats">
          <div style="text-align:center;color:var(--text-muted);padding:16px">Chưa có đánh giá nào</div>
        </div>
      </div>
    </div>
  `;

  /* ── PROFILE ── */
  document.getElementById('page-profile').innerHTML = `
    <div class="section-title" style="margin-bottom:24px">Hồ sơ cá nhân</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--purple));
                      display:flex;align-items:center;justify-content:center;font-size:28px;
                      font-weight:700;margin:0 auto 12px;color:#fff" id="profileAvatarLarge">U</div>
          <div style="font-size:18px;font-weight:700" id="profileNameDisplay">Người dùng</div>
          <div style="color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:4px" id="profileRoleDisplay">Thành viên</div>
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Họ tên</label><input class="form-input" id="profileName"></div>
          <div class="form-group"><label class="form-label">Điện thoại</label><input class="form-input" id="profilePhone"></div>
          <div class="form-group form-full"><label class="form-label">Email</label><input class="form-input" id="profileEmail" readonly style="opacity:0.8"></div>
          <div class="form-group"><label class="form-label">Mật khẩu mới</label><input class="form-input" type="password" id="profileNewPass" placeholder="••••••••"></div>
          <div class="form-group"><label class="form-label">Xác nhận</label><input class="form-input" type="password" id="profileConfirmPass" placeholder="••••••••"></div>
        </div>
        <div class="form-footer">
          <button class="btn btn-primary" onclick="saveProfileChanges()">Lưu thay đổi</button>
        </div>
      </div>
      <div class="card">
        <div style="font-size:15px;font-weight:700;margin-bottom:16px">Lịch sử mua vé</div>
        <div id="myTickets">
          <div style="color:var(--text-muted);font-size:13px;padding:24px 0;text-align:center">Bạn chưa có vé nào</div>
        </div>
      </div>
    </div>
  `;

  /* ── USERS ── */
  document.getElementById('page-users').innerHTML = `
    <div class="section-header">
      <div class="section-title">Quản lý Người dùng & Nhân viên</div>
      <button class="btn btn-primary" onclick="openModal('modalUser')">+ Thêm nhân viên</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead>
          <tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Điện thoại</th><th>Trạng thái</th><th>Hành động</th></tr>
        </thead>
        <tbody id="userTableBody">
          <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Đang tải danh sách người dùng...</td></tr>
        </tbody>
      </table>
    </div>
  `;
});
