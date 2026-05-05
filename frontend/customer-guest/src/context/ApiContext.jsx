import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api.config.js';
import { getAuthHeaders, readJsonSafely } from '../utils/customerApi.js';

const ApiContext = createContext(null);

const EMPTY_CART_SUMMARY = {
  count: 0,
  items_count: 0,
  products_count: 0,
  subtotal: 0,
  discount: 0,
  shipping_cost: 0,
  wrapping_cost: 0,
  total: 0,
  product_carts: [],
  cart: null,
};

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
}

function getStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function ApiProvider({ children }) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestPlacedOrder, setLatestPlacedOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [bearerToken, setBearerToken] = useState(() => getStoredToken() || API_CONFIG.BEARER_TOKEN || '');
  const [cartSummary, setCartSummary] = useState(EMPTY_CART_SUMMARY);

  const syncSession = useCallback(() => {
    setCurrentUser(getStoredUser());
    setBearerToken(getStoredToken() || API_CONFIG.BEARER_TOKEN || '');
  }, []);

  const refreshCartSummary = useCallback(async () => {
    const activeToken = getStoredToken() || API_CONFIG.BEARER_TOKEN || '';

    if (!activeToken) {
      setCartSummary(EMPTY_CART_SUMMARY);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.cartSummary}`, {
        method: 'GET',
        headers: getAuthHeaders(activeToken),
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load cart summary');
      }

      setCartSummary({
        ...EMPTY_CART_SUMMARY,
        ...(data?.data || {}),
      });
    } catch (error) {
      console.error('Cart summary sync failed:', error);
      setCartSummary(EMPTY_CART_SUMMARY);
    }
  }, []);

  useEffect(() => {
    syncSession();

    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleAuthChange = () => {
      syncSession();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [syncSession]);

  useEffect(() => {
    if (bearerToken) {
      refreshCartSummary();
    } else {
      setCartSummary(EMPTY_CART_SUMMARY);
    }
  }, [bearerToken, refreshCartSummary]);

  const apiConfig = {
    baseUrl: API_CONFIG.BASE_URL,
    bearerToken,
    currentUser,
    endpoints: API_CONFIG.ENDPOINTS,
    selectedProductId,
    setSelectedProductId,
    selectedCategory,
    setSelectedCategory,
    selectedOrderId,
    setSelectedOrderId,
    searchQuery,
    setSearchQuery,
    latestPlacedOrder,
    setLatestPlacedOrder,
    cartSummary,
    refreshCartSummary,
  };

  // Validate token exists
  if (!bearerToken) {
    console.warn('⚠️ No authentication token found. Please login first.');
  }

  return <ApiContext.Provider value={apiConfig}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
}

export default ApiContext;
