import { useEffect, useMemo, useState } from 'react';
import styles from './pages.module.css';
import reviewStyles from './ReviewsPage.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Icon } from '../components/SvgIcons';
import { useToast } from '../components/ui/Toast';
import { API_CONFIG } from '../config/api.config.js';
import { apiRequest } from '../utils/storeApi.js';
import { formatDate, toArabicNum } from '../utils/formatters.js';

function getStatusVariant(status) {
  if (status === 'published') return 'success';
  if (status === 'rejected') return 'error';
  return 'warning';
}

export function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);

  async function loadReviews() {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.reviews);
      setReviews(data?.data?.reviews || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل التقييمات', type: 'error' });
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function updateReviewStatus(review, status) {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.reviewStatus(review.source || 'product', review.id), {
        method: 'POST',
        body: {
          status,
        },
      });
      await loadReviews();
      showToast({ message: 'تم تحديث حالة التقييم', type: 'success' });
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث التقييم', type: 'error' });
    }
  }

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const pendingCount = useMemo(
    () => reviews.filter((review) => review.status === 'pending').length,
    [reviews]
  );

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="التقييمات والمراجعات" />
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="star" label="متوسط التقييم" value={`${toArabicNum(averageRating.toFixed(1))} / ٥`} accentVariant="primary" sub="إجمالي" /></div>
        <div className="stagger-2"><StatCard icon="fileText" label="تقييمات جديدة" value={toArabicNum(pendingCount)} accentVariant="info" sub="بانتظار المراجعة" /></div>
      </div>
      <div className="stagger-2">
        <PageCard>
          {reviews.map((review) => (
            <div key={review.id} className={`${styles.reviewCard} ${reviewStyles.reviewCard}`}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewAuthor}>{review.customer}</span>
                  <span className={styles.reviewProduct}> — {review.product || 'بدون منتج'}</span>
                </div>
                <div className={styles.reviewMeta}>
                  <span
                    className={`${styles.stars} ${reviewStyles.stars}`}
                    aria-label={`تقييم ${review.rating} من ٥`}
                  >
                    {[...Array(5)].map((_, index) => (
                      <Icon
                        key={index}
                        name="star"
                        size={14}
                        style={{
                          color: index < Number(review.rating || 0) ? 'var(--color-gold)' : 'var(--color-ivory-dark)',
                          fill: index < Number(review.rating || 0) ? 'var(--color-gold)' : 'none',
                        }}
                      />
                    ))}
                  </span>
                  <Badge
                    text={review.status_label || review.status}
                    variant={getStatusVariant(review.status)}
                  />
                </div>
              </div>
              <p className={`${styles.reviewText} ${reviewStyles.reviewText}`}>{review.text || 'لا يوجد نص مرفق.'}</p>
              <div className={styles.reviewFooter}>
                <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                <div className={`${styles.reviewActions} ${reviewStyles.reviewActions}`}>
                  {review.status === 'pending' ? (
                    <>
                      <span className={reviewStyles.btnApprove}>
                        <ActionBtn text="موافقة" variant="success" onClick={() => updateReviewStatus(review, 'published')} icon={<Icon name="check" size={14} />} />
                      </span>
                      <span className={reviewStyles.btnReject}>
                        <ActionBtn text="رفض" variant="error" onClick={() => updateReviewStatus(review, 'rejected')} icon={<Icon name="x" size={14} />} />
                      </span>
                    </>
                  ) : null}
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
