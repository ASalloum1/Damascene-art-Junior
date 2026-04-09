import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
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
  settings: SettingsPage,
  messages: MessagesPage,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActivePage = pages[activePage];

  return (
    <div className={styles.layout}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.body}>
        <Header
          activePage={activePage}
          onNavigate={setActivePage}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main id="main-content" className={styles.content} aria-label="محتوى الصفحة">
          <div key={activePage} className={styles.pageWrapper}>
            <ActivePage />
          </div>
        </main>
      </div>
    </div>
  );
}
