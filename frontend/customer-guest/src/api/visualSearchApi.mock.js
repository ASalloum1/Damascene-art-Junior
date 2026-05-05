// Mock visual-search API client.
//
// Mirrors the response shape and error semantics of the real Laravel
// endpoints described in visual-search-FRONTEND-spec-v2.md §3, so the UI
// can be developed end-to-end before the backend lands. The branch in
// `visualSearchApi.index.js` selects between this module and the real
// client based on VITE_VISUAL_SEARCH_USE_MOCK.
//
// Behavior summary:
//   - Latency: 1500–3000 ms via abortableSleep, fully cancellable.
//   - File > 10 MB → throws { status: 422, body: { message: <ar> } }.
//   - Filename contains 'fail' → service_available: false envelope.
//   - Filename contains 'empty' → service_available: true with zero results.
//   - Otherwise → 27 results from mockProducts, descending similarity,
//                 paginated by per_page (defaults to 10).

import { mockProducts } from './mockData.js';

const TOTAL_MOCK_RESULTS = 27;
const DEFAULT_PER_PAGE = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Promise-based sleep that respects an AbortSignal.
 *
 * - If `signal` is already aborted when called, rejects synchronously
 *   with a DOMException('Aborted', 'AbortError').
 * - On abort during the wait, clears the timeout and rejects.
 * - On natural resolve, removes the abort listener so we don't leak it
 *   for the lifetime of the controller.
 */
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort);
  });
}

function jitterMs() {
  return 1500 + Math.random() * 1500;
}

function buildEnvelopeUnavailable() {
  return {
    query_id: Math.floor(Math.random() * 10000) + 1,
    service_available: false,
    message: 'خدمة البحث البصري غير متاحة حالياً. حاول مجدداً بعد قليل.',
    results: [],
    pagination: { page: 1, per_page: DEFAULT_PER_PAGE, total_pages: 1, total_results: 0 },
  };
}

function buildEnvelopeEmpty(page, perPage) {
  return {
    query_id: Math.floor(Math.random() * 10000) + 1,
    service_available: true,
    results: [],
    pagination: { page, per_page: perPage, total_pages: 1, total_results: 0 },
  };
}

function buildAllResults() {
  // Cycle through mockProducts to fill TOTAL_MOCK_RESULTS rows. Each row
  // gets a distinct rank, a synthetic product_image_id, and a descending
  // similarity score that lands in [0.94, ~0.36] so the UI can show a
  // realistic spread.
  const out = new Array(TOTAL_MOCK_RESULTS);
  for (let i = 0; i < TOTAL_MOCK_RESULTS; i += 1) {
    const product = mockProducts[i % mockProducts.length];
    out[i] = {
      product,
      product_image_id: 1000 + i,
      matched_image_url: product.thumbnail_url,
      similarity_score: Number((0.94 - i * 0.022).toFixed(4)),
      rank: i + 1,
    };
  }
  return out;
}

/**
 * Mock implementation of POST /api/visual-search.
 *
 * @param {File} file
 * @param {{ page?: number, perPage?: number, signal?: AbortSignal }} [opts]
 * @returns {Promise<object>}
 */
export async function search(file, { page = 1, perPage = DEFAULT_PER_PAGE, signal } = {}) {
  await abortableSleep(jitterMs(), signal);

  if (file && file.size > MAX_FILE_BYTES) {
    const err = new Error('File too large');
    err.status = 422;
    err.body = { message: 'حجم الملف يتجاوز 10 ميجابايت' };
    throw err;
  }

  const lowerName = (file?.name || '').toLowerCase();

  if (lowerName.includes('fail')) {
    return buildEnvelopeUnavailable();
  }

  if (lowerName.includes('empty')) {
    return buildEnvelopeEmpty(page, perPage);
  }

  const allResults = buildAllResults();
  const offset = (page - 1) * perPage;

  return {
    query_id: Math.floor(Math.random() * 10000) + 1,
    service_available: true,
    results: allResults.slice(offset, offset + perPage),
    pagination: {
      page,
      per_page: perPage,
      total_pages: Math.ceil(allResults.length / perPage),
      total_results: allResults.length,
    },
  };
}

/**
 * Mock implementation of POST /api/visual-search/click.
 * Fire-and-forget in production; here we just log so devs can see it.
 */
export async function logClick(payload) {
  // eslint-disable-next-line no-console
  console.log('[mock] visual-search click:', payload);
  return { logged: true };
}
