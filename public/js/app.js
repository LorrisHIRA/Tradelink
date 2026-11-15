// Small helpers shared by all pages

function getToken() { return localStorage.getItem('tl_token'); }
function saveSession(token, name) {
  localStorage.setItem('tl_token', token);
  localStorage.setItem('tl_name', name);
}
function logout() {
  localStorage.removeItem('tl_token');
  localStorage.removeItem('tl_name');
  window.location.href = '/login.html';
}

async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong.');
    err.field = data.field;
    err.status = res.status;
    throw err;
  }
  return data;
}

// Show an error under one field, or in the general box if no field is given
function showError(err) {
  document.querySelectorAll('.error').forEach(e => (e.textContent = ''));
  const target = document.getElementById('err-' + err.field) || document.getElementById('err-general');
  if (target) target.textContent = err.message;
}
