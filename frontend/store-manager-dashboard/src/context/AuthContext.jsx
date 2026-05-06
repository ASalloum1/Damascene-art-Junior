import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiBaseUrl } from '../config/index.js';
import { mockUsers, mockStores } from '../data/mockData.js';

// ── Context ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * useAuth — returns current auth state.
 *
 * Shape: { user, token, isLoading, error, storeId, storeName, refresh }
 *   user:    { id, fullName, email, storeId, storeName, avatarPath } | null
 *   token:   string | null
 *   storeId / storeName: derived from user.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ── Mock identity resolver ───────────────────────────────────────────
function resolveMockUser() {
  const fallbackId = import.meta.env.VITE_MOCK_MANAGER_USER_ID || 'u2';
  const candidate =
    mockUsers.find((u) => u.id === fallbackId && u.role === 'مدير متجر') ||
    mockUsers.find((u) => u.role === 'مدير متجر');
  if (!candidate) return null;

  const store =
    mockStores.find((s) => s.name === candidate.store) || mockStores[0] || null;

  return {
    id: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    storeId: store ? store.id : null,
    storeName: store ? store.name : candidate.store || '',
    avatarPath: null,
  };
}

// ── Live fetch ───────────────────────────────────────────────────────
async function fetchMe(token, signal) {
  const url = `${apiBaseUrl}/api/store-manager/me`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load current user (status ${response.status})`);
  }
  const body = await response.json();
  // Defensive unwrap for Laravel-style { data: ... } envelopes.
  return body && typeof body === 'object' && 'data' in body ? body.data : body;
}

// ── Provider ─────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Lazy init so localStorage read only happens once.
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => (token ? null : resolveMockUser()));
  const [isLoading, setIsLoading] = useState(() => Boolean(token));
  const [error, setError] = useState(null);

  // Track latest fetch so a stale resolution can't overwrite a newer one.
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (!token) {
      // No token → mock identity already set by lazy initializer; nothing to
      // fetch. isLoading was initialized to `Boolean(token)` so it's already
      // false here. Avoid setState in this branch (cascading-render lint).
      return;
    }

    const controller = new AbortController();
    const fetchId = ++fetchIdRef.current;

    // No setIsLoading(true) here: isLoading was initialized to true via the
    // lazy initializer when a token exists, and we don't currently support
    // post-mount token swaps. Setting state synchronously inside an effect
    // would also trip the react-hooks/set-state-in-effect rule.

    fetchMe(token, controller.signal)
      .then((data) => {
        if (fetchId !== fetchIdRef.current) return;
        setUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (fetchId !== fetchIdRef.current) return;
        if (err && err.name === 'AbortError') return;
        // Fall back to mock so the UI keeps functioning.
        const fallback = resolveMockUser();
        setUser(fallback);
        setError(err.message || 'Failed to load user');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  const value = useMemo(() => {
    const storeId = user ? user.storeId : null;
    const storeName = user ? user.storeName : '';
    return {
      user,
      token,
      isLoading,
      error,
      storeId,
      storeName,
      setToken,
    };
  }, [user, token, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
