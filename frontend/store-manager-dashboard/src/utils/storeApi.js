import { API_CONFIG } from '../config/api.config.js';

export function readStoredToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('token') || '';
}

export function readStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function getUserType(user = {}) {
  return user?.type || user?.actor_type || user?.actorType || '';
}

export function normalizeRole(role = '') {
  return String(role || '').replace(/_/g, '-');
}

export function getAuthHeaders(token = readStoredToken(), headers = {}) {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

export async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function apiRequest(path, options = {}) {
  const {
    token = readStoredToken(),
    method = 'GET',
    body,
    headers = {},
  } = options;

  const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders(token, headers),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    const error = new Error(payload?.message || 'فشل تنفيذ الطلب');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-changed'));
}

export function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.href = '/';
}

export function requireRole(expectedRole) {
  const token = readStoredToken();
  const user = readStoredUser();

  if (!token || normalizeRole(getUserType(user)) !== normalizeRole(expectedRole)) {
    redirectToLogin();
    return false;
  }

  return true;
}

export function getStatusLabel(status) {
  const map = {
    active: 'نشط',
    disabled: 'معطّل',
    hidden: 'مخفي',
    out_of_stock: 'نفد المخزون',
    new: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    returned: 'مرتجع',
    pending: 'بانتظار',
    published: 'منشور',
    rejected: 'مرفوض',
    in_progress: 'قيد المتابعة',
    replied: 'تم الرد',
    closed: 'مغلق',
    low_stock: 'منخفض',
  };

  return map[status] || status || '—';
}

export function getPaymentMethodLabel(method) {
  const map = {
    credit_card: 'بطاقة ائتمان',
    paypal: 'PayPal',
    bank_transfer: 'تحويل بنكي',
    cash_on_delivery: 'دفع عند التسليم',
  };

  return map[method] || method || '—';
}

export function getNotificationTypeLabel(type) {
  const map = {
    order: 'طلب',
    alert: 'تنبيه',
    message: 'رسالة',
    financial: 'مالية',
    user: 'مستخدم',
    review: 'تقييم',
  };

  return map[type] || type || 'إشعار';
}
