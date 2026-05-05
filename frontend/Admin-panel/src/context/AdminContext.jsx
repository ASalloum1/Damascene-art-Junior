import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/api.config.js';
import {
  apiRequest,
  clearStoredSession,
  getUserType,
  getStatusLabel,
  normalizeRole,
  readStoredToken,
  readStoredUser,
  redirectToLogin,
  requireRole,
} from '../utils/adminApi.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [badgeCounts, setBadgeCounts] = useState({
    messages: 0,
    notifications: 0,
    reviews: 0,
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const syncSession = useCallback(() => {
    setToken(readStoredToken());
    setCurrentUser(readStoredUser());
  }, []);

  const refreshProfile = useCallback(async () => {
    const data = await apiRequest(API_CONFIG.ENDPOINTS.profile);
    setProfile(data?.data?.profile || null);
    return data?.data?.profile || null;
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await apiRequest(API_CONFIG.ENDPOINTS.notifications);
    const items = data?.data?.notifications || [];
    setNotifications(items);
    return items;
  }, []);

  const refreshBadgeCounts = useCallback(async () => {
    const [notificationsData, messagesData, reviewsData] = await Promise.allSettled([
      apiRequest(API_CONFIG.ENDPOINTS.notifications),
      apiRequest(`${API_CONFIG.ENDPOINTS.messages}?unread=1`),
      apiRequest(`${API_CONFIG.ENDPOINTS.reviews}?status=pending`),
    ]);

    const notificationItems =
      notificationsData.status === 'fulfilled'
        ? notificationsData.value?.data?.notifications || []
        : [];
    const messageItems =
      messagesData.status === 'fulfilled'
        ? messagesData.value?.data?.messages || []
        : [];
    const reviewItems =
      reviewsData.status === 'fulfilled'
        ? reviewsData.value?.data?.reviews || []
        : [];

    setNotifications(notificationItems);
    setBadgeCounts({
      messages: messageItems.filter((item) => item.unread).length || messageItems.length,
      notifications: notificationItems.filter((item) => !item.read).length,
      reviews: reviewItems.length,
    });
  }, []);

  const bootstrap = useCallback(async () => {
    if (!requireRole('admin')) {
      return;
    }

    setIsBootstrapping(true);

    try {
      await Promise.all([refreshProfile(), refreshBadgeCounts()]);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearStoredSession();
        redirectToLogin();
      }
      console.error('Admin bootstrap failed:', error);
    } finally {
      setIsBootstrapping(false);
    }
  }, [refreshBadgeCounts, refreshProfile]);

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
    if (!token || !currentUser) {
      redirectToLogin();
      return;
    }

    if (normalizeRole(getUserType(currentUser)) !== 'admin') {
      redirectToLogin();
      return;
    }

    bootstrap();
  }, [bootstrap, currentUser, token]);

  const logout = useCallback(() => {
    clearStoredSession();
    redirectToLogin();
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      currentUser,
      profile,
      notifications,
      badgeCounts,
      isBootstrapping,
      refreshProfile,
      refreshNotifications,
      refreshBadgeCounts,
      logout,
      getStatusLabel,
    }),
    [
      token,
      currentUser,
      profile,
      notifications,
      badgeCounts,
      isBootstrapping,
      refreshProfile,
      refreshNotifications,
      refreshBadgeCounts,
      logout,
    ]
  );

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }

  return context;
}

export default AdminContext;
