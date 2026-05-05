import { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import MiniBar from '../../components/ui/MiniBar.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate, toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest } from '../../utils/adminApi.js';
import styles from './ReviewsManagement.module.css';

function StarRating({ rating }) {
  return (
    <div className={styles.starRow} aria-label={`تقييم ${rating} من ٥`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          strokeWidth={1.8}
          className={star <= rating ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </div>
  );
}

function getStatusVariant(status) {
  if (status === 'published') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'default';
}

export default function ReviewsManagementPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const query = new URLSearchParams();

      if (search) query.set('search', search);
      if (ratingFilter) query.set('rating', ratingFilter);
      if (statusFilter) query.set('status', statusFilter);

      const path = query.toString()
        ? `${API_CONFIG.ENDPOINTS.reviews}?${query.toString()}`
        : API_CONFIG.ENDPOINTS.reviews;

      const data = await apiRequest(path);
      setReviews(data?.data?.reviews || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل التقييمات', type: 'error' });
    }
  }, [ratingFilter, search, showToast, statusFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return reviews.filter((review) => {
      const matchSearch =
        !query ||
        review.customer?.toLowerCase().includes(query) ||
        review.product?.toLowerCase().includes(query) ||
        review.text?.toLowerCase().includes(query);
      const matchRating = !ratingFilter || String(review.rating) === ratingFilter;
      const matchStatus = !statusFilter || review.status === statusFilter;
      return matchSearch && matchRating && matchStatus;
    });
  }, [ratingFilter, reviews, search, statusFilter]);

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((review) => review.status === 'pending').length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => Number(review.rating) === rating).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return {
      stars: rating,
      label: `${toArabicNum(rating)} نجوم`,
      pct,
      color: 'var(--color-gold)',
    };
  });

  const updateReviewStatus = useCallback(async (review, status) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.reviewStatus(review.source || 'product', review.id), {
        method: 'POST',
        body: { status },
      });
      showToast({ message: 'تم تحديث حالة التقييم', type: 'success' });
      await loadReviews();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث حالة التقييم', type: 'error' });
    }
  }, [loadReviews, showToast]);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Star size={35} strokeWidth={2} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>إدارة التقييمات</h1>
          <p className={styles.pageSubtitle}>مراجعة تقييمات المنتجات والعملاء وإدارة حالة النشر</p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <StatCard icon={Star} label="متوسط التقييم" value={`${avgRating} / ٥`} color="gold" subtitle="إجمالي التقييمات" />
        <StatCard icon={Star} label="تقييمات جديدة" value={String(pendingCount)} color="orange" subtitle="بانتظار المراجعة" />
        <StatCard icon={Star} label="إجمالي التقييمات" value={String(totalReviews)} color="blue" subtitle="جميع التقييمات" />
      </div>

      <div className={styles.distCard}>
        <h3 className={styles.distTitle}>توزيع التقييمات</h3>
        <div className={styles.distBars}>
          {ratingDist.map((item) => (
            <MiniBar
              key={item.stars}
              percentage={item.pct}
              label={item.label}
              value={`${item.pct}%`}
              color={item.color}
              height={10}
            />
          ))}
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <SearchInput placeholder="بحث في التقييمات..." onSearch={setSearch} value={search} />
        </div>
        <SelectField
          label=""
          options={[
            { value: '', label: 'كل التقييمات' },
            { value: '5', label: '٥ نجوم' },
            { value: '4', label: '٤ نجوم' },
            { value: '3', label: '٣ نجوم' },
            { value: '2', label: '٢ نجمتان' },
            { value: '1', label: '١ نجمة' },
          ]}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          placeholder="التقييم"
        />
        <SelectField
          label=""
          options={[
            { value: '', label: 'الكل' },
            { value: 'pending', label: 'بانتظار' },
            { value: 'published', label: 'منشور' },
            { value: 'rejected', label: 'مرفوض' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="الحالة"
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState icon={Star} title="لا توجد تقييمات" description="لا توجد تقييمات مطابقة لمرشحات البحث الحالية." />
        </div>
      ) : (
        <div className={styles.reviewGrid}>
          {filtered.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div className={styles.reviewInfo}>
                  <span className={styles.reviewCustomer}>{review.customer}</span>
                  <span className={styles.reviewProduct}>{review.product || '—'}</span>
                </div>
                <div className={styles.reviewHeaderRight}>
                  <Badge text={review.status_label || review.status} variant={getStatusVariant(review.status)} />
                </div>
              </div>

              <div className={styles.reviewMeta}>
                <StarRating rating={Number(review.rating || 0)} />
                <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
              </div>

              <p className={styles.reviewText}>{review.text || 'لا يوجد نص مرفق.'}</p>

              <div className={styles.reviewFooter}>
                <span className={styles.reviewStore}>{review.store || '—'}</span>
                <div className={styles.reviewActions}>
                  {review.status !== 'published' ? (
                    <button
                      type="button"
                      className={[styles.actionBtn, styles.actionApprove].join(' ')}
                      onClick={() => updateReviewStatus(review, 'published')}
                    >
                      <Check size={15} strokeWidth={2} />
                    </button>
                  ) : null}
                  {review.status !== 'rejected' ? (
                    <button
                      type="button"
                      className={[styles.actionBtn, styles.actionReject].join(' ')}
                      onClick={() => updateReviewStatus(review, 'rejected')}
                    >
                      <X size={15} strokeWidth={2} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
