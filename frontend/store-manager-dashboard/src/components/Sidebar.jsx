import styles from './Sidebar.module.css';
import { Icon } from './SvgIcons';
import { menuItems } from '../data/menuData';

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
            <Icon name="box" size={25} />
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
                <Icon name={item.icon} size={25} className={styles.navIcon} />
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
          {collapsed ? (
            <Icon name="chevronLeft" size={16} />
          ) : (
            <Icon name="chevronRight" size={16} />
          )}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
