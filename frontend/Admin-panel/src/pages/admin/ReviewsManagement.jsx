import { useState, useMemo, useEffect } from 'react';
import {
  Star,
  Check,
  X,
  Trash2,
  ExternalLink,
  StarHalf,
  MessageSquare,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import MiniBar from '../../components/ui/MiniBar.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import InputField from '../../components/ui/InputField.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockReviews, mockProducts, mockUsers } from '../../data/mockData.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { replyToReview } from '../../api/reviewsApi.js';
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

// Build a "Display Name (ar) → email" map ONCE at module scope. Reviews don't
// embed the customer email; we resolve it through `mockUsers`. Falls back to
// "غير متوفر" in the modal when a name doesn't match.
const EMAIL_BY_NAME = mockUsers.reduce((acc, u) => {
  acc[`${u.firstName} ${u.lastName}`] = u.email;
  return acc;
}, {});

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

/**
 * ReplyReviewModal — admin-side Reply-by-Email composer.
 *
 * Subject is prefilled from the product name; the admin can edit before
 * sending. The body is required and capped at 2000 chars (Arabic counter
 * via `TextArea`'s `maxLength` slot). On success the parent fires `onSuccess`
 * and the modal closes; on failure we keep the modal open so the admin can
 * retry without losing their typing.
 */
function ReplyReviewModal({ isOpen, onClose, review, onSuccess }) {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const customerEmail = review ? EMAIL_BY_NAME[review.customer] : null;

  // Prefill on review change. We reset both fields whenever a different review
  // opens the modal so a previous draft doesn't bleed into the next reply.
  // We deliberately key on review.id only — re-running on every parent render
  // would clobber a half-written reply.
  useEffect(() => {
    if (review) {
      setSubject(`رد من الفن الدمشقي على تقييمك للمنتج: ${review.product}`);
      setMessage('');
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review?.id]);

  async function handleSubmit() {
    const nextErrors = {};
    if (!subject.trim()) {
      nextErrors.subject = 'الرجاء إدخال موضوع للرد';
    }
    if (message.trim().length < 10) {
      nextErrors.message = 'نص الرد يجب أن يحتوي على ١٠ أحرف على الأقل';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await replyToReview(review.id, {
        subject: subject.trim(),
        message: message.trim(),
      });
      showToast({ message: 'تم إرسال الرد بنجاح', type: 'success' });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      // Map HTTP shape to user-friendly Arabic. Endpoint not yet wired in
      // backend → 404; auth gating → 401/403; everything else → generic.
      const status = err?.status;
      const msg =
        status === 404
          ? 'خدمة إرسال الردود غير متاحة حالياً، يرجى المحاولة لاحقاً'
          : status === 401 || status === 403
          ? 'ليست لديك الصلاحية لإرسال الرد'
          : 'فشل إرسال الرد، يرجى المحاولة مرة أخرى';
      showToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!review) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      title="رد على التقييم"
      size="md"
      closeOnBackdrop={!submitting}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={handleSubmit}
          >
            إرسال الرد
          </Button>
        </>
      }
    >
      <div className={styles.replyModalBody}>
        {/* Read-only summary of the review being replied to. */}
        <div className={styles.replyModalSummary}>
          <div className={styles.replyMetaRow}>
            <span className={styles.replyMetaLabel}>اسم العميل</span>
            <span className={styles.replyMetaValue}>{review.customer}</span>
          </div>
          <div className={styles.replyMetaRow}>
            <span className={styles.replyMetaLabel}>البريد الإلكتروني</span>
            <span className={styles.replyMetaValue}>
              {customerEmail || 'غير متوفر'}
            </span>
          </div>
          <div className={styles.replyMetaRow}>
            <span className={styles.replyMetaLabel}>المنتج</span>
            <span className={styles.replyMetaValue}>{review.product}</span>
          </div>
          <div className={styles.replyMetaRow}>
            <span className={styles.replyMetaLabel}>التقييم</span>
            <StarRating rating={review.rating} />
          </div>
          <blockquote className={styles.replyQuote}>{review.text}</blockquote>
        </div>

        <InputField
          label="الموضوع"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          disabled={submitting}
        />

        <TextArea
          label="نص الرد"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message}
          rows={6}
          maxLength={2000}
          disabled={submitting}
          placeholder="اكتب رسالتك للعميل..."
        />
      </div>
    </Modal>
  );
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
  const [replyTarget, setReplyTarget] = useState(null);

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
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.actionReply].join(' ')}
                    onClick={() => setReplyTarget(review)}
                    title="الرد على التقييم"
                    aria-label="الرد على التقييم"
                  >
                    <MessageSquare size={15} strokeWidth={1.8} />
                  </button>
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

      <ReplyReviewModal
        isOpen={!!replyTarget}
        review={replyTarget}
        onClose={() => setReplyTarget(null)}
      />

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
