import styles from './Header.module.css';
import { Menu, Bell } from 'lucide-react';
import { menuItems } from './Sidebar';

export function Header({ activePage, onNavigate, onMobileMenuOpen }) {
  const currentItem = menuItems.find((m) => m.id === activePage);
  const PageIcon = currentItem?.icon;

  return (
    <header className={styles.header} role="banner">
      {/* Mobile menu toggle */}
      <button
        className={styles.mobileMenuBtn}
        onClick={onMobileMenuOpen}
        aria-label="فتح القائمة"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className={styles.pageTitle} role="status" aria-live="polite">
        {PageIcon ? <PageIcon size={18} className={styles.pageTitleIcon} /> : null}
        <span>{currentItem?.label}</span>
      </h1>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Notifications bell */}
        <button
          className={styles.iconBtn}
          onClick={() => onNavigate('notifications')}
          aria-label="الإشعارات — ٣ إشعارات جديدة"
        >
          <Bell size={18} />
          <span className={styles.badge} aria-hidden="true">٣</span>
        </button>

        {/* User avatar */}
        <div className={styles.userChip}>
          <div className={styles.avatar} aria-hidden="true">م</div>
          <span className={styles.userName}>مدير المتجر</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
