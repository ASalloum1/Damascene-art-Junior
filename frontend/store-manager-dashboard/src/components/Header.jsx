import styles from './Header.module.css';
import { Icon } from './SvgIcons';
import { menuItems } from '../data/menuData';
import { useAuth } from '../context/AuthContext.jsx';

export function Header({ activePage, onNavigate, onMobileMenuOpen }) {
  const currentItem = menuItems.find((m) => m.id === activePage);
  const { user } = useAuth();
  const displayName = user && user.fullName ? user.fullName : 'مدير المتجر';
  const avatarLetter = displayName ? displayName.trim().charAt(0) : 'م';

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
          aria-label="الإشعارات — ٣ إشعارات جديدة"
        >
          <Icon name="bell" size={18} />
          <span className={styles.badge} aria-hidden="true">٣</span>
        </button>

        {/* User avatar */}
        <button
          className={styles.userChip}
          onClick={() => onNavigate('profile')}
          aria-label="الملف الشخصي"
        >
          <div className={styles.avatar} aria-hidden="true">{avatarLetter}</div>
          <span className={styles.userName}>{displayName}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
