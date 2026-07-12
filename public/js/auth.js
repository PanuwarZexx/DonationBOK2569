// ===== Auth JS =====
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = '/login.html'; return false; }
  return true;
}
function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; } }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }
function isStaff() { const u = getUser(); return u && (u.role === 'admin' || u.role === 'staff'); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login.html'; }

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('login-error');
      const btn = loginForm.querySelector('button[type="submit"]');
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner spinner-sm"></span> กำลังเข้าสู่ระบบ...';
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
      } catch (err) {
        if (errorEl) { errorEl.textContent = err.message; errorEl.style.display = 'block'; }
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ';
      }
    });
  }
  // Update navbar if logged in
  const user = getUser();
  if (user) {
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
      loginBtn.href = '/dashboard.html';
      loginBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
    }
  }
});
