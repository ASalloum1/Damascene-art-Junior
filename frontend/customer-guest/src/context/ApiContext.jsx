import { createContext, useContext, useState } from 'react';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Get token from localStorage (after login) or from .env (for development)
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const envToken = import.meta.env.VITE_SPECIAL_ORDERS_BEARER_TOKEN;
  const bearerToken = storedToken || envToken;

  const apiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://d8b7-169-150-196-135.ngrok-free.app',
    bearerToken: bearerToken,
    endpoints: {
      specialOrders: '/api/customers/special-orders',
      contactUs: '/api/contact',
      products: '/api/customers/products', // Public endpoint - no auth needed
      productDetails: '/api/customers/products/details', // Get single product details
      // Add more endpoints as needed
    },
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
