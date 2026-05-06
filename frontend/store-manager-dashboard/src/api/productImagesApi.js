// Real product-images API client (talks to the Laravel backend).
//
// All five exports return Promises and throw `ApiError` on non-2xx responses.
// Laravel-style envelopes ({ data: ... }) are unwrapped defensively so the
// caller always receives the inner payload.
//
// `upload(productId, files, options)` accepts an optional `onProgress`
// callback and `signal` (AbortSignal). When `onProgress` is provided the
// implementation switches to XMLHttpRequest so per-byte upload progress is
// available; otherwise it uses the plain `fetch` path.

import { apiBaseUrl } from '../config/index.js';

class ApiError extends Error {
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
 * Internal fetch helper. Always sends credentials and Accept: application/json.
 * Throws ApiError on non-2xx.
 *
 * @param {string} path
 * @param {RequestInit & { signal?: AbortSignal }} [opts]
 */
async function request(path, opts = {}) {
  const headers = {
    Accept: 'application/json',
    ...(opts.headers || {}),
  };

  // Don't override Content-Type when body is FormData — the browser must set
  // the multipart boundary itself.
  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

  return unwrap(body);
}

/**
 * Upload one or more images for a product.
 *
 * @param {number|string} productId
 * @param {File[]} files
 * @param {{
 *   onProgress?: (e: { loaded: number, total: number, percent: number }) => void,
 *   signal?: AbortSignal,
 * }} [options]
 * @returns {Promise<object[]>}  Array of ProductImage records
 */
export async function upload(productId, files, options = {}) {
  const { onProgress, signal } = options;

  const formData = new FormData();
  for (const file of files) {
    formData.append('images[]', file);
  }

  // Plain fetch path — used when the caller does not need per-byte progress.
  if (typeof onProgress !== 'function') {
    return request(`/api/admin/products/${productId}/images`, {
      method: 'POST',
      body: formData,
      signal,
    });
  }

  // XHR path — XMLHttpRequest exposes upload.onprogress, fetch does not.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', buildUrl(`/api/admin/products/${productId}/images`));
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');

    let aborted = false;
    const onAbort = () => {
      aborted = true;
      try {
        xhr.abort();
      } catch {
        /* ignore */
      }
    };

    if (signal) {
      if (signal.aborted) {
        reject(new DOMException('aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = event.total > 0 ? Math.round((event.loaded / event.total) * 100) : 0;
      try {
        onProgress({ loaded: event.loaded, total: event.total, percent });
      } catch {
        /* swallow consumer errors so they don't break the upload */
      }
    };

    xhr.onload = () => {
      if (signal) signal.removeEventListener('abort', onAbort);

      let parsed = null;
      const ct = xhr.getResponseHeader('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch {
          parsed = null;
        }
      } else {
        parsed = xhr.responseText || null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        // Notify 100% on success in case the browser didn't fire the final
        // progress event (some browsers omit it).
        try {
          onProgress({ loaded: 1, total: 1, percent: 100 });
        } catch {
          /* ignore */
        }
        resolve(unwrap(parsed));
      } else {
        const message =
          (parsed && typeof parsed === 'object' && parsed.message) ||
          `Request failed with status ${xhr.status}`;
        reject(new ApiError(message, xhr.status, parsed));
      }
    };

    xhr.onerror = () => {
      if (signal) signal.removeEventListener('abort', onAbort);
      reject(new ApiError('Network error during upload', 0, null));
    };

    xhr.onabort = () => {
      if (signal) signal.removeEventListener('abort', onAbort);
      if (aborted) {
        reject(new DOMException('aborted', 'AbortError'));
      } else {
        reject(new ApiError('Upload aborted', 0, null));
      }
    };

    xhr.send(formData);
  });
}

/**
 * Update metadata fields on an existing image.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 * @param {Partial<{ image_role: string, sort_order: number, alt_text_ar: string|null, alt_text_en: string|null }>} fields
 */
export async function patch(productId, imageId, fields) {
  return request(`/api/admin/products/${productId}/images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

/**
 * Delete an image. The backend may auto-promote another image to cover.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 */
export async function deleteImage(productId, imageId) {
  return request(`/api/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder images. `order` is an array of `{ id, sort_order }` entries (or
 * just an array of ids in the new order — the server accepts either shape).
 *
 * @param {number|string} productId
 * @param {Array<number|string|{ id: number|string, sort_order: number }>} order
 */
export async function reorder(productId, order) {
  return request(`/api/admin/products/${productId}/images/reorder`, {
    method: 'POST',
    body: JSON.stringify({ order }),
  });
}

/**
 * Promote an image to cover. The previous cover is demoted server-side.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 */
export async function setCover(productId, imageId) {
  return request(`/api/admin/products/${productId}/images/${imageId}/set-cover`, {
    method: 'POST',
  });
}
