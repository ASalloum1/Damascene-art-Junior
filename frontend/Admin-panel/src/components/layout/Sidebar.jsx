import { NAV_ITEMS } from '../../constants/navigation.js';
import styles from './Sidebar.module.css';
import { ChevronRight, ChevronLeft, Box } from 'lucide-react';
/**
 * Sidebar — Collapsible RTL navigation sidebar
 *
 * @param {boolean} collapsed
 * @param {function} onToggle
 * @param {string} activePage
 * @param {function} onNavigate
 * @param {object} badgeCounts
 */
export default function Sidebar({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  badgeCounts,
}) {
  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <Box size={27} strokeWidth={2} />
        </div>
        {!collapsed ? (
          <div className={styles.logoText}>
            <span className={styles.logoName}>الفن الدمشقي</span>
            <span className={styles.logoSub}>لوحة المشرف العام</span>
          </div>
        ) : null}
      </div>

      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const badgeCount = item.badge ? badgeCounts?.[item.badge] : undefined;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={22} strokeWidth={1.8} />
              {!collapsed ? <span className={styles.navLabel}>{item.label}</span> : null}
              {!collapsed && badgeCount && badgeCount > 0 ? (
                <span className={styles.badge}>{badgeCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <button className={styles.toggle} onClick={onToggle}>
        {collapsed
          ? <ChevronLeft size={22} strokeWidth={1.8} />
          : <ChevronRight size={22} strokeWidth={1.8} />
        }
      </button>
    </nav>
  );
}
