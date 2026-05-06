import { useState, useEffect } from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Button } from '../components/Button.jsx';
import styles from './MyReviewsPage.module.css';

function toArabicNumerals(input) {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(input).replace(/\d/g, (d) => map[Number(d)]);
}

function formatArabicDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('ar-SY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return toArabicNumerals(formatter.format(date));
}

export function MyReviewsPage({ onNavigate }) {
  const { baseUrl, bearerToken } = useApi();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/api/customers/my-reviews`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${bearerToken}`,
          },
        });
        if (!res.ok) {
          if (!cancelled) setReviews([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.data) ? data.data : [];
        const sorted = [...list].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        if (!cancelled) setReviews(sorted);
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!cancelled) setError('فشل تحميل التقييمات');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [baseUrl, bearerToken]);

  const renderStars = (rate) => {
    const filled = Math.max(0, Math.min(5, Number(rate) || 0));
    return (
      <span
        className={styles.stars}
        role="img"
        aria-label={`${filled} من ٥ نجوم`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < filled ? 'var(--color-gold)' : 'none'}
            stroke={i < filled ? 'var(--color-gold)' : 'var(--color-stone-light)'}
            strokeWidth={1.5}
          />
        ))}
      </span>
    );
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="تقييماتي"
        subtitle="آراؤك ساعدت الآخرين على اكتشاف الفن الدمشقي"
      />

      <div className={styles.card}>
        <h3 className={styles.cardHeading}>
          <MessageSquareText size={18} />
          تقييماتي على المنتجات
        </h3>

        {isLoading ? (
          <p className={styles.stateMsg}>جاري تحميل التقييمات...</p>
        ) : error ? (
          <p className={styles.errorMsg}>{error}</p>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>لم تقم بتقييم أي منتج بعد</p>
            <p className={styles.emptyDesc}>
              شاركنا انطباعك عن قطعك المقتناة لإلهام الآخرين.
            </p>
            <Button variant="primary" onClick={() => onNavigate?.('shop')}>
              تصفّح المتجر
            </Button>
          </div>
        ) : (
          <ul className={styles.list}>
            {reviews.map((review) => (
              <li key={review.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.productName}>{review.product_name}</span>
                  {renderStars(review.rate)}
                </div>
                <p className={styles.reviewBody}>{review.body}</p>
                <div className={styles.itemFooter}>
                  <span className={styles.reviewDate}>
                    {formatArabicDate(review.created_at)}
                  </span>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        console.log('TODO: edit review', review.id);
                      }}
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => {
                        console.log('TODO: delete review', review.id);
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyReviewsPage;
