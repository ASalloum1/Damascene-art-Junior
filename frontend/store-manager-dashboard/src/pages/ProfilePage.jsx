import { useState } from 'react';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import styles from './ProfilePage.module.css';

function PasswordStrengthBar({ password }) {
  function getStrength(pw) {
    if (!pw || pw.length < 6) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const strength = getStrength(password);
  const labels = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
  const colors = ['', '#ff6b6b', '#ffa500', '#4a90e2', '#4caf50'];

  if (!password) return null;

  return (
    <div className={styles.strengthWrapper} aria-live="polite">
      <div className={styles.strengthTrack} aria-hidden="true">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={styles.strengthSegment}
            style={{ backgroundColor: s <= strength ? colors[strength] : '#e0e0e0' }}
          />
        ))}
      </div>
      {strength > 0 ? (
        <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
          {labels[strength]}
        </span>
      ) : null}
    </div>
  );
}

export default function ProfilePage() {
  const { showToast } = useToast();

  const [personal, setPersonal] = useState(() => ({
    firstName: 'محمد',
    lastName: 'العلي',
    email: 'manager@example.com',
    phone: '+963 11 234 5678',
    address: 'دمشق، شارع نور الدين',
  }));

  const [passwords, setPasswords] = useState(() => ({
    current: '',
    newPass: '',
    confirm: '',
  }));
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function savePersonal() {
    showToast({ message: 'تم حفظ المعلومات الشخصية بنجاح', type: 'success' });
  }

  function updatePassword() {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast({ message: 'يرجى ملء جميع حقول كلمة المرور', type: 'warning' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast({ message: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين', type: 'error' });
      return;
    }
    showToast({ message: 'تم تحديث كلمة المرور بنجاح', type: 'success' });
    setPasswords({ current: '', newPass: '', confirm: '' });
  }

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarInitials}>مع</span>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>محمد العلي</h2>
          <p className={styles.profileEmail}>manager@example.com</p>
          <div className={styles.profileMeta}>
            <span className={styles.profileRole}>مدير المتجر</span>
            <span className={styles.profileSince}>منذ يناير ٢٠٢٥</span>
          </div>
        </div>
      </div>

      {/* Section 1: Personal Info */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>المعلومات الشخصية</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <InputField
              label="الاسم الأول"
              value={personal.firstName}
              onChange={(e) => setPersonal((p) => ({ ...p, firstName: e.target.value }))}
            />
            <InputField
              label="الاسم الأخير"
              value={personal.lastName}
              onChange={(e) => setPersonal((p) => ({ ...p, lastName: e.target.value }))}
            />
            <InputField
              label="البريد الإلكتروني"
              type="email"
              value={personal.email}
              onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
            />
            <InputField
              label="رقم الهاتف"
              value={personal.phone}
              onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
            />
            <InputField
              label="العنوان"
              value={personal.address}
              onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div className={styles.uploadAvatar}>
            <div className={styles.avatarSmall}>مع</div>
            <div className={styles.uploadInfo}>
              <span className={styles.uploadLabel}>صورة الملف الشخصي</span>
              <span className={styles.uploadHint}>PNG أو JPG — الحد الأقصى 2MB</span>
              <Button variant="outline" size="sm">تغيير الصورة</Button>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <Button variant="primary" onClick={savePersonal}>
              <Save size={16} />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Password */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>تغيير كلمة المرور</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <InputField
              label="كلمة المرور الحالية"
              type={showCurrent ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              suffix={
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'إخفاء' : 'إظهار'}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <InputField
              label="كلمة المرور الجديدة"
              type={showNew ? 'text' : 'password'}
              value={passwords.newPass}
              onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              suffix={
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'إخفاء' : 'إظهار'}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <InputField
              label="تأكيد كلمة المرور"
              type={showConfirm ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              suffix={
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'إخفاء' : 'إظهار'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
          <PasswordStrengthBar password={passwords.newPass} />
          <div className={styles.cardFooter}>
            <Button variant="primary" onClick={updatePassword}>
              <Lock size={16} />
              تحديث كلمة المرور
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
