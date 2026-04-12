import React from 'react';
import styles from './pages.module.css';
import reviewStyles from './ReviewsPage.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Icon } from '../components/SvgIcons';

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
        <div className="stagger-1"><StatCard icon="star"     label="متوسط التقييم"  value="٤.٧ / ٥" accentVariant="primary" sub="إجمالي" /></div>
        <div className="stagger-2"><StatCard icon="fileText" label="تقييمات جديدة"  value="٨"        accentVariant="info"    sub="بانتظار المراجعة" /></div>
      </div>
      <div className="stagger-2">
        <PageCard>
          {reviews.map((r, i) => (
            <div key={i} className={`${styles.reviewCard} ${reviewStyles.reviewCard}`}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewAuthor}>{r.customer}</span>
                  <span className={styles.reviewProduct}> — {r.product}</span>
                </div>
                <div className={styles.reviewMeta}>
                  <span
                    className={`${styles.stars} ${reviewStyles.stars}`}
                    aria-label={`تقييم ${r.rating} من ٥`}
                  >
                    {[...Array(5)].map((_, si) => (
                      <Icon
                        key={si}
                        name="star"
                        size={14}
                        style={{
                          color: si < r.rating ? 'var(--color-gold)' : 'var(--color-ivory-dark)',
                          fill: si < r.rating ? 'var(--color-gold)' : 'none'
                        }}
                      />
                    ))}
                  </span>
                  <Badge
                    text={r.status}
                    variant={r.status === 'منشور' ? 'success' : 'warning'}
                  />
                </div>
              </div>
              <p className={`${styles.reviewText} ${reviewStyles.reviewText}`}>{r.text}</p>
              <div className={`${styles.reviewFooter}`}>
                <span className={styles.reviewDate}>{r.date}</span>
                <div className={`${styles.reviewActions} ${reviewStyles.reviewActions}`}>
                  {r.status === 'بانتظار' ? (
                    <>
                      <span className={reviewStyles.btnApprove}>
                        <ActionBtn text="موافقة" variant="success" onClick={() => {}} icon={<Icon name="check" size={14} />} />
                      </span>
                      <span className={reviewStyles.btnReject}>
                        <ActionBtn text="رفض" variant="error" onClick={() => {}} icon={<Icon name="x" size={14} />} />
                      </span>
                    </>
                  ) : null}
                  <span className={reviewStyles.btnReply}>
                    <ActionBtn text="رد" variant="info" onClick={() => {}} icon={<Icon name="reply" size={14} />} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </PageCard>
      </div>
    </div>
  );
}

export default ReviewsPage;
