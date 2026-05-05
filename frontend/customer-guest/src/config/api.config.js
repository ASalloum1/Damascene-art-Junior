/**
 * API Configuration
 * Central place to manage API settings
 * Change BASE_URL here to update it everywhere in the app
 */

export const API_CONFIG = {
  // Use the current frontend origin and let Vite proxy /api and /storage to Laravel.
  BASE_URL: '',

  // Endpoints
  ENDPOINTS: {
    specialOrders: '/api/customers/special-orders',
    contactUs: '/api/customers/contact-us',
    products: '/api/customers/products',
    productDetails: (productId) => `/api/customers/products/${productId}`,
    categories: '/api/customers/categories',
    categoryProducts: (categoryId) => `/api/customers/categories/${categoryId}/products`,
    search: '/api/customers/search',
    cart: '/api/customers/carts/in-progres',
    cartSummary: '/api/customers/cart-summary',
    login: '/api/login',
    register: '/api/customers/register',
    visualSearch: '/api/visual-search',
    visualSearchClick: '/api/visual-search/click',
    chat: '/api/chat',
    chatHealth: '/api/chat/health',
    account: '/api/customers/account',
    profile: '/api/customers/profile',
    profilePassword: '/api/customers/profile/password',
    orders: '/api/customers/orders',
    latestOrders: '/api/customers/orders/latest',
    orderDetails: (orderId) => `/api/customers/orders/${orderId}`,
    orderTracking: (orderId) => `/api/customers/orders/${orderId}/tracking`,
    checkout: '/api/customers/checkout',
    addresses: '/api/customers/addresses',
    addressesDelete: '/api/customers/addresses/delete',
    wishlists: '/api/customers/wish-lists',
    productCarts: '/api/customers/product-carts',
    productCartDelete: '/api/customers/product-carts/delete',
    productCartPlusOne: '/api/customers/product-carts/plus-one',
    productCartMinusOne: '/api/customers/product-carts/minus-one',
    applyCoupon: '/api/customers/carts/apply-coupon',
  },

  // Bearer token for authenticated requests
  BEARER_TOKEN: import.meta.env.VITE_SPECIAL_ORDERS_BEARER_TOKEN,

  // Request headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
