import styles from './Header.module.css';
import { Icon } from './SvgIcons';
import { menuItems } from '../data/menuData';

export function Header({
  activePage,
  onNavigate,
  onMobileMenuOpen,
  notificationCount = 0,
  userName = 'مدير المتجر',
}) {
  const currentItem = menuItems.find((m) => m.id === activePage);

  return (
    <header className={styles.header} role="banner">
      {/* Mobile menu toggle */}
      <button
        className={styles.mobileMenuBtn}
        onClick={onMobileMenuOpen}
        aria-label="فتح القائمة"
      >
        <Icon name="menu" size={20} />
      </button>

      {/* Page title */}
      <h1 className={styles.pageTitle} role="status" aria-live="polite">
        {currentItem?.icon ? (
          <Icon name={currentItem.icon} size={18} className={styles.pageTitleIcon} />
        ) : null}
        <span>{currentItem?.label}</span>
      </h1>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Notifications bell */}
        <button
          className={styles.iconBtn}
          onClick={() => onNavigate('notifications')}
          aria-label={`الإشعارات — ${notificationCount} إشعارات جديدة`}
        >
          <Icon name="bell" size={18} />
          {notificationCount > 0 ? (
            <span className={styles.badge} aria-hidden="true">{notificationCount}</span>
          ) : null}
        </button>

        {/* User avatar */}
        <button
          className={styles.userChip}
          onClick={() => onNavigate('profile')}
          aria-label="الملف الشخصي"
        >
          <div className={styles.avatar} aria-hidden="true">م</div>
          <span className={styles.userName}>{userName}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
