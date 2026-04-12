import { Package, Heart, Star, MapPin } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Badge } from '../components/Badge.jsx';
import { InputField } from '../components/InputField.jsx';
import { Btn } from '../components/Btn.jsx';
import styles from './AccountPage.module.css';

const stats = [
  { icon: Package, label: 'طلباتي', value: '١٢ طلب' },
  { icon: Heart, label: 'المفضلة', value: '٨ منتجات' },
  { icon: Star, label: 'تقييماتي', value: '٥ تقييمات' },
  { icon: MapPin, label: 'عناويني', value: '٢ عناوين' },
];

const orders = [
  { id: '#1084', date: '٠٣/٠٤/٢٠٢٦', total: '١,٤٧٥ $', status: 'قيد التجهيز', variant: 'warning' },
  { id: '#1078', date: '١٥/٠٣/٢٠٢٦', total: '٣٥٠ $', status: 'تم التسليم', variant: 'success' },
  { id: '#1065', date: '٠١/٠٣/٢٠٢٦', total: '٨٩٠ $', status: 'تم التسليم', variant: 'success' },
];

export function AccountPage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <SectionHeader title="حسابي" subtitle="مرحباً، أحمد الشامي" />

      {/* ── Stat grid ── */}
      <div className={styles.statGrid}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon size={28} />
            </div>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
          </div>
        ))}
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
        <Btn variant="primary">حفظ التغييرات</Btn>
      </div>
    </div>
  );
}

export default AccountPage;
