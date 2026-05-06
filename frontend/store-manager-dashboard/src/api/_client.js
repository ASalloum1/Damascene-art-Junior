// Tiny fetch wrapper for store-manager API routes.
// All routes are scoped server-side by the bearer token — clients send NO
// store_id parameter for security reasons (spec §4 backend).
//
// Usage:
//   import { apiFetch, ApiError } from './_client.js';
//   const data = await apiFetch('/api/store-manager/reports/kpis', {
//     query: { from, to },
//     token,
//     signal,
//   });

import { apiBaseUrl } from '../config/index.js';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path, query) {
  const base = `${apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  if (!query) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

async function parseBody(response) {
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

/**
 * apiFetch — JSON-aware fetch wrapper.
 *
 * @param {string} path
 * @param {{
 *   method?: string,
 *   query?: Record<string, string|number|boolean|null|undefined>,
 *   body?: any,
 *   token?: string|null,
 *   headers?: Record<string, string>,
 *   signal?: AbortSignal,
 * }} [opts]
 */
export async function apiFetch(path, opts = {}) {
  const { method = 'GET', query, body, token, headers = {}, signal } = opts;

  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const init = {
    method,
    headers: finalHeaders,
    credentials: 'include',
    signal,
  };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(buildUrl(path, query), init);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === 'object' && parsed.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, parsed);
  }

  return unwrap(parsed);
}
