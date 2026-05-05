import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/api.config.js';
import {
  apiRequest,
  clearStoredSession,
  getStatusLabel,
  getUserType,
  normalizeRole,
  readStoredToken,
  readStoredUser,
  redirectToLogin,
  requireRole,
} from '../utils/storeApi.js';

const StoreManagerContext = createContext(null);

export function StoreManagerProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
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
    setNotificationCount(items.filter((item) => !item.read).length);
    return items;
  }, []);

  const bootstrap = useCallback(async () => {
    if (!requireRole('store-manager')) {
      return;
    }

    setIsBootstrapping(true);

    try {
      await Promise.all([refreshProfile(), refreshNotifications()]);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearStoredSession();
        redirectToLogin();
      }
      console.error('Store manager bootstrap failed:', error);
    } finally {
      setIsBootstrapping(false);
    }
  }, [refreshNotifications, refreshProfile]);

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

    if (normalizeRole(getUserType(currentUser)) !== 'store-manager') {
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
      notificationCount,
      isBootstrapping,
      refreshProfile,
      refreshNotifications,
      logout,
      getStatusLabel,
    }),
    [
      token,
      currentUser,
      profile,
      notifications,
      notificationCount,
      isBootstrapping,
      refreshProfile,
      refreshNotifications,
      logout,
    ]
  );

  return (
    <StoreManagerContext.Provider value={contextValue}>
      {children}
    </StoreManagerContext.Provider>
  );
}

export function useStoreManager() {
  const context = useContext(StoreManagerContext);

  if (!context) {
    throw new Error('useStoreManager must be used within StoreManagerProvider');
  }

  return context;
}

export default StoreManagerContext;
