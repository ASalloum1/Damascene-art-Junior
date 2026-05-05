import { useState } from 'react';
import { Gem } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './LoginPage.module.css';

const PAGE_LABEL = {
  cart: 'لعرض سلة التسوق',
  wishlist: 'لعرض قائمة المفضلة',
  checkout: 'لإتمام عملية الشراء',
  account: 'للوصول إلى حسابك',
  addresses: 'لإدارة عناوينك',
  'my-orders': 'لعرض طلباتك',
  'my-reviews': 'لعرض تقييماتك',
  custom: 'لطلب قطعة مخصّصة',
};

export function LoginPage({ onNavigate, onLoginSuccess, requiredFor }) {
  const { baseUrl } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const authHint = requiredFor
    ? `يُرجى تسجيل الدخول ${PAGE_LABEL[requiredFor] ?? 'للمتابعة'}`
    : null;

  const handleLogin = async () => {
    // Reset error state
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'فشل تسجيل الدخول');
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Navigate based on user type
      const userType = data.data.user.type;
      if (userType === 'admin') {
        // Redirect to admin panel
        window.location.href = 'http://localhost:5174/';
      } else if (userType === 'store_manager') {
        // Redirect to store manager dashboard
        window.location.href = 'http://localhost:5175/';
      } else {
        // Default to customer account page
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess();
        } else {
          window.location.href = 'http://localhost:5173/';
        }
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Gem size={48} className={styles.gemIcon} />
        <h2 className={styles.heading}>تسجيل الدخول</h2>

        {authHint ? (
          <div className={styles.authHint} role="status" aria-live="polite">
            {authHint}
          </div>
        ) : null}

        {error ? <div className={styles.errorMessage}>{error}</div> : null}

        <InputField
          label="البريد الإلكتروني"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.rememberRow}>
          <label className={styles.rememberLabel}>
            <input type="checkbox" />
            تذكرني
          </label>
          <button type="button" className={styles.forgotLink}>
            نسيت كلمة المرور؟
          </button>
        </div>

        <Button 
          variant="primary" 
          full 
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>

        <p className={styles.divider}>— أو —</p>

        <div className={styles.socialRow}>
          <button type="button" className={styles.socialBtn} disabled={isLoading}>
            Google
          </button>
          <button type="button" className={styles.socialBtn} disabled={isLoading}>
            Facebook
          </button>
        </div>

        <p className={styles.registerLink}>
          ليس لديك حساب؟{' '}
          <button
            type="button"
            className={styles.registerBtn}
            onClick={() => onNavigate?.('register')}
            disabled={isLoading}
          >
            سجّل الآن
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
