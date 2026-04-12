import { Bell } from 'lucide-react';
import styles from './TopBar.module.css';

/**
 * TopBar — Sticky top header bar
 *
 * @param {string} title
 * @param {number} notificationCount
 * @param {string} adminName
 * @param {function} onNotificationClick
 * @param {function} onProfileClick
 */
export default function TopBar({
  title,
  notificationCount,
  adminName,
  onNotificationClick,
  onProfileClick,
}) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={onNotificationClick}
          aria-label="الإشعارات"
        >
          <Bell size={22} strokeWidth={1.8} />
          {notificationCount > 0 ? (
            <span className={styles.badge}>{notificationCount}</span>
          ) : null}
        </button>
        <button className={styles.profile} onClick={onProfileClick}>
          <span className={styles.avatar}>{adminName?.charAt(0) || 'م'}</span>
          <span className={styles.adminName}>{adminName}</span>
        </button>
      </div>
    </header>
  );
}
