import { Gem } from 'lucide-react';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './LoginPage.module.css';

export function LoginPage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Gem size={48} className={styles.gemIcon} />
        <h2 className={styles.heading}>تسجيل الدخول</h2>

        <InputField
          label="البريد الإلكتروني"
          type="email"
          placeholder="email@example.com"
        />
        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
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

        <Button variant="primary" full onClick={() => onNavigate?.('account')}>
          تسجيل الدخول
        </Button>

        <p className={styles.divider}>— أو —</p>

        <div className={styles.socialRow}>
          <button type="button" className={styles.socialBtn}>Google</button>
          <button type="button" className={styles.socialBtn}>Facebook</button>
        </div>

        <p className={styles.registerLink}>
          ليس لديك حساب؟{' '}
          <button
            type="button"
            className={styles.registerBtn}
            onClick={() => onNavigate?.('register')}
          >
            سجّل الآن
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
