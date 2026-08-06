/* ============================================================
   STAFF-CHECKIN.JS — Staff Ticket Scanning & QR Verification Logic
   ============================================================ */

function verifyTicketCheckin() {
  const code = (document.getElementById('checkinCode')?.value || '').trim().toUpperCase();
  const resContainer = document.getElementById('checkinResult');
  if (!resContainer) return;

  if (!code) {
    showToast('Vui lòng nhập hoặc quét mã vé!', 'warning');
    return;
  }

  resContainer.style.display = 'block';

  if (code.startsWith('CVE-2025-') || code.startsWith('CVE-')) {
    resContainer.innerHTML = `
      <div style="background:rgba(74,222,128,0.1);border:1.5px solid var(--green);border-radius:12px;padding:20px;text-align:left">
        <div style="color:var(--green);font-weight:700;font-size:18px;margin-bottom:8px">✓ XÁC NHẬN HỢP LỆ — CHECK-IN THÀNH CÔNG</div>
        <div style="font-size:14px;color:var(--text);line-height:1.6">
          <strong>Mã vé:</strong> ${code}<br>
          <strong>Phim:</strong> Inception 2 – Suất 19:00<br>
          <strong>Phòng chiếu:</strong> Phòng 2 (IMAX 3D)<br>
          <strong>Ghế:</strong> D4, D5<br>
          <strong>Bắp nước:</strong> 1 Combo Popcorn Single<br>
          <strong>Khách hàng:</strong> Nguyễn Văn An (SĐT: 0901234567)
        </div>
      </div>
    `;
    showToast('Check-in vé thành công!', 'success');
  } else {
    resContainer.innerHTML = `
      <div style="background:rgba(232,69,69,0.1);border:1.5px solid var(--red);border-radius:12px;padding:20px;text-align:left">
        <div style="color:var(--red);font-weight:700;font-size:18px;margin-bottom:8px">✕ VÉ KHÔNG HỢP LỆ HOẶC ĐÃ SỬ DỤNG</div>
        <div style="font-size:14px;color:var(--muted)">
          Vui lòng kiểm tra lại mã vé hoặc liên hệ quản lý rạp.
        </div>
      </div>
    `;
    showToast('Mã vé không hợp lệ!', 'error');
  }
}

function logoutStaff() {
  localStorage.removeItem('cineverse_user');
  window.location.href = 'auth.html';
}
