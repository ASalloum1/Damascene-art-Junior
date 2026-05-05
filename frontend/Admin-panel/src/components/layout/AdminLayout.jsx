import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import styles from './AdminLayout.module.css';

const PAGE_TITLES = {
  dashboard: 'لوحة التحكم',
  users: 'إدارة المستخدمين',
  stores: 'إدارة المتاجر',
  products: 'إدارة المنتجات',
  orders: 'إدارة الطلبات',
  finance: 'الإدارة المالية',
  analytics: 'التقارير والتحليلات',
  messages: 'الرسائل والطلبات',
  notifications: 'إدارة الإشعارات',
  reviews: 'إدارة التقييمات',
  profile: 'الملف الشخصي',
  coupons: 'إدارة الكوبونات',
};

/**
 * AdminLayout — Root layout wrapper with sidebar and top bar
 *
 * @param {React.ReactNode} children
 * @param {string} activePage
 * @param {function} setActivePage
 */
export default function AdminLayout({ children, activePage, setActivePage }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebarCollapsed', String(next));
      } catch {}
      return next;
    });
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activePage={activePage}
        onNavigate={setActivePage}
        badgeCounts={{ messages: 3, notifications: 5, reviews: 2 }}
      />
      <div className={styles.main}>
        <TopBar
          title={PAGE_TITLES[activePage] || 'لوحة التحكم'}
          notificationCount={5}
          adminName="المشرف العام"
          onNotificationClick={() => setActivePage('notifications')}
          onProfileClick={() => setActivePage('profile')}
        />
        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
