export const API_CONFIG = {
  BASE_URL: '',
  DEFAULT_HEADERS: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  ENDPOINTS: {
    dashboard: '/api/store-manager/dashboard',
    inventory: '/api/store-manager/inventory',
    reports: '/api/store-manager/reports',
    products: '/api/store-manager/products',
    productDetails: (productId) => `/api/store-manager/products/${productId}`,
    productStatus: (productId) => `/api/store-manager/products/${productId}/status`,
    orders: '/api/store-manager/orders',
    orderDetails: (orderId) => `/api/store-manager/orders/${orderId}`,
    orderStatus: (orderId) => `/api/store-manager/orders/${orderId}/status`,
    reviews: '/api/store-manager/reviews',
    reviewStatus: (source, reviewId) => `/api/store-manager/reviews/${source}/${reviewId}/status`,
    messages: '/api/store-manager/messages',
    messageStatus: (kind, messageId) => `/api/store-manager/messages/${kind}/${messageId}/status`,
    notifications: '/api/store-manager/notifications',
    notificationRead: (notificationId) => `/api/store-manager/notifications/${notificationId}/read`,
    notificationsReadAll: '/api/store-manager/notifications/read-all',
    profile: '/api/store-manager/profile',
    profilePassword: '/api/store-manager/profile/password',
  },
};

export default API_CONFIG;
