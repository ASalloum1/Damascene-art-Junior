import { useState } from 'react';
import {
  User,
  Save,
  Lock,
  Bell,
  Monitor,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate, relativeTime } from '../../utils/formatters.js';
import styles from './AdminProfile.module.css';

const MOCK_DEVICES = [
  {
    id: 'd1',
    device: 'Chrome / Windows 11',
    location: 'دمشق، سوريا',
    ip: '192.168.1.10',
    lastActive: '2026-04-05T07:50:00Z',
    current: true,
  },
  {
    id: 'd2',
    device: 'Safari / iPhone 15',
    location: 'دمشق، سوريا',
    ip: '192.168.1.15',
    lastActive: '2026-04-04T20:10:00Z',
    current: false,
  },
  {
    id: 'd3',
    device: 'Firefox / Ubuntu 22',
    location: 'بيروت، لبنان',
    ip: '10.0.0.5',
    lastActive: '2026-04-03T14:30:00Z',
    current: false,
  },
];

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
    <div className={styles.strengthWrapper}>
      <div className={styles.strengthTrack}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={styles.strengthSegment}
            style={{ backgroundColor: s <= strength ? colors[strength] : 'var(--color-cream-dark)' }}
          />
        ))}
      </div>
      {strength > 0 && (
        <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
          {labels[strength]}
        </span>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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
  const [personal, setPersonal] = useState({
    firstName: 'أحمد',
    lastName: 'المحمد',
    email: 'ahmed.almohammad@example.com',
    phone: '+963 11 123 4567',
  });

  // Password
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification Prefs
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    site: true,
    push: false,
    dailySummary: true,
  });

  // Devices
  const [devices, setDevices] = useState(MOCK_DEVICES);

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

  function saveNotifPrefs() {
    showToast({ message: 'تم حفظ تفضيلات الإشعارات', type: 'success' });
  }

  function terminateSession(deviceId) {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    showToast({ message: 'تم إنهاء الجلسة بنجاح', type: 'success' });
  }

  function terminateAllOthers() {
    setDevices((prev) => prev.filter((d) => d.current));
    showToast({ message: 'تم إنهاء جميع الجلسات الأخرى', type: 'success' });
  }

  const deviceHeaders = [
    {
      key: 'device',
      label: 'الجهاز',
      render: (val, row) => (
        <div className={styles.deviceCell}>
          {val.includes('iPhone') || val.includes('Android') ? (
            <Smartphone size={16} strokeWidth={1.8} className={styles.deviceIcon} />
          ) : (
            <Laptop size={16} strokeWidth={1.8} className={styles.deviceIcon} />
          )}
          <span>{val}</span>
        </div>
      ),
    },
    { key: 'location', label: 'الموقع' },
    { key: 'ip', label: 'عنوان IP' },
    {
      key: 'lastActive',
      label: 'آخر نشاط',
      render: (val) => relativeTime(val),
    },
    {
      key: 'current',
      label: 'الحالة',
      render: (val) => (
        <Badge
          text={val ? 'الجهاز الحالي' : 'نشط'}
          variant={val ? 'success' : 'info'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'الإجراء',
      render: (_, row) =>
        !row.current ? (
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={() => terminateSession(row.id)}
          >
            إنهاء الجلسة
          </Button>
        ) : (
          <span className={styles.currentDeviceText}>—</span>
        ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarInitials}>أم</span>
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
          </div>
          <div className={styles.uploadAvatar}>
            <div className={styles.avatarSmall}>أم</div>
            <div className={styles.uploadInfo}>
              <span className={styles.uploadLabel}>صورة الملف الشخصي</span>
              <span className={styles.uploadHint}>PNG أو JPG — الحد الأقصى 2MB</span>
              <Button variant="outline" size="sm">تغيير الصورة</Button>
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
            <div className={styles.passwordField}>
              <InputField
                label="كلمة المرور الحالية"
                type={showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'إخفاء' : 'إظهار'}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={styles.passwordField}>
              <InputField
                label="كلمة المرور الجديدة"
                type={showNew ? 'text' : 'password'}
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'إخفاء' : 'إظهار'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={styles.passwordField}>
              <InputField
                label="تأكيد كلمة المرور"
                type={showConfirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'إخفاء' : 'إظهار'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <PasswordStrengthBar password={passwords.newPass} />
          <div className={styles.cardFooter}>
            <Button variant="primary" icon={Lock} onClick={updatePassword}>
              تحديث كلمة المرور
            </Button>
          </div>
        </div>
      </div>

      {/* Section 3: Notification Prefs */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={[styles.cardHeaderIcon, styles.cardHeaderIconGold].join(' ')}>
            <Bell size={18} strokeWidth={1.8} />
          </div>
          <h3 className={styles.cardTitle}>تفضيلات الإشعارات</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.prefList}>
            {[
              { key: 'email', label: 'إشعارات البريد الإلكتروني' },
              { key: 'site', label: 'إشعارات الموقع' },
              { key: 'push', label: 'إشعارات الجوال (Push)' },
              { key: 'dailySummary', label: 'ملخص يومي' },
            ].map((pref) => (
              <div key={pref.key} className={styles.prefRow}>
                <span className={styles.prefLabel}>{pref.label}</span>
                <ToggleSwitch
                  checked={notifPrefs[pref.key]}
                  onChange={(v) =>
                    setNotifPrefs((p) => ({ ...p, [pref.key]: v }))
                  }
                />
              </div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <Button variant="primary" icon={Save} onClick={saveNotifPrefs}>
              حفظ التفضيلات
            </Button>
          </div>
        </div>
      </div>

      {/* Section 4: Active Devices */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={[styles.cardHeaderIcon, styles.cardHeaderIconPurple].join(' ')}>
            <Monitor size={18} strokeWidth={1.8} />
          </div>
          <h3 className={styles.cardTitle}>الأجهزة النشطة</h3>
        </div>
        <div className={styles.cardBody}>
          <DataTable headers={deviceHeaders} rows={devices} />
          {devices.filter((d) => !d.current).length > 0 && (
            <div className={styles.cardFooter}>
              <Button variant="danger" icon={LogOut} onClick={terminateAllOthers}>
                إنهاء جميع الجلسات الأخرى
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
