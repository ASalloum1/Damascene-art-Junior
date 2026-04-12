import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Star, FileText } from 'lucide-react';

const reviews = [
  {
    customer: 'أحمد الشامي',
    product: 'طاولة موزاييك',
    rating: 5,
    text: 'قطعة فنية رائعة! التفاصيل مذهلة والجودة عالية جداً.',
    status: 'منشور',
    date: '٠٢/٠٤/٢٠٢٦',
  },
  {
    customer: 'سارة مولر',
    product: 'صندوق صدف',
    rating: 4,
    text: 'جميل جداً لكن التوصيل تأخر قليلاً.',
    status: 'بانتظار',
    date: '٠١/٠٤/٢٠٢٦',
  },
  {
    customer: 'جون سميث',
    product: 'مزهرية زجاج',
    rating: 5,
    text: 'Absolutely stunning! A true piece of art.',
    status: 'منشور',
    date: '٣٠/٠٣/٢٠٢٦',
  },
];

export function ReviewsPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="التقييمات والمراجعات" />
      <div className={styles.statRow}>
        <StatCard icon={Star}     label="متوسط التقييم"  value="٤.٧ / ٥" accentVariant="primary" sub="إجمالي" />
        <StatCard icon={FileText} label="تقييمات جديدة"  value="٨"        accentVariant="info"    sub="بانتظار المراجعة" />
      </div>
      <PageCard>
        {reviews.map((r, i) => (
          <div key={i} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <span className={styles.reviewAuthor}>{r.customer}</span>
                <span className={styles.reviewProduct}> — {r.product}</span>
              </div>
              <div className={styles.reviewMeta}>
                <span className={styles.stars}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
                <Badge
                  text={r.status}
                  variant={r.status === 'منشور' ? 'success' : 'warning'}
                />
              </div>
            </div>
            <p className={styles.reviewText}>{r.text}</p>
            <div className={styles.reviewFooter}>
              <span className={styles.reviewDate}>{r.date}</span>
              <div className={styles.reviewActions}>
                {r.status === 'بانتظار' && (
                  <>
                    <ActionBtn text="موافقة" variant="success" onClick={() => {}} />
                    <ActionBtn text="رفض" variant="error" onClick={() => {}} />
                  </>
                )}
                <ActionBtn text="رد" variant="info" onClick={() => {}} />
              </div>
            </div>
          </div>
        ))}
      </PageCard>
    </div>
  );
}

export default ReviewsPage;
