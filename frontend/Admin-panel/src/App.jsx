import { useState } from 'react';
import AdminLayout from './components/layout/AdminLayout.jsx';
import DashboardPage from './pages/admin/Dashboard.jsx';
import UserManagementPage from './pages/admin/UserManagement.jsx';
import StoresManagementPage from './pages/admin/StoresManagement.jsx';
import ProductsManagementPage from './pages/admin/ProductsManagement.jsx';
import OrdersManagementPage from './pages/admin/OrdersManagement.jsx';
import FinancialManagementPage from './pages/admin/FinancialManagement.jsx';
import AnalyticsPage from './pages/admin/Analytics.jsx';
import MessagesPage from './pages/admin/Messages.jsx';
import NotificationsPage from './pages/admin/Notifications.jsx';
import ReviewsManagementPage from './pages/admin/ReviewsManagement.jsx';
import AdminProfilePage from './pages/admin/AdminProfile.jsx';
import CouponsManagementPage from './pages/admin/CouponsManagement.jsx';
import { AdminProvider, useAdmin } from './context/AdminContext.jsx';

const PAGES = {
  dashboard: DashboardPage,
  users: UserManagementPage,
  stores: StoresManagementPage,
  products: ProductsManagementPage,
  orders: OrdersManagementPage,
  finance: FinancialManagementPage,
  analytics: AnalyticsPage,
  messages: MessagesPage,
  notifications: NotificationsPage,
  reviews: ReviewsManagementPage,
  profile: AdminProfilePage,
  coupons: CouponsManagementPage,
};

function AdminShell() {
  const [activePage, setActivePage] = useState('dashboard');
  const { badgeCounts, isBootstrapping, profile } = useAdmin();

  const Page = PAGES[activePage] || DashboardPage;

  if (isBootstrapping) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        جاري تهيئة لوحة التحكم...
      </div>
    );
  }

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
      badgeCounts={badgeCounts}
      notificationCount={badgeCounts.notifications}
      adminName={profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'المشرف العام'}
    >
      <Page onNavigate={setActivePage} />
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
