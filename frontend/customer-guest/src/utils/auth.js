import { API_CONFIG } from '../config/api.config.js';

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function extractAuthData(payload = {}) {
  const data = payload?.data ?? payload;

  return {
    token: data?.token ?? payload?.token ?? null,
    user: data?.user ?? payload?.user ?? null,
  };
}

export function normalizeUserRole(role = '') {
  const normalized = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

  if (normalized === 'admins') {
    return 'admin';
  }

  if (normalized === 'customer') {
    return 'customers';
  }

  if (normalized === 'storemanager') {
    return 'store-manager';
  }

  return normalized;
}

export function persistAuthSession({ token, user }) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    localStorage.setItem('token', token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  window.dispatchEvent(new Event('auth-changed'));
}

export async function loginWithCredentials({ baseUrl, email, password, loginEndpoint }) {
  const response = await fetch(`${baseUrl}${loginEndpoint}`, {
    method: 'POST',
    headers: API_CONFIG.DEFAULT_HEADERS,
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await readJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.message || 'فشل تسجيل الدخول');
  }

  return data;
}

export function redirectToUserLanding(user = {}) {
  const userType = normalizeUserRole(user?.type || user?.actor_type || user?.actorType);

  if (userType === 'admin') {
    window.location.href = '/admin/';
    return;
  }

  if (userType === 'store-manager') {
    window.location.href = '/store/';
    return;
  }

  window.location.href = '/';
}
