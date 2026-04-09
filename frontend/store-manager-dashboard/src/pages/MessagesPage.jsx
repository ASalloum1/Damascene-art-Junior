import styles from './pages.module.css';
import messageStyles from './MessagesPage.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';

const messages = [
  {
    from: 'جون سميث',
    subject: 'استفسار عن شحن الطاولة',
    time: 'منذ ساعة',
    read: false,
    preview: 'مرحباً، أود الاستفسار عن مدة شحن الطاولة إلى ألمانيا...',
  },
  {
    from: 'ماريا غارسيا',
    subject: 'طلب تخصيص منتج',
    time: 'منذ ٣ ساعات',
    read: false,
    preview: 'هل يمكن تصنيع صندوق بمقاس مخصص؟ أحتاج...',
  },
  {
    from: 'ليلى حسن',
    subject: 'مشكلة في الطلب #1076',
    time: 'أمس',
    read: true,
    preview: 'وصلني المنتج لكن يوجد خدش صغير على...',
  },
  {
    from: 'أحمد الشامي',
    subject: 'شكر وتقدير',
    time: 'منذ يومين',
    read: true,
    preview: 'أشكركم على الخدمة الممتازة والتغليف الرائع...',
  },
];

export function MessagesPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="الرسائل وطلبات التواصل" />
      <PageCard>
        {messages.map((m, i) => {
          const rowClass = [
            styles.messageRow,
            messageStyles.messageRow,
            !m.read ? styles.unread : '',
            !m.read ? messageStyles.messageRowUnread : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={i} className={rowClass}>
              <div
                className={`${styles.messageAvatar} ${messageStyles.messageAvatar}`}
                aria-hidden="true"
              >
                {m.from[0]}
              </div>
              <div className={styles.messageBody}>
                <div className={styles.messageTopRow}>
                  <span className={`${styles.messageSender} ${!m.read ? styles.bold : ''}`}>
                    {m.from}
                  </span>
                  <span className={styles.messageTime}>{m.time}</span>
                </div>
                <div className={`${styles.messageSubject} ${!m.read ? styles.bold : ''}`}>
                  {m.subject}
                </div>
                <div className={styles.messagePreview}>{m.preview}</div>
              </div>
              {!m.read ? (
                <div
                  className={messageStyles.messageDotUnread}
                  aria-label="رسالة غير مقروءة"
                />
              ) : null}
            </div>
          );
        })}
      </PageCard>
    </div>
  );
}

export default MessagesPage;
