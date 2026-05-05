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

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const Page = PAGES[activePage] || DashboardPage;

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage}>
      <Page onNavigate={setActivePage} />
    </AdminLayout>
  );
}
