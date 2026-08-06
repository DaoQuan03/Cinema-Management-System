

let selectedRole = 'user';

document.addEventListener('DOMContentLoaded', () => {

  const bg = document.getElementById('authBg');
  if (bg) {
    for (let i = 0; i < 200; i++) {
      const c = document.createElement('div');
      c.className = 'auth-left__cell';
      bg.appendChild(c);
    }
  }


  if (getParam('mode') === 'register') switchAuthMode('register');
});

function switchAuthMode(mode) {
  const isLogin = mode === 'login';

  document.getElementById('loginForm').style.display    = isLogin ? '' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : '';

  document.getElementById('loginTab').classList.toggle('active',    isLogin);
  document.getElementById('registerTab').classList.toggle('active', !isLogin);

  const switchEl = document.getElementById('switchMode');
  if (switchEl) {
    switchEl.innerHTML = isLogin
      ? 'Chưa có tài khoản? <span class="switch-link" onclick="switchAuthMode(\'register\')">Đăng ký ngay</span>'
      : 'Đã có tài khoản? <span class="switch-link" onclick="switchAuthMode(\'login\')">Đăng nhập</span>';
  }
}

function selectRole(el, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedRole = role;
}

function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function doLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pw    = document.getElementById('loginPw')?.value;
  let valid   = true;

  if (!email || !email.includes('@')) { showFieldError('loginEmail', 'loginEmailErr'); valid = false; }
  else clearFieldError('loginEmail', 'loginEmailErr');

  if (!pw) { showFieldError('loginPw', 'loginPwErr'); valid = false; }
  else clearFieldError('loginPw', 'loginPwErr');

  if (!valid) return;

  const btn = document.querySelector('#loginForm .btn--primary');
  if (btn) { btn.textContent = '⏳ Đang đăng nhập...'; btn.disabled = true; }

  setTimeout(() => {
    const user = {
      name:  email.split('@')[0],
      email, role: 'user',
      token: 'jwt_' + Date.now(),
    };
    setCurrentUser(user);
    showToast('✓ Đăng nhập thành công!', 'success');
    const redirectUrl = getParam('redirect') || 'profile.html';
    setTimeout(() => { window.location.href = redirectUrl; }, 1400);
  }, 1200);
}

function doRegister() {
  const name    = document.getElementById('regName')?.value.trim();
  const email   = document.getElementById('regEmail')?.value.trim();
  const pw      = document.getElementById('regPw')?.value;
  const pwc     = document.getElementById('regPwConfirm')?.value;
  const agree   = document.getElementById('agreeTerms')?.checked;
  let valid     = true;

  if (!name)               { showFieldError('regName',      'regNameErr');      valid = false; } else clearFieldError('regName',      'regNameErr');
  if (!email || !email.includes('@')) { showFieldError('regEmail', 'regEmailErr'); valid = false; } else clearFieldError('regEmail', 'regEmailErr');
  if (!pw || pw.length < 8){ showFieldError('regPw',        'regPwErr');        valid = false; } else clearFieldError('regPw',        'regPwErr');
  if (pw !== pwc)           { showFieldError('regPwConfirm', 'regPwConfirmErr'); valid = false; } else clearFieldError('regPwConfirm', 'regPwConfirmErr');
  if (!agree) { showToast('Vui lòng đồng ý với điều khoản sử dụng!', 'warning'); valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#registerForm .btn--primary');
  if (btn) { btn.textContent = '⏳ Đang tạo tài khoản...'; btn.disabled = true; }

  setTimeout(() => {
    const user = { name, email, role: selectedRole, token: 'jwt_' + Date.now() };
    setCurrentUser(user);
    showToast(`Đăng ký thành công, Chào mừng ${name}!`, 'success');
    const redirectUrl = getParam('redirect') || 'profile.html';
    setTimeout(() => { window.location.href = redirectUrl; }, 1400);
  }, 1500);
}

function socialLogin(provider) {
  showToast(`🔄 Đang kết nối với ${provider}...`);
  setTimeout(() => {
    const user = {
      name:  provider + ' User',
      email: `user@${provider.toLowerCase()}.com`,
      role:  'user',
      token: 'jwt_social_' + Date.now(),
    };
    setCurrentUser(user);
    showToast(`✓ Đăng nhập ${provider} thành công!`, 'success');
    const redirectUrl = getParam('redirect') || 'profile.html';
    setTimeout(() => { window.location.href = redirectUrl; }, 1400);
  }, 1500);
}

function showFieldError(inputId, errId) {
  document.getElementById(inputId)?.classList.add('error');
  const err = document.getElementById(errId);
  if (err) err.style.display = 'block';
}

function clearFieldError(inputId, errId) {
  document.getElementById(inputId)?.classList.remove('error');
  const err = document.getElementById(errId);
  if (err) err.style.display = 'none';
}
