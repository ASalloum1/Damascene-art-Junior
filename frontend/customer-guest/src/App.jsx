import { useState, useEffect, useTransition } from 'react';
import { ApiProvider } from './context/ApiContext.jsx';
import { useApi } from './context/ApiContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AddressesPage from './pages/AddressesPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import TrackingPage from './pages/TrackingPage.jsx';
import CustomOrderPage from './pages/CustomOrderPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ReturnPolicyPage from './pages/ReturnPolicyPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import styles from './App.module.css';

const pages = {
  home: HomePage,
  shop: ShopPage,
  about: AboutPage,
  contact: ContactPage,
  product: ProductPage,
  cart: CartPage,
  checkout: CheckoutPage,
  confirmation: ConfirmationPage,
  login: LoginPage,
  register: RegisterPage,
  account: AccountPage,
  addresses: AddressesPage,
  category: CategoryPage,
  search: SearchPage,
  wishlist: WishlistPage,
  tracking: TrackingPage,
  custom: CustomOrderPage,
  faq: FAQPage,
  privacy: PrivacyPage,
  return: ReturnPolicyPage,
};

function AppShell() {
  const { cartSummary, refreshCartSummary } = useApi();
  const [activePage, setActivePage] = useState('home');
  const [isPending, startTransition] = useTransition();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem('token')
  );

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        refreshCartSummary();
      }
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, [refreshCartSummary]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [activePage]);

  const handleNavigate = (pageId) => {
    startTransition(() => {
      setActivePage(pageId);
    });
    setMobileNavOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-changed'));
    setIsLoggedIn(false);
    handleNavigate('home');
  };

  const ActivePage = pages[activePage] ?? NotFoundPage;

  return (
    <div className={styles.layout}>
      {isPending ? (
        <div className="top-progress" aria-hidden="true" />
      ) : null}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={cartSummary.count || cartSummary.items_count || 0}
        isLoggedIn={isLoggedIn}
        mobileMenuOpen={mobileNavOpen}
        onMobileMenuOpen={() => setMobileNavOpen(true)}
        onMobileMenuClose={() => setMobileNavOpen(false)}
      />
      <main
        id="main-content"
        className={styles.content}
        tabIndex={-1}
        aria-label="محتوى الصفحة"
      >
        <ActivePage onNavigate={handleNavigate} onLogout={handleLogout} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppShell />
    </ApiProvider>
  );
}
