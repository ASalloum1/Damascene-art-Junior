import { useState, useEffect } from 'react';
import { Package, Heart, Star, MapPin, LogOut } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Badge } from '../components/Badge.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './AccountPage.module.css';

const STATS = [
  { icon: Package, label: 'طلباتي',   page: 'my-orders',  countKey: 'orders' },
  { icon: Heart,   label: 'المفضلة',  page: 'wishlist',   countKey: 'wishlist' },
  { icon: Star,    label: 'تقييماتي', page: 'my-reviews', countKey: 'reviews' },
  { icon: MapPin,  label: 'عناويني',  page: 'addresses',  countKey: 'addresses' },
];

const COUNT_REQUESTS = [
  { key: 'orders',    path: '/api/customers/orders',     pick: (d) => d?.data?.length ?? 0 },
  { key: 'wishlist',  path: '/api/customers/wish-lists', pick: (d) => d?.data?.wish_lists?.length ?? 0 },
  { key: 'reviews',   path: '/api/customers/my-reviews', pick: (d) => d?.data?.length ?? 0 },
  { key: 'addresses', path: '/api/customers/addresses',  pick: (d) => d?.data?.addresses?.length ?? 0 },
];

const formatCount = (n) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString('ar-EG');

const orders = [
  { id: '#1084', date: '٠٣/٠٤/٢٠٢٦', total: '١,٤٧٥ $', status: 'قيد التجهيز', variant: 'warning' },
  { id: '#1078', date: '١٥/٠٣/٢٠٢٦', total: '٣٥٠ $', status: 'تم التسليم', variant: 'success' },
  { id: '#1065', date: '٠١/٠٣/٢٠٢٦', total: '٨٩٠ $', status: 'تم التسليم', variant: 'success' },
];

export function AccountPage({ onNavigate, onLogout }) {
  const { baseUrl, bearerToken } = useApi();
  const [counts, setCounts] = useState({
    orders: null,
    wishlist: null,
    reviews: null,
    addresses: null,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    if (!baseUrl || !bearerToken) {
      setLoadingCounts(false);
      return;
    }
    const controller = new AbortController();

    const fetchCount = async ({ path, pick }) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${bearerToken}`,
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return pick(data);
    };

    Promise.allSettled(COUNT_REQUESTS.map((req) => fetchCount(req))).then((results) => {
      if (controller.signal.aborted) return;
      const next = { orders: null, wishlist: null, reviews: null, addresses: null };
      results.forEach((result, i) => {
        const key = COUNT_REQUESTS[i].key;
        if (result.status === 'fulfilled' && typeof result.value === 'number') {
          next[key] = result.value;
        } else {
          next[key] = null;
        }
      });
      setCounts(next);
      setLoadingCounts(false);
    });

    return () => controller.abort();
  }, [baseUrl, bearerToken]);

  return (
    <div className={styles.page}>
      <SectionHeader title="حسابي" subtitle="مرحباً، أحمد الشامي" />

      {/* ── Stat grid ── */}
      <div className={styles.statGrid}>
        {STATS.map((stat) => {
          const StatIcon = stat.icon;
          const rawCount = counts[stat.countKey];
          const showSkeleton = loadingCounts && rawCount === null;
          return (
            <div
              key={stat.countKey}
              className={styles.statCard}
              onClick={() => onNavigate?.(stat.page)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate?.(stat.page);
                }
              }}
            >
              <div className={styles.statIcon}>
                <StatIcon size={28} />
              </div>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>
                {showSkeleton ? (
                  <span className={styles.skeleton} aria-label="جاري التحميل">…</span>
                ) : (
                  formatCount(rawCount)
                )}
              </p>
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
        {orders.map((order) => (
          <div key={order.id} className={styles.orderRow}>
            <span className={styles.orderId}>{order.id}</span>
            <span className={styles.orderDate}>{order.date}</span>
            <span className={styles.orderTotal}>{order.total}</span>
            <Badge text={order.status} variant={order.variant} />
            <button
              type="button"
              className={styles.trackBtn}
              onClick={() => onNavigate?.('tracking')}
            >
              تتبع ←
            </button>
          </div>
        ))}
      </div>

      {/* ── Profile card ── */}
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>
          <MapPin size={18} />
          المعلومات الشخصية
        </h3>
        <div className={styles.twoCol}>
          <InputField label="الاسم" placeholder="أحمد الشامي" />
          <InputField label="البريد" type="email" placeholder="ahmed@email.com" />
          <InputField label="الهاتف" placeholder="+971 XXX" type="tel" />
          <InputField label="كلمة المرور" type="password" placeholder="••••••" />
        </div>
        <Button variant="primary">حفظ التغييرات</Button>
      </div>

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
