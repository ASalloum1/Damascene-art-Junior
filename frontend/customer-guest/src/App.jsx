import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ShopPage } from './pages/ShopPage.jsx';
import { CategoryPage } from './pages/CategoryPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { ConfirmationPage } from './pages/ConfirmationPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { TrackingPage } from './pages/TrackingPage.jsx';
import { WishlistPage } from './pages/WishlistPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { FAQPage } from './pages/FAQPage.jsx';
import { CustomOrderPage } from './pages/CustomOrderPage.jsx';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import styles from './App.module.css';

const pages = {
  home: HomePage,
  shop: ShopPage,
  category: CategoryPage,
  product: ProductPage,
  cart: CartPage,
  checkout: CheckoutPage,
  confirmation: ConfirmationPage,
  login: LoginPage,
  register: RegisterPage,
  account: AccountPage,
  tracking: TrackingPage,
  wishlist: WishlistPage,
  about: AboutPage,
  contact: ContactPage,
  faq: FAQPage,
  custom: CustomOrderPage,
  return: ReturnPolicyPage,
  privacy: PrivacyPage,
  search: SearchPage,
  notfound: NotFoundPage,
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [cartCount] = useState(2);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus();
  }, [activePage]);

  const ActivePage = pages[activePage] ?? NotFoundPage;

  return (
    <div className={styles.layout}>
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        cartCount={cartCount}
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
        <ActivePage onNavigate={setActivePage} />
      </main>
      <Footer onNavigate={setActivePage} />
    </div>
  );
}
