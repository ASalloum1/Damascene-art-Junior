import styles from './pages.module.css';
import notifStyles from './NotificationsPage.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import { Icon } from '../components/SvgIcons';

const notifications = [
  {
    icon: 'orders',
    text: 'طلب جديد #1084 من أحمد الشامي',
    time: 'منذ ١٠ دقائق',
    read: false,
    type: 'طلب',
  },
  {
    icon: 'warning',
    text: 'مخزون منخفض: مزهرية زجاج منفوخ (٠ قطعة)',
    time: 'منذ ساعة',
    read: false,
    type: 'مخزون',
  },
  {
    icon: 'reviews',
    text: 'تقييم جديد من سارة مولر على صندوق الصدف',
    time: 'منذ ٣ ساعات',
    read: false,
    type: 'تقييم',
  },
  {
    icon: 'messages',
    text: 'رسالة جديدة من جون سميث: استفسار عن الشحن',
    time: 'منذ ٥ ساعات',
    read: true,
    type: 'رسالة',
  },
  {
    icon: 'dollar',
    text: 'تم استلام دفعة ٩٥٠$ من الطلب #1082',
    time: 'أمس',
    read: true,
    type: 'مالي',
  },
  {
    icon: 'products',
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
      <div className="stagger-1">
        <PageCard>
          {notifications.map((n, i) => {
            const rowClass = [
              styles.notifRow,
              notifStyles.notifRow,
              !n.read ? styles.unread : '',
              !n.read ? notifStyles.notifRowUnread : '',
            ].filter(Boolean).join(' ');

            const iconClass = [
              styles.notifIconWrap,
              !n.read ? notifStyles.notifIconWrapUnread : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={i} className={rowClass}>
                <div className={iconClass}>
                  <Icon name={n.icon} size={20} aria-hidden="true" />
                </div>
                <div className={styles.notifContent}>
                  <div className={`${styles.notifText} ${!n.read ? styles.bold : ''}`}>{n.text}</div>
                  <div className={styles.notifTime}>{n.time}</div>
                </div>
                <Badge text={n.type} variant="neutral" />
                {!n.read ? (
                  <div
                    className={notifStyles.notifDotUnread}
                    aria-label="إشعار غير مقروء"
                  />
                ) : null}
              </div>
            );
          })}
        </PageCard>
      </div>
    </div>
  );
}

export default NotificationsPage;
