import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import { ShoppingCart, AlertTriangle, Star, MessageSquare, DollarSign, Package } from 'lucide-react';

const notifications = [
  {
    icon: ShoppingCart,
    text: 'طلب جديد #1084 من أحمد الشامي',
    time: 'منذ ١٠ دقائق',
    read: false,
    type: 'طلب',
  },
  {
    icon: AlertTriangle,
    text: 'مخزون منخفض: مزهرية زجاج منفوخ (٠ قطعة)',
    time: 'منذ ساعة',
    read: false,
    type: 'مخزون',
  },
  {
    icon: Star,
    text: 'تقييم جديد من سارة مولر على صندوق الصدف',
    time: 'منذ ٣ ساعات',
    read: false,
    type: 'تقييم',
  },
  {
    icon: MessageSquare,
    text: 'رسالة جديدة من جون سميث: استفسار عن الشحن',
    time: 'منذ ٥ ساعات',
    read: true,
    type: 'رسالة',
  },
  {
    icon: DollarSign,
    text: 'تم استلام دفعة ٩٥٠$ من الطلب #1082',
    time: 'أمس',
    read: true,
    type: 'مالي',
  },
  {
    icon: Package,
    text: 'تم تسليم الطلب #1079 بنجاح',
    time: 'أمس',
    read: true,
    type: 'شحن',
  },
];

export function NotificationsPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="مركز الإشعارات" />
      <PageCard>
        {notifications.map((n, i) => {
          const IconComponent = n.icon;
          return (
            <div key={i} className={`${styles.notifRow} ${!n.read ? styles.unread : ''}`}>
              <div className={styles.notifIconWrap}>
                <IconComponent size={20} />
              </div>
              <div className={styles.notifContent}>
                <div className={`${styles.notifText} ${!n.read ? styles.bold : ''}`}>{n.text}</div>
                <div className={styles.notifTime}>{n.time}</div>
              </div>
              <Badge text={n.type} variant="neutral" />
              {!n.read && <div className={styles.notifDot} />}
            </div>
          );
        })}
      </PageCard>
    </div>
  );
}

export default NotificationsPage;
