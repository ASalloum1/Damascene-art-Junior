// Real visual-search API client. Talks to the Laravel endpoints described
// in visual-search-FRONTEND-spec-v2.md §3.
//
// This module is paired with `visualSearchApi.mock.js` and selected via
// `visualSearchApi.index.js` based on VITE_VISUAL_SEARCH_USE_MOCK.
//
// Auth: this feature is available to guests, so we DO NOT send an
// Authorization header and DO NOT set credentials: 'include'. The ngrok
// tunnel browser-warning interstitial is bypassed with the dedicated
// header that ngrok understands.
//
// Errors: throws a plain Error decorated with `.status` (HTTP status code)
// and `.body` (parsed JSON envelope when available). The hook reads
// err.body?.message to surface backend-provided Arabic copy.

import { API_CONFIG } from '../config/api.config.js';

const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };
const GENERIC_ERROR = 'حدث خطأ غير متوقع. حاول مجدداً.';

function buildUrl(path) {
  const base = String(API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * POST /api/visual-search — multipart upload returning ranked products.
 *
 * @param {File} file
 * @param {{ page?: number, perPage?: number, signal?: AbortSignal }} [opts]
 * @returns {Promise<object>} the raw JSON envelope (see spec §3.1)
 */
export async function search(file, { page = 1, perPage = 10, signal } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('page', String(page));
  form.append('per_page', String(perPage));

  // IMPORTANT: do NOT set Content-Type here. When `body` is a FormData
  // instance the browser computes the multipart boundary and writes the
  // correct `Content-Type: multipart/form-data; boundary=...` header
  // itself. Setting it manually breaks the upload because the boundary
  // never matches what the body actually contains.
  const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.visualSearch), {
    method: 'POST',
    headers: { ...NGROK_HEADER },
    body: form,
    signal,
  });

  if (!response.ok) {
    const body = await parseJsonSafe(response);
    const err = new Error(body?.message || `Visual search failed: ${response.status}`);
    err.status = response.status;
    err.body = body || { message: GENERIC_ERROR };
    throw err;
  }

  return response.json();
}

/**
 * POST /api/visual-search/click — fire-and-forget analytics ping.
 *
 * Intentionally JSON (not multipart) and uses keepalive so the request
 * survives the navigation that typically follows a click on a result.
 * No AbortSignal is wired in — cancelling a click log makes no sense and
 * tying it to the search controller would cancel logs whenever the user
 * starts a new search.
 *
 * @param {{ query_id: number, product_id: number, result_position: number, similarity_score: number }} payload
 */
export async function logClick(payload) {
  return fetch(buildUrl(API_CONFIG.ENDPOINTS.visualSearchClick), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...NGROK_HEADER,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}
