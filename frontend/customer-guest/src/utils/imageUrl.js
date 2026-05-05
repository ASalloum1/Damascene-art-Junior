// Resolve possibly-relative image URLs returned by the backend against the
// configured API base URL.
//
// The backend returns image paths as either absolute URLs (mock data uses
// Picsum, real backend may occasionally return a CDN URL) or as relative
// "/storage/..." paths. The frontend should never have to care which it
// got — call this helper at the render site and you get a usable src.
//
// Trailing slashes on BASE_URL are stripped so concatenation is safe; if
// the path is missing a leading slash we add one.

import { API_CONFIG } from '../config/api.config.js';

// Hoisted to module scope so we don't rebuild the regex on every call.
const ABSOLUTE_URL_RE = /^(https?:|data:|blob:)/;

/**
 * Resolve a possibly-relative image URL against the API base URL.
 *
 * Behavior matrix (the 11 contract cases):
 *   1.  null                         → null
 *   2.  undefined                    → null
 *   3.  '' (empty string)            → null
 *   4.  'https://x.com/a.jpg'        → 'https://x.com/a.jpg'
 *   5.  'http://x.com/a.jpg'         → 'http://x.com/a.jpg'
 *   6.  'data:image/png;base64,...'  → returned as-is
 *   7.  'blob:http://...'            → returned as-is
 *   8.  '/storage/products/1.jpg'    → '<BASE_URL>/storage/products/1.jpg'
 *   9.  'storage/products/1.jpg'     → '<BASE_URL>/storage/products/1.jpg'
 *   10. BASE_URL with trailing '/'   → trailing slash stripped before join
 *   11. path without leading '/'     → leading '/' inserted
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (ABSOLUTE_URL_RE.test(url)) return url;
  const base = String(API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default resolveImageUrl;
