import { useRef, useState } from 'react';
import {
  User,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import styles from './AdminProfile.module.css';

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
  const colors = ['', 'var(--color-red)', 'var(--color-orange)', 'var(--color-blue)', 'var(--color-green)'];

  if (!password) return null;

  return (
    <div className={styles.strengthWrapper} aria-live="polite">
      <div className={styles.strengthTrack} aria-hidden="true">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={styles.strengthSegment}
            style={{ backgroundColor: s <= strength ? colors[strength] : 'var(--color-cream-dark)' }}
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

function ToggleSwitch({ checked, onChange, 'aria-label': ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[styles.toggle, checked ? styles.toggleOn : ''].filter(Boolean).join(' ')}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

export default function AdminProfilePage() {
  const { showToast } = useToast();

  // Personal Info
  const [personal, setPersonal] = useState(() => ({
    firstName: 'أحمد',
    lastName: 'المحمد',
    email: 'ahmed.almohammad@example.com',
    phone: '+963 11 123 4567',
    address: 'دمشق، شارع بغداد، بناء 42',
  }));

  // Password
  const [passwords, setPasswords] = useState(() => ({
    current: '',
    newPass: '',
    confirm: '',
  }));
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Avatar image
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      showToast({ message: 'يرجى اختيار صورة بصيغة PNG أو JPG', type: 'error' });
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast({ message: 'حجم الصورة يجب ألا يتجاوز 2MB', type: 'error' });
      e.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    showToast({ message: 'تم تحديث الصورة الشخصية', type: 'success' });
    e.target.value = '';
  }

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
    <div className={`${styles.page} page-enter`}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="الصورة الشخصية" className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarInitials}>أم</span>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>أحمد المحمد</h2>
          <p className={styles.profileEmail}>ahmed.almohammad@example.com</p>
          <div className={styles.profileMeta}>
            <Badge text="مشرف عام" variant="gold" />
            <span className={styles.profileSince}>منذ يناير ٢٠٢٥</span>
          </div>
        </div>
      </div>

      {/* Section 1: Personal Info */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon}>
            <User size={18} strokeWidth={1.8} />
          </div>
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
            <div className={styles.avatarSmall}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="الصورة الشخصية" className={styles.avatarImage} />
              ) : (
                'أم'
              )}
            </div>
            <div className={styles.uploadInfo}>
              <span className={styles.uploadLabel}>صورة الملف الشخصي</span>
              <span className={styles.uploadHint}>PNG أو JPG — الحد الأقصى 2MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <Button variant="outline" size="sm" onClick={openFilePicker}>
                تغيير الصورة
              </Button>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <Button variant="primary" icon={Save} onClick={savePersonal}>
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Password */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={[styles.cardHeaderIcon, styles.cardHeaderIconBlue].join(' ')}>
            <Lock size={18} strokeWidth={1.8} />
          </div>
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
            <Button variant="primary" icon={Lock} onClick={updatePassword}>
              تحديث كلمة المرور
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
