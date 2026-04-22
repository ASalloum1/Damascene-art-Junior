import { createContext, useContext, useState } from 'react';
import { API_CONFIG } from '../config/api.config.js';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Get token from localStorage (after login) or from config
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const bearerToken = storedToken || API_CONFIG.BEARER_TOKEN;

  const apiConfig = {
    baseUrl: API_CONFIG.BASE_URL,
    bearerToken: bearerToken,
    endpoints: API_CONFIG.ENDPOINTS,
    selectedProductId,
    setSelectedProductId,
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
