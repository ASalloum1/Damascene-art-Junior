import { Gem } from 'lucide-react';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './RegisterPage.module.css';

export function RegisterPage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Gem size={48} className={styles.gemIcon} />
        <h2 className={styles.heading}>إنشاء حساب جديد</h2>

        <div className={styles.twoCol}>
          <InputField label="الاسم الأول" placeholder="أحمد" />
          <InputField label="اسم العائلة" placeholder="الشامي" />
        </div>

        <InputField
          label="البريد الإلكتروني"
          type="email"
          placeholder="email@example.com"
        />
        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="٨ أحرف على الأقل"
        />
        <InputField
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
        />

        <Button variant="primary" full>
          إنشاء حساب
        </Button>

        <p className={styles.loginLink}>
          لديك حساب؟{' '}
          <button
            type="button"
            className={styles.loginBtn}
            onClick={() => onNavigate?.('login')}
          >
            سجّل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
