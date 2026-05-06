// Real reviews API client (talks to the Laravel backend).
//
// Mirrors the shape of `productImagesApi.js`: thin fetch wrapper, JSON
// envelope unwrap, custom `ApiError` so callers can switch on HTTP status.
// Currently exposes a single endpoint — `replyToReview` — used by the
// Reply-by-Email modal in ReviewsManagement.jsx.

import { apiBaseUrl } from '../config/index.js';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path) {
  return `${apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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
 * Internal fetch helper. Always sends credentials and Accept: application/json.
 * Throws ApiError on non-2xx.
 */
async function request(path, opts = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  const response = await fetch(buildUrl(path), {
    ...opts,
    headers,
    credentials: 'include',
  });

  const body = await parseBody(response);

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && body.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}

/**
 * Send an admin reply to a customer review. The backend dispatches an
 * email via SMTP (no row inserted into the DB — see backend requirements).
 *
 * @param {string|number} reviewId
 * @param {{ subject: string, message: string }} payload
 * @returns {Promise<object>}
 */
export async function replyToReview(reviewId, { subject, message }) {
  return request(`/api/admin/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ subject, message }),
  });
}
