import styles from './Sidebar.module.css';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, BarChart3, Star, Bell, Settings, MessageSquare, Box, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
  { id: 'dashboard',     icon: LayoutDashboard,  label: 'لوحة التحكم' },
  { id: 'products',      icon: Package,          label: 'إدارة المنتجات' },
  { id: 'inventory',     icon: Warehouse,        label: 'إدارة المخزون' },
  { id: 'orders',        icon: ShoppingCart,      label: 'إدارة الطلبات' },
  { id: 'reports',       icon: BarChart3,         label: 'التقارير والإحصائيات' },
  { id: 'reviews',       icon: Star,             label: 'التقييمات والمراجعات' },
  { id: 'notifications', icon: Bell,             label: 'الإشعارات' },
  { id: 'settings',      icon: Settings,         label: 'الإعدادات' },
  { id: 'messages',      icon: MessageSquare,    label: 'الرسائل' },
];

export { menuItems };

export function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        aria-label="القائمة الجانبية"
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <Box size={22} style={{ color: 'var(--color-ivory-mid)' }} />
          </div>
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoName}>الفن الدمشقي</span>
              <span className={styles.logoSub}>لوحة مدير المتجر</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

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
                {!collapsed && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
