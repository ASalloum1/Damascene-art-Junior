import { useState } from 'react';
import AdminLayout from './components/layout/AdminLayout.jsx';
import DashboardPage from './pages/admin/Dashboard.jsx';
import UserManagementPage from './pages/admin/UserManagement.jsx';
import StoresManagementPage from './pages/admin/StoresManagement.jsx';
import ProductsManagementPage from './pages/admin/ProductsManagement.jsx';
import OrdersManagementPage from './pages/admin/OrdersManagement.jsx';
import FinancialManagementPage from './pages/admin/FinancialManagement.jsx';
import AnalyticsPage from './pages/admin/Analytics.jsx';
import ActivityLogPage from './pages/admin/ActivityLog.jsx';
import MessagesPage from './pages/admin/Messages.jsx';
import NotificationsPage from './pages/admin/Notifications.jsx';
import ReviewsManagementPage from './pages/admin/ReviewsManagement.jsx';
import SiteSettingsPage from './pages/admin/SiteSettings.jsx';
import AdminProfilePage from './pages/admin/AdminProfile.jsx';

const PAGES = {
  dashboard: DashboardPage,
  users: UserManagementPage,
  stores: StoresManagementPage,
  products: ProductsManagementPage,
  orders: OrdersManagementPage,
  finance: FinancialManagementPage,
  analytics: AnalyticsPage,
  'activity-log': ActivityLogPage,
  messages: MessagesPage,
  notifications: NotificationsPage,
  reviews: ReviewsManagementPage,
  'site-settings': SiteSettingsPage,
  profile: AdminProfilePage,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const Page = PAGES[activePage] || DashboardPage;

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage}>
      <Page onNavigate={setActivePage} />
    </AdminLayout>
  );
}
