/**
 * API Configuration
 * Central place to manage API settings
 * Change BASE_URL here to update it everywhere in the app
 */

export const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://undecided-vastly-replica.ngrok-free.dev',

  // Endpoints
  ENDPOINTS: {
    specialOrders: '/api/customers/special-orders',
    contactUs: '/api/contact',
    products: '/api/customers/products',
    productDetails: '/api/customers/products/details',
    login: '/api/login',
    register: '/api/customers/register',
  },

  // Bearer token for authenticated requests
  BEARER_TOKEN: import.meta.env.VITE_SPECIAL_ORDERS_BEARER_TOKEN,

  // Request headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
};

export default API_CONFIG;
