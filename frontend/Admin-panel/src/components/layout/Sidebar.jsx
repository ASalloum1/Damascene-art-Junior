import { ChevronRight, ChevronLeft } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation.js';
import styles from './Sidebar.module.css';

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
      <div className={styles.logo}>
        {!collapsed && (
          <>
            <span className={styles.logoTitle}>الفن الدمشقي</span>
            <span className={styles.logoSub}>لوحة المشرف العام</span>
          </>
        )}
      </div>

      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const badgeCount = item.badge && badgeCounts?.[item.badge];
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} strokeWidth={1.8} />
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {!collapsed && badgeCount > 0 && (
                <span className={styles.badge}>{badgeCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <button className={styles.toggle} onClick={onToggle}>
        {collapsed
          ? <ChevronLeft size={18} strokeWidth={1.8} />
          : <ChevronRight size={18} strokeWidth={1.8} />
        }
      </button>
    </nav>
  );
}
