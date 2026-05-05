import { useState, useEffect, useTransition, useCallback } from 'react';
import { ApiProvider } from './context/ApiContext.jsx';
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
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import MyReviewsPage from './pages/MyReviewsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import TrackingPage from './pages/TrackingPage.jsx';
import CustomOrderPage from './pages/CustomOrderPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ReturnPolicyPage from './pages/ReturnPolicyPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import VisualSearchPage from './pages/VisualSearchPage.jsx';
import { ChatbotFab } from './components/ChatbotFab.jsx';
import { ChatbotDrawer } from './components/chatbot/ChatbotDrawer.jsx';
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
  visual: VisualSearchPage,
  wishlist: WishlistPage,
  'my-orders': MyOrdersPage,
  'my-reviews': MyReviewsPage,
  tracking: TrackingPage,
  custom: CustomOrderPage,
  faq: FAQPage,
  privacy: PrivacyPage,
  return: ReturnPolicyPage,
};

const AUTH_REQUIRED_PAGES = new Set([
  'cart',
  'wishlist',
  'checkout',
  'account',
  'addresses',
  'my-orders',
  'my-reviews',
  'custom',
]);

const readToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isPending, startTransition] = useTransition();
  const [cartCount] = useState(2);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const handleToggleChatbot = useCallback(() => setChatbotOpen((v) => !v), []);
  const handleCloseChatbot = useCallback(() => setChatbotOpen(false), []);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!readToken());
  const [loginRedirectInfo, setLoginRedirectInfo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [activePage]);

  const handleNavigate = (pageId) => {
    if (AUTH_REQUIRED_PAGES.has(pageId) && !readToken()) {
      setLoginRedirectInfo({ intendedPage: pageId });
      startTransition(() => setActivePage('login'));
      setMobileNavOpen(false);
      return;
    }
    if (pageId !== 'login' && loginRedirectInfo) {
      setLoginRedirectInfo(null);
    }
    startTransition(() => setActivePage(pageId));
    setMobileNavOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const dest = loginRedirectInfo?.intendedPage ?? 'account';
    setLoginRedirectInfo(null);
    startTransition(() => setActivePage(dest));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    handleNavigate('home');
  };

  const ActivePage = pages[activePage] ?? NotFoundPage;

  return (
    <ApiProvider>
      <div className={styles.layout}>
        {isPending ? (
          <div className="top-progress" aria-hidden="true" />
        ) : null}
        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          cartCount={cartCount}
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
          {activePage === 'login' ? (
            <LoginPage
              onNavigate={handleNavigate}
              onLoginSuccess={handleLoginSuccess}
              requiredFor={loginRedirectInfo?.intendedPage ?? null}
            />
          ) : (
            <ActivePage onNavigate={handleNavigate} onLogout={handleLogout} />
          )}
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
      <ChatbotFab
        open={chatbotOpen}
        onToggle={handleToggleChatbot}
        hidden={
          mobileNavOpen ||
          activePage === 'checkout' ||
          activePage === 'confirmation'
        }
      />
      <ChatbotDrawer
        open={chatbotOpen}
        onClose={handleCloseChatbot}
        onNavigate={handleNavigate}
      />
    </ApiProvider>
  );
}
