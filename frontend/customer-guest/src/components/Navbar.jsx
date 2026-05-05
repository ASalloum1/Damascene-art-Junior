import { Gem, Search, Heart, ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from './Button.jsx';
import { VisualSearchButton } from './VisualSearchButton.jsx';
import { navLinks } from '../data/index.js';
import styles from './Navbar.module.css';

export function Navbar({
  activePage,
  onNavigate,
  cartCount = 0,
  isLoggedIn = false,
  mobileMenuOpen = false,
  onMobileMenuOpen,
  onMobileMenuClose,
}) {
  return (
    <>
      <header role="banner" className={styles.header}>
        <div className={styles.inner}>
          {/* Logo */}
          <button
            type="button"
            className={styles.logo}
            onClick={() => onNavigate?.('home')}
            aria-label="الرئيسية — الفن الدمشقي"
          >
            <Gem size={24} className={styles.logoGem} />
            <div className={styles.logoText}>
              <span className={styles.logoAr}>الفن الدمشقي</span>
              <span className={styles.logoEn}>Damascene Art</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className={`${styles.navBtn} ${activePage === link.id ? styles.navBtnActive : ''}`}
                onClick={() => onNavigate?.(link.id)}
                aria-current={activePage === link.id ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Icon tray */}
          <div className={styles.iconTray}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onNavigate?.('search')}
              aria-label="البحث"
            >
              <Search size={18} />
            </button>

            <VisualSearchButton onNavigate={onNavigate} />

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onNavigate?.('wishlist')}
              aria-label="المفضلة"
            >
              <Heart size={18} />
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onNavigate?.('cart')}
              aria-label={`السلة — ${cartCount} منتج`}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className={styles.cartBadge}>{cartCount}</span>
              ) : null}
            </button>

            {isLoggedIn ? (
              <button
                type="button"
                className={styles.accountBtn}
                onClick={() => onNavigate?.('account')}
                aria-label="حسابي"
              >
                <User size={18} />
              </button>
            ) : (
              <div className={styles.loginBtn}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<User size={14} />}
                  onClick={() => onNavigate?.('login')}
                >
                  الدخول
                </Button>
              </div>
            )}

            {/* Hamburger */}
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.hamburger}`}
              onClick={onMobileMenuOpen}
              aria-label="فتح القائمة"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {mobileMenuOpen ? (
        <div
          className={styles.backdrop}
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      ) : null}

      {/* Drawer */}
      <div
        className={`${styles.drawer} ${mobileMenuOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
      >
        <button
          type="button"
          className={styles.drawerClose}
          onClick={onMobileMenuClose}
          aria-label="إغلاق القائمة"
        >
          <X size={20} />
        </button>

        <nav className={styles.drawerNav}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`${styles.drawerNavBtn} ${activePage === link.id ? styles.drawerNavBtnActive : ''}`}
              onClick={() => {
                onNavigate?.(link.id);
                onMobileMenuClose?.();
              }}
              aria-current={activePage === link.id ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className={styles.drawerLogin}>
          <Button
            variant="primary"
            full
            icon={<User size={14} />}
            onClick={() => {
              onNavigate?.(isLoggedIn ? 'account' : 'login');
              onMobileMenuClose?.();
            }}
          >
            {isLoggedIn ? 'حسابي' : 'الدخول'}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
