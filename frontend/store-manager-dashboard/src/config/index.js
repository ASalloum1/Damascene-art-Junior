// Runtime config — read from Vite env at build time.
//
// VITE_API_BASE_URL is the origin (and optional path prefix) for backend
// requests. Trailing slashes are stripped so callers can safely concatenate
// paths that begin with "/". When unset, falls back to an empty string,
// which makes API requests resolve relative to the current page origin.

const raw = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiBaseUrl = String(raw).replace(/\/+$/, '');
