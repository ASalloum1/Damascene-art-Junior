import { useState, useMemo } from 'react';
import { Star, Check, X, Trash2, ExternalLink, StarHalf } from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import MiniBar from '../../components/ui/MiniBar.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockReviews, mockProducts } from '../../data/mockData.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import styles from './ReviewsManagement.module.css';

const STORE_OPTIONS = [
  { value: '', label: 'كل المتاجر' },
  { value: 'المتجر الرئيسي', label: 'المتجر الرئيسي' },
  { value: 'فرع دمشق القديمة', label: 'فرع دمشق القديمة' },
  { value: 'فرع حلب', label: 'فرع حلب' },
  { value: 'فرع اللاذقية', label: 'فرع اللاذقية' },
];

const RATING_OPTIONS = [
  { value: '', label: 'كل التقييمات' },
  { value: '5', label: '٥ نجوم' },
  { value: '4', label: '٤ نجوم' },
  { value: '3', label: '٣ نجوم' },
  { value: '2', label: '٢ نجوم' },
  { value: '1', label: '١ نجمة' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'منشور', label: 'منشور' },
  { value: 'بانتظار', label: 'بانتظار' },
  { value: 'مرفوض', label: 'مرفوض' },
];

function StarRating({ rating }) {
  return (
    <div className={styles.starRow} aria-label={`تقييم ${rating} من ٥`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          strokeWidth={1.8}
          className={s <= rating ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </div>
  );
}

function getStatusVariant(status) {
  if (status === 'منشور') return 'success';
  if (status === 'بانتظار') return 'warning';
  if (status === 'مرفوض') return 'danger';
  return 'default';
}

export default function ReviewsManagementPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState(() => mockReviews);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter((r) => {
      const matchSearch =
        !q ||
        r.customer.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q);
      const matchStore = !storeFilter || r.store === storeFilter;
      const matchRating = !ratingFilter || String(r.rating) === ratingFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStore && matchRating && matchStatus;
    });
  }, [reviews, search, storeFilter, ratingFilter, statusFilter]);

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'بانتظار').length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  function approveReview(id, productName) {
    const product = mockProducts.find((p) => p.name === productName);
    setSelectedProduct(product);
    setProductModalOpen(true);

    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'منشور' } : r))
    );
    showToast({ message: 'تم نشر التقييم بنجاح', type: 'success' });
  }

  function viewProduct(productName) {
    const product = mockProducts.find((p) => p.name === productName);
    setSelectedProduct(product);
    setProductModalOpen(true);
  }

  function rejectReview(id) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'مرفوض' } : r))
    );
    showToast({ message: 'تم رفض التقييم', type: 'warning' });
  }

  function confirmDelete() {
    setDeleteLoading(true);
    setTimeout(() => {
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget));
      setDeleteTarget(null);
      setDeleteLoading(false);
      showToast({ message: 'تم حذف التقييم', type: 'success' });
    }, 600);
  }

  const ratingDist = [
    { stars: 5, label: '٥ نجوم', pct: 65, color: 'var(--color-green)' },
    { stars: 4, label: '٤ نجوم', pct: 20, color: 'var(--color-blue)' },
    { stars: 3, label: '٣ نجوم', pct: 10, color: 'var(--color-gold)' },
    { stars: 2, label: '٢ نجوم', pct: 3, color: 'var(--color-orange)' },
    { stars: 1, label: '١ نجمة', pct: 2, color: 'var(--color-red)' },
  ];

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Star size={35} strokeWidth={2} />
        </div>
        <div>
        <h1 className={styles.pageTitle}>إدارة التقييمات</h1>
          <p className={styles.pageSubtitle}>متابعة حالات الطلبات ومعالجتها من الاستلام حتى التسليم</p>
          </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={Star}
          label="متوسط التقييم"
          value={`${avgRating} / ٥`}
          color="gold"
          subtitle="إجمالي التقييمات"
        />
        <StatCard
          icon={StarHalf}
          label="تقييمات جديدة"
          value={String(pendingCount)}
          color="orange"
          subtitle="بانتظار المراجعة"
        />
        <StatCard
          icon={Star}
          label="إجمالي التقييمات"
          value={String(totalReviews)}
          color="blue"
          subtitle="جميع التقييمات"
        />
      </div>

      {/* Rating Distribution */}
      <div className={styles.distCard}>
        <h3 className={styles.distTitle}>توزيع التقييمات</h3>
        <div className={styles.distBars}>
          {ratingDist.map((d) => (
            <MiniBar
              key={d.stars}
              percentage={d.pct}
              label={d.label}
              value={`${d.pct}%`}
              color={d.color}
              height={10}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <SearchInput
            placeholder="بحث في التقييمات..."
            onSearch={setSearch}
            value={search}
            onChange={setSearch}
          />
        </div>
        <SelectField
          label=""
          options={STORE_OPTIONS}
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          placeholder="المتجر"
        />
        <SelectField
          label=""
          options={RATING_OPTIONS}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          placeholder="التقييم"
        />
        <SelectField
          label=""
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="الحالة"
        />
      </div>

      {/* Review Cards */}
      {filtered.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={Star}
            title="في انتظار صدى الإعجاب"
            description="لا توجد تقييمات جديدة حالياً. كل الآراء السابقة قد تم الاعتناء بها وتوثيقها في سجلاتنا الفنية."
          />
        </div>
      ) : (
        <div className={styles.reviewGrid}>
          {filtered.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div className={styles.reviewInfo}>
                  <span className={styles.reviewCustomer}>{review.customer}</span>
                  <span className={styles.reviewProduct}>{review.product}</span>
                </div>
                <div className={styles.reviewHeaderRight}>
                  <Badge text={review.status} variant={getStatusVariant(review.status)} />
                </div>
              </div>

              <div className={styles.reviewMeta}>
                <StarRating rating={review.rating} />
                <span className={styles.reviewDate}>{formatDate(review.date)}</span>
              </div>

              <p className={styles.reviewText}>{review.text}</p>

              <div className={styles.reviewFooter}>
                <span className={styles.reviewStore}>{review.store}</span>
                <div className={styles.reviewActions}>
                  {review.status !== 'منشور' ? (
                    <button
                      type="button"
                      className={[styles.actionBtn, styles.actionApprove].join(' ')}
                      onClick={() => approveReview(review.id, review.product)}
                      title="نشر التقييم وعرض المنتج"
                      aria-label="نشر التقييم وعرض المنتج"
                    >
                      <Check size={15} strokeWidth={2} />
                    </button>
                  ) : null}
                  {review.status !== 'مرفوض' ? (
                    <button
                      type="button"
                      className={[styles.actionBtn, styles.actionReject].join(' ')}
                      onClick={() => rejectReview(review.id)}
                      title="رفض التقييم"
                      aria-label="رفض التقييم"
                    >
                      <X size={15} strokeWidth={2} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.actionDelete].join(' ')}
                    onClick={() => setDeleteTarget(review.id)}
                    title="حذف التقييم"
                    aria-label="حذف التقييم"
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.actionView].join(' ')}
                    onClick={() => viewProduct(review.product)}
                    title="عرض المنتج"
                    aria-label="عرض المنتج"
                  >
                    <ExternalLink size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={`المنتج: ${selectedProduct?.name}`}
        size="md"
      >
        {selectedProduct ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img
                src={selectedProduct.image || `https://picsum.photos/seed/${selectedProduct.id}/600/360`}
                alt={selectedProduct.name}
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border, #e5e5e5)',
                  background: 'var(--color-cream, #f7f4ee)',
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/${selectedProduct.id}/600/360`;
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>اسم المنتج:</strong>
              <p>{selectedProduct.name}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>المتجر:</strong>
              <p>{selectedProduct.store}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>الفئة:</strong>
              <p>{selectedProduct.category}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>السعر:</strong>
              <p>{formatCurrency(selectedProduct.price)}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>المخزون:</strong>
              <p>{selectedProduct.stock > 0 ? selectedProduct.stock : 'نفد المخزون'}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>التقييم:</strong>
              <p>{selectedProduct.rating} / 5 ({selectedProduct.reviewCount} تقييم)</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>الحالة:</strong>
              <p>{selectedProduct.status}</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
        danger
        loading={deleteLoading}
      />
    </div>
  );
}
