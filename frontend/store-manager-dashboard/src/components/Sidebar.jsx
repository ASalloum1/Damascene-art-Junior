import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Star,
  Bell,
  Settings,
  MessageSquare,
  Box,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard',     icon: LayoutDashboard,  label: 'لوحة التحكم' },
  { id: 'products',      icon: Package,          label: 'إدارة المنتجات' },
  { id: 'inventory',     icon: Warehouse,        label: 'إدارة المخزون' },
  { id: 'orders',        icon: ShoppingCart,     label: 'إدارة الطلبات' },
  { id: 'reports',       icon: BarChart3,        label: 'التقارير والإحصائيات' },
  { id: 'reviews',       icon: Star,             label: 'التقييمات والمراجعات' },
  { id: 'notifications', icon: Bell,             label: 'الإشعارات' },
  { id: 'settings',      icon: Settings,         label: 'الإعدادات' },
  { id: 'messages',      icon: MessageSquare,    label: 'الرسائل' },
];

export { menuItems };

// Hoisted static element — avoids re-creation on every render
const collapseIconLeft  = <ChevronLeft  size={16} />;
const collapseIconRight = <ChevronRight size={16} />;

export function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <div
          className={styles.backdrop}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        aria-label="القائمة الجانبية"
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <Box size={20} />
          </div>
          {!collapsed ? (
            <div className={styles.logoText}>
              <span className={styles.logoName}>الفن الدمشقي</span>
              <span className={styles.logoSub}>لوحة مدير المتجر</span>
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="القائمة الرئيسية">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (mobileOpen) onMobileClose();
                }}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={styles.navIcon} />
                {!collapsed ? (
                  <span className={styles.navLabel}>{item.label}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? collapseIconLeft : collapseIconRight}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
