import { useState } from 'react';
import { Gem } from 'lucide-react';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './RegisterPage.module.css';

const API_BASE_URL = 'https://d8b7-169-150-196-135.ngrok-free.app';

export function RegisterPage({ onNavigate }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Reset error state
    setError('');

    // Validate inputs
    if (!firstName || !lastName || !email || !phone || !address || !password || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          phone,
          email,
          password,
          password_confirmation: confirmPassword,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'فشل إنشاء الحساب');
        return;
      }

      // Registration successful - redirect to login
      onNavigate?.('login');
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Gem size={48} className={styles.gemIcon} />
        <h2 className={styles.heading}>إنشاء حساب جديد</h2>

        {error ? <div className={styles.errorMessage}>{error}</div> : null}

        <div className={styles.twoCol}>
          <InputField 
            label="الاسم الأول" 
            placeholder="أحمد"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputField 
            label="اسم العائلة" 
            placeholder="الشامي"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <InputField
          label="البريد الإلكتروني"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="رقم الهاتف"
          type="tel"
          placeholder="0987654321"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <InputField
          label="العنوان"
          type="text"
          placeholder="دمشق"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="٨ أحرف على الأقل"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button 
          variant="primary" 
          full 
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
        </Button>

        <p className={styles.loginLink}>
          لديك حساب؟{' '}
          <button
            type="button"
            className={styles.loginBtn}
            onClick={() => onNavigate?.('login')}
            disabled={isLoading}
          >
            سجّل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
