import { apiBaseUrl } from '../config/index.js';

/**
 * Resolve a possibly-relative image URL against the API base URL.
 *
 * - Absolute URLs (http://, https://, data:, blob:) are returned as-is
 * - Local previews from URL.createObjectURL() pass through (blob:)
 * - Mock data using Picsum URLs passes through
 * - Real backend returns "/storage/..." which gets prefixed
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
