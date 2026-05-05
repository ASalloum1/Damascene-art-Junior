import { useState } from 'react';
import { Gem } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import {
  extractAuthData,
  loginWithCredentials,
  persistAuthSession,
  redirectToUserLanding,
} from '../utils/auth.js';
import styles from './LoginPage.module.css';

export function LoginPage({ onNavigate }) {
  const { baseUrl, endpoints } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const data = await loginWithCredentials({
        baseUrl,
        email,
        password,
        loginEndpoint: endpoints.login,
      });
      const authData = extractAuthData(data);

      if (!authData.token || !authData.user) {
        throw new Error('استجابة تسجيل الدخول غير مكتملة');
      }

      persistAuthSession(authData);
      redirectToUserLanding(authData.user);
    } catch (err) {
      setError(err.message || 'حدث خطأ في الاتصال بالخادم');
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
