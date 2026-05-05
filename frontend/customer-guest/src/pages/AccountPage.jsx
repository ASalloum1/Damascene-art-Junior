import { useEffect, useMemo, useState } from 'react';
import { Package, Heart, Star, MapPin, LogOut, Save } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Badge } from '../components/Badge.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import { getAuthHeaders, readJsonSafely } from '../utils/customerApi.js';
import styles from './AccountPage.module.css';

export function AccountPage({ onNavigate, onLogout }) {
  const { baseUrl, bearerToken, endpoints, currentUser, setSelectedOrderId } = useApi();
  const [accountSummary, setAccountSummary] = useState(null);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAccount() {
      setIsLoading(true);
      setError('');

      try {
        const [accountResponse, profileResponse] = await Promise.all([
          fetch(`${baseUrl}${endpoints.account}`, {
            method: 'GET',
            headers: getAuthHeaders(bearerToken),
          }),
          fetch(`${baseUrl}${endpoints.profile}`, {
            method: 'GET',
            headers: getAuthHeaders(bearerToken),
          }),
        ]);

        const accountData = await readJsonSafely(accountResponse);
        const profileData = await readJsonSafely(profileResponse);

        if (!accountResponse.ok) {
          throw new Error(accountData.message || 'فشل تحميل بيانات الحساب');
        }

        if (!profileResponse.ok) {
          throw new Error(profileData.message || 'فشل تحميل الملف الشخصي');
        }

        setAccountSummary(accountData.data);

        const profile = profileData?.data?.profile || accountData?.data?.profile || {};
        setProfileForm({
          first_name: profile.first_name || currentUser?.first_name || '',
          last_name: profile.last_name || currentUser?.last_name || '',
          email: profile.email || currentUser?.email || '',
          phone: profile.phone || currentUser?.phone || '',
          address: profile.address || currentUser?.address || '',
        });
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || 'تعذر تحميل بيانات الحساب');
      } finally {
        setIsLoading(false);
      }
    }

    if (bearerToken) {
      loadAccount();
    } else {
      setIsLoading(false);
      setError('يرجى تسجيل الدخول أولاً');
    }
  }, [baseUrl, bearerToken, currentUser, endpoints.account, endpoints.profile]);

  const stats = useMemo(() => {
    const summaryStats = accountSummary?.stats || {};

    return [
      { icon: Package, label: 'طلباتي', value: `${summaryStats.orders_count || 0} طلب`, page: 'tracking' },
      { icon: Heart, label: 'المفضلة', value: `${summaryStats.wish_list_count || 0} منتجات`, page: 'wishlist' },
      { icon: Star, label: 'تقييماتي', value: `${summaryStats.reviews_count || 0} تقييمات` },
      { icon: MapPin, label: 'عناويني', value: `${summaryStats.addresses_count || 0} عناوين`, page: 'addresses' },
    ];
  }, [accountSummary]);

  const orders = accountSummary?.latest_orders || [];

  const handleProfileSave = async () => {
    setError('');
    setMessage('');
    setIsSavingProfile(true);

    try {
      const response = await fetch(`${baseUrl}${endpoints.profile}`, {
        method: 'PUT',
        headers: getAuthHeaders(bearerToken),
        body: JSON.stringify(profileForm),
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || 'فشل تحديث الملف الشخصي');
      }

      setMessage('تم حفظ المعلومات الشخصية بنجاح');
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...(currentUser || {}),
          ...profileForm,
        })
      );
      window.dispatchEvent(new Event('auth-changed'));
    } catch (saveError) {
      setError(saveError.message || 'فشل تحديث الملف الشخصي');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    setError('');
    setMessage('');

    if (
      !passwordForm.current_password ||
      !passwordForm.password ||
      !passwordForm.password_confirmation
    ) {
      setError('يرجى ملء جميع حقول كلمة المرور');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch(`${baseUrl}${endpoints.profilePassword}`, {
        method: 'PUT',
        headers: getAuthHeaders(bearerToken),
        body: JSON.stringify(passwordForm),
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || 'فشل تحديث كلمة المرور');
      }

      setMessage('تم تحديث كلمة المرور بنجاح');
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (saveError) {
      setError(saveError.message || 'فشل تحديث كلمة المرور');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="حسابي"
        subtitle={`مرحباً، ${accountSummary?.profile?.full_name || currentUser?.first_name || 'ضيفنا الكريم'}`}
      />

      {error ? <div className={styles.card} style={{ color: 'var(--color-red)' }}>{error}</div> : null}
      {message ? <div className={styles.card} style={{ color: 'var(--color-green)' }}>{message}</div> : null}

      {isLoading ? (
        <div className={styles.card}>جاري تحميل بيانات الحساب...</div>
      ) : (
        <>

          {/* ── Stat grid ── */}
          <div className={styles.statGrid}>
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              const clickable = Boolean(stat.page);
              return (
                <div
                  key={stat.label}
                  className={styles.statCard}
                  onClick={clickable ? () => onNavigate?.(stat.page) : undefined}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate?.(stat.page);
                          }
                        }
                      : undefined
                  }
                >
                  <div className={styles.statIcon}>
                    <StatIcon size={28} />
                  </div>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* ── Orders card ── */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <Package size={18} />
              آخر الطلبات
            </h3>
            {orders.length === 0 ? (
              <p>لا توجد طلبات سابقة حتى الآن.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={styles.orderRow}>
                  <span className={styles.orderId}>{order.order_number}</span>
                  <span className={styles.orderDate}>{order.created_at?.slice(0, 10)}</span>
                  <span className={styles.orderTotal}>{order.total_price} $</span>
                  <Badge text={order.status_label} variant="warning" />
                  <button
                    type="button"
                    className={styles.trackBtn}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      onNavigate?.('tracking');
                    }}
                  >
                    تتبع ←
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ── Profile card ── */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <MapPin size={18} />
              المعلومات الشخصية
            </h3>
            <div className={styles.twoCol}>
              <InputField
                label="الاسم الأول"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
              />
              <InputField
                label="اسم العائلة"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
              />
              <InputField
                label="البريد"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <InputField
                label="الهاتف"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <div className={styles.twoCol} style={{ gridColumn: '1 / -1' }}>
                <InputField
                  label="العنوان"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <Button variant="primary" icon={<Save size={16} />} onClick={handleProfileSave} disabled={isSavingProfile}>
              {isSavingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>

            <div className={styles.twoCol} style={{ marginTop: '1.5rem' }}>
              <InputField
                label="كلمة المرور الحالية"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
              />
              <InputField
                label="كلمة المرور الجديدة"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField
                  label="تأكيد كلمة المرور الجديدة"
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                />
              </div>
            </div>
            <Button variant="outline" onClick={handlePasswordSave} disabled={isSavingPassword}>
              {isSavingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </Button>
          </div>
        </>
      )}

      {/* ── Logout ── */}
      <div className={styles.logoutRow}>
        <Button
          variant="outline"
          icon={<LogOut size={16} />}
          onClick={onLogout}
        >
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

export default AccountPage;
