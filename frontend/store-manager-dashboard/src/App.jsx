import { useState } from 'react';
import { ToastProvider } from './components/ui/Toast.jsx';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import styles from './App.module.css';

const pages = {
  dashboard: DashboardPage,
  products: ProductsPage,
  inventory: InventoryPage,
  orders: OrdersPage,
  reports: ReportsPage,
  reviews: ReviewsPage,
  notifications: NotificationsPage,
  profile: ProfilePage,
  messages: MessagesPage,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActivePage = pages[activePage];

  return (
    <ToastProvider>
      <div className={styles.layout}>
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className={styles.body}>
          <Header
            activePage={activePage}
            onNavigate={(page) => setActivePage(page)}
            onMobileMenuOpen={() => setMobileOpen(true)}
          />
          <main id="main-content" className={styles.content} aria-label="محتوى الصفحة">
            <div key={activePage} className={styles.pageWrapper}>
              <ActivePage />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
