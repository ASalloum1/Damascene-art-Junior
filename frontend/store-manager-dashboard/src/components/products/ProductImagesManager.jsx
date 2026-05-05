import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Star,
  Image as ImageIcon,
  ZoomIn,
  Sofa,
  GripVertical,
  Trash2,
  Crown,
  ChevronLeft,
  Upload,
  X,
  Check,
  Loader2,
  Hourglass,
  AlertCircle,
  PauseCircle,
  ChevronDown,
} from 'lucide-react';

import * as productImagesApi from '../../api';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import { useFileUpload } from '../../hooks/useFileUpload.js';
import { useToast } from '../ui/Toast.jsx';

import styles from './ProductImagesManager.module.css';

/* ============================================================
   Constants (module-level so identity is stable across renders)
   ============================================================ */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');
const REORDER_DEBOUNCE_MS = 500;

const ROLE_OPTIONS = [
  { value: 'cover',     label: 'الصورة الرئيسية', Icon: Star },
  { value: 'gallery',   label: 'معرض (زاوية)',     Icon: ImageIcon },
  { value: 'detail',    label: 'تفاصيل (تقريب)',   Icon: ZoomIn },
  { value: 'lifestyle', label: 'في الاستخدام',      Icon: Sofa },
];

const ROLE_BY_VALUE = ROLE_OPTIONS.reduce((acc, r) => {
  acc[r.value] = r;
  return acc;
}, {});

// DnD announcements live INSIDE the component (memoized on `images`) so they can
// translate raw image IDs into Arabic position+length strings.
// See `dndAnnouncements` in ProductImagesManager below.

const DND_SCREEN_READER_INSTRUCTIONS = {
  draggable:
    'لاختيار صورة لإعادة الترتيب، اضغط مفتاح المسافة. أثناء السحب استخدم الأسهم لتحريكها، ومفتاح المسافة للإفلات، ومفتاح Escape للإلغاء.',
};

/* ============================================================
   Helpers
   ============================================================ */

const isAbsoluteOrBlob = (url) => /^(https?:|data:|blob:)/.test(url || '');

function bytesLabel(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} م.ب` : `${Math.round(bytes / 1024)} ك.ب`;
}

function validateFiles(files, currentCount, maxImages) {
  const accepted = [];
  const errors = [];
  let count = currentCount;
  for (const file of files) {
    if (count >= maxImages) {
      errors.push({ kind: 'max', message: `تم الوصول للحد الأقصى (${maxImages} صور)` });
      break;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push({
        kind: 'type',
        message: 'نوع الملف غير مدعوم — استخدم JPEG أو PNG أو WebP',
        file,
      });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        kind: 'size',
        message: `حجم الملف يتجاوز 5 ميجابايت (${file.name})`,
        file,
      });
      continue;
    }
    accepted.push(file);
    count++;
  }
  return { accepted, errors };
}

function makeStagedImage(file) {
  // Local-only ProductImage shape used in create mode for preview.
  // Stable id required for DnD identity; we attach the File as a non-enumerable
  // ref so the parent can pull it out at submit time.
  const id = `staged-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const url = URL.createObjectURL(file);
  return {
    id,
    _isStaged: true,
    _file: file,
    url,
    image_role: 'gallery',
    sort_order: 0,
    alt_text_ar: null,
    alt_text_en: null,
    width: null,
    height: null,
    file_size_bytes: file.size,
    mime_type: file.type,
    embedding_status: 'pending',
    embedding_processed_at: null,
    created_at: new Date().toISOString(),
  };
}

function findCoverId(images) {
  const cover = images.find((i) => i.image_role === 'cover');
  return cover ? cover.id : null;
}

/* ============================================================
   Sub-components — module-scope, NOT nested inside the parent.
   (Each is memoized so a single card change doesn't re-render
   the whole grid.)
   ============================================================ */

/* ─── DragHandle ───────────────────────────────────────── */
const DragHandle = memo(function DragHandle({ listeners, attributes, label }) {
  return (
    <button
      type="button"
      className={styles.dragHandle}
      aria-label={label}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} strokeWidth={2} aria-hidden />
    </button>
  );
});

/* ─── CoverBadge ───────────────────────────────────────── */
const CoverBadge = memo(function CoverBadge() {
  return (
    <div className={styles.coverBadge} aria-hidden="false">
      <Crown size={12} strokeWidth={2.2} aria-hidden />
      <span aria-hidden>رئيسية</span>
      <span className="visually-hidden">الصورة الرئيسية</span>
    </div>
  );
});

/* ─── RoleSelect ───────────────────────────────────────── */
const RoleSelect = memo(function RoleSelect({ value, onChange, imageId }) {
  const role = ROLE_BY_VALUE[value] || ROLE_OPTIONS[1];
  const StartIcon = role.Icon;
  const selectId = `role-${imageId}`;
  return (
    <div className={styles.roleSelectWrap}>
      <label htmlFor={selectId} className="visually-hidden">
        نوع الصورة
      </label>
      <StartIcon
        className={styles.roleSelectIconStart}
        size={14}
        strokeWidth={1.8}
        aria-hidden
      />
      <select
        id={selectId}
        className={styles.roleSelect}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={styles.roleSelectIconEnd}
        size={14}
        strokeWidth={1.8}
        aria-hidden
      />
    </div>
  );
});

/* ─── EmbeddingBadge ───────────────────────────────────── */
const EmbeddingBadge = memo(function EmbeddingBadge({ status, onRetry }) {
  let className;
  let Icon;
  let label;
  switch (status) {
    case 'processing':
      className = styles.embedProcessing;
      Icon = Loader2;
      label = 'قيد المعالجة';
      break;
    case 'completed':
      className = styles.embedCompleted;
      Icon = Check;
      label = 'جاهزة للبحث البصري';
      break;
    case 'failed':
      className = styles.embedFailed;
      Icon = AlertCircle;
      label = 'فشلت';
      break;
    case 'skipped':
      className = styles.embedSkipped;
      Icon = PauseCircle;
      label = 'مؤجَّلة (الخدمة غير متاحة)';
      break;
    case 'pending':
    default:
      className = styles.embedPending;
      Icon = Hourglass;
      label = 'في الانتظار';
  }
  return (
    <div className={`${styles.embedBadge} ${className}`}>
      <Icon size={12} strokeWidth={2} aria-hidden />
      <span>{label}</span>
      {status === 'failed' && onRetry ? (
        <button
          type="button"
          className={styles.embedRetry}
          onClick={onRetry}
          aria-label="إعادة محاولة معالجة الصورة"
        >
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
});

/* ─── AltTextFields ────────────────────────────────────── */
const AltTextFields = memo(function AltTextFields({
  imageId,
  altAr,
  altEn,
  onCommit,
}) {
  // Controlled inputs whose value is derived from props but allows local edits.
  // Adjust state during render when props change (React docs:
  // "Adjusting state when a prop changes" — no effect needed, no ref reads).
  const [arState, setArState] = useState({ prop: altAr || '', value: altAr || '' });
  const [enState, setEnState] = useState({ prop: altEn || '', value: altEn || '' });
  if ((altAr || '') !== arState.prop) {
    setArState({ prop: altAr || '', value: altAr || '' });
  }
  if ((altEn || '') !== enState.prop) {
    setEnState({ prop: altEn || '', value: altEn || '' });
  }
  const arVal = arState.value;
  const enVal = enState.value;
  const setArVal = (v) => setArState((s) => ({ ...s, value: v }));
  const setEnVal = (v) => setEnState((s) => ({ ...s, value: v }));

  const arId = `alt-ar-${imageId}`;
  const enId = `alt-en-${imageId}`;

  const handleArBlur = () => {
    if ((altAr || '') !== arVal) onCommit({ alt_text_ar: arVal || null });
  };
  const handleEnBlur = () => {
    if ((altEn || '') !== enVal) onCommit({ alt_text_en: enVal || null });
  };

  return (
    <details className={styles.altDetails}>
      <summary className={styles.altSummary}>
        <ChevronLeft
          className={styles.altSummaryChevron}
          size={14}
          strokeWidth={2}
          aria-hidden
        />
        <span>نص بديل (ar / en)</span>
      </summary>
      <div className={styles.altFields}>
        <label htmlFor={arId} className={styles.altLabel}>
          <span>عربي</span>
          <input
            id={arId}
            type="text"
            className={styles.altInput}
            value={arVal}
            onChange={(e) => setArVal(e.target.value)}
            onBlur={handleArBlur}
            placeholder="وصف الصورة بالعربية"
            dir="rtl"
            maxLength={255}
          />
        </label>
        <label htmlFor={enId} className={styles.altLabel}>
          <span>English</span>
          <input
            id={enId}
            type="text"
            className={styles.altInput}
            value={enVal}
            onChange={(e) => setEnVal(e.target.value)}
            onBlur={handleEnBlur}
            placeholder="Image description in English"
            dir="ltr"
            maxLength={255}
          />
        </label>
      </div>
    </details>
  );
});

/* ─── CardActions ──────────────────────────────────────── */
const CardActions = memo(function CardActions({
  isCover,
  canDelete,
  onSetCover,
  onDelete,
  deleteDisabledTitle,
}) {
  return (
    <div className={styles.cardActions}>
      {!isCover ? (
        <button
          type="button"
          className={`${styles.iconButton} ${styles.setCoverButton}`}
          onClick={onSetCover}
          aria-label="تعيين هذه الصورة كرئيسية"
        >
          <Crown size={14} strokeWidth={2} aria-hidden />
          <span>تعيين كرئيسية</span>
        </button>
      ) : (
        <span className={`${styles.iconButton} ${styles.setCoverButton}`} aria-hidden>
          <Check size={14} strokeWidth={2} />
          <span>الصورة الرئيسية</span>
        </span>
      )}
      <button
        type="button"
        className={`${styles.iconButton} ${styles.deleteButton}`}
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="حذف هذه الصورة"
        title={canDelete ? undefined : deleteDisabledTitle}
      >
        <Trash2 size={16} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
  );
});

/* ─── ImageCard (sortable wrapper + body) ──────────────── */
const ImageCard = memo(function ImageCard({
  image,
  index,
  isCover,
  canDelete,
  showEmbedding,
  onRoleChange,
  onAltCommit,
  onSetCover,
  onDelete,
  onRetryEmbedding,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const resolvedUrl = resolveImageUrl(image.url);
  const altText = image.alt_text_ar || `صورة المنتج ${index + 1}`;

  const handleRoleChange = useCallback(
    (next) => onRoleChange(image.id, next),
    [image.id, onRoleChange],
  );
  const handleAltCommit = useCallback(
    (patch) => onAltCommit(image.id, patch),
    [image.id, onAltCommit],
  );
  const handleSetCover = useCallback(
    () => onSetCover(image.id),
    [image.id, onSetCover],
  );
  const handleDelete = useCallback(
    () => onDelete(image.id),
    [image.id, onDelete],
  );
  const handleRetry = useCallback(
    () => onRetryEmbedding(image.id),
    [image.id, onRetryEmbedding],
  );

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        isCover ? styles.cardCover : '',
        isDragging ? styles.cardDragging : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`صورة المنتج رقم ${index + 1}`}
    >
      <div className={styles.thumbWrap}>
        <DragHandle
          listeners={listeners}
          attributes={attributes}
          label={`مقبض السحب لإعادة ترتيب الصورة ${index + 1}`}
        />
        {isCover ? <CoverBadge /> : null}
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={altText}
            className={styles.thumb}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : null}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.roleRow}>
          <RoleSelect
            value={image.image_role || 'gallery'}
            onChange={handleRoleChange}
            imageId={image.id}
          />
        </div>

        <AltTextFields
          imageId={image.id}
          altAr={image.alt_text_ar}
          altEn={image.alt_text_en}
          onCommit={handleAltCommit}
        />

        {showEmbedding ? (
          <EmbeddingBadge
            status={image.embedding_status || 'pending'}
            onRetry={handleRetry}
          />
        ) : null}

        <CardActions
          isCover={isCover}
          canDelete={canDelete}
          onSetCover={handleSetCover}
          onDelete={handleDelete}
          deleteDisabledTitle="لا يمكن حذف الصورة الوحيدة للمنتج"
        />
      </div>
    </article>
  );
});

/* ─── DropZone ─────────────────────────────────────────── */
const DropZone = memo(function DropZone({
  disabled,
  isOver,
  inputId,
  onPickFiles,
  onDrop,
  onDragEnter,
  onDragLeave,
  remaining,
  maxImages,
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onPickFiles(files);
    // Reset so picking the same file twice still fires change.
    e.target.value = '';
  };
  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const title = disabled
    ? `تم الوصول للحد الأقصى من الصور (${maxImages})`
    : undefined;

  return (
    <div
      className={[
        styles.dropZone,
        isOver ? styles.dropZoneActive : '',
        disabled ? styles.dropZoneDisabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="منطقة رفع الصور — اسحب الصور أو انقر للاختيار"
      title={title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={onDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={styles.dropIconWrap}>
        <Upload size={26} strokeWidth={1.8} aria-hidden />
      </div>
      <div className={styles.dropTitle}>
        {disabled ? 'لا يمكن إضافة المزيد من الصور' : 'اسحب الصور هنا أو انقر للاختيار'}
      </div>
      <div className={styles.dropMeta}>
        JPEG · PNG · WebP — حد أقصى 5 ميجا · متبقّي {remaining} من {maxImages}
      </div>
      <span className={styles.dropCta} aria-hidden>
        <Upload size={14} strokeWidth={2} />
        اختيار ملفات
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className={styles.hiddenInput}
        onChange={handleChange}
        disabled={disabled}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
});

/* ─── SkeletonGrid ─────────────────────────────────────── */
const SkeletonGrid = memo(function SkeletonGrid() {
  return (
    <div className={styles.skeletonGrid} aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={`${styles.skeletonThumb} skeleton-shimmer`} />
          <div className={`${styles.skeletonLine} skeleton-shimmer`} />
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineShort} skeleton-shimmer`}
          />
        </div>
      ))}
    </div>
  );
});

/* ============================================================
   ProductImagesManager — main component (default export)
   ============================================================ */

export default function ProductImagesManager({
  productId,
  initialImages,
  onImagesChange,
  maxImages = 10,
}) {
  const isEditMode = productId != null;
  const isLoading = initialImages === undefined;
  const dropZoneInputId = useId();
  const { showToast } = useToast();

  // ── images state — drives the grid ──
  // We track the most recent `initialImages` reference alongside the working
  // copy. When the parent supplies a new array (e.g., the GET /products/{id}
  // response lands), we adjust state during render rather than in an effect
  // (React docs: "Adjusting state when a prop changes").
  const [imagesState, setImagesState] = useState(() => ({
    seed: initialImages,
    list: Array.isArray(initialImages) ? initialImages : [],
  }));
  if (initialImages !== imagesState.seed) {
    setImagesState({
      seed: initialImages,
      list: Array.isArray(initialImages) ? initialImages : [],
    });
  }
  const images = imagesState.list;
  const setImages = useCallback((updater) => {
    setImagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev.list) : updater;
      if (next === prev.list) return prev;
      return { ...prev, list: next };
    });
  }, []);

  // ── stagedFiles — create-mode only; mirrors `images` order for File[] payload ──
  const [stagedFilesById, setStagedFilesById] = useState(() => new Map());

  // Drag-over visual state for the drop zone
  const [dropOver, setDropOver] = useState(false);
  const dragCounterRef = useRef(0);

  // ── Reorder debounce timer ──
  const reorderTimerRef = useRef(null);
  useEffect(
    () => () => {
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    },
    [],
  );

  // Track the most-recently-emitted images reference. Used to:
  //  1. Skip the initial emit on mount (parent already has its initial state).
  //  2. Prevent the emit-effect from re-firing for an `images` ref it has
  //     already pushed to the parent.
  const lastEmittedRef = useRef(images);

  // Mirror stagedFilesById in a ref so the emit-effect can read the latest
  // staged-files snapshot WITHOUT re-firing on Map identity changes that
  // haven't actually altered the images array.
  const stagedFilesByIdRef = useRef(stagedFilesById);
  useEffect(() => {
    stagedFilesByIdRef.current = stagedFilesById;
  }, [stagedFilesById]);

  // ── Notify parent of changes ─────────────────────────────────────────
  // Create-mode emits File[]; edit-mode emits ProductImage[].
  const emitChange = useCallback(
    (nextImages, nextStaged) => {
      if (!onImagesChange) return;
      let payload;
      if (isEditMode) {
        payload = nextImages;
      } else {
        // File[] in create mode — order matches `images` order.
        payload = nextImages
          .map((img) => nextStaged.get(img.id))
          .filter(Boolean);
      }
      onImagesChange(payload);
    },
    [isEditMode, onImagesChange],
  );

  // Emit on real images changes only. The effect runs AFTER commit, so the
  // parent's setState happens during a normal update phase — no
  // "setState while rendering" warning.
  useEffect(() => {
    if (lastEmittedRef.current === images) return;
    lastEmittedRef.current = images;
    emitChange(images, stagedFilesByIdRef.current);
  }, [images, emitChange]);

  // Thin wrapper: just sets state. Emit happens via the effect above.
  // `nextStaged` is applied synchronously so it's in place before the
  // emit-effect reads stagedFilesByIdRef on the subsequent commit.
  const updateImages = useCallback(
    (updater, nextStaged) => {
      if (nextStaged) setStagedFilesById(nextStaged);
      setImages(updater);
    },
    [setImages],
  );

  // ── useFileUpload setup (edit-mode only meaningful) ──
  const handleUploadSuccess = useCallback(
    (uploaded) => {
      if (!Array.isArray(uploaded) || uploaded.length === 0) return;
      updateImages((prev) => {
        const merged = [...prev, ...uploaded];
        return merged.map((img, idx) => ({ ...img, sort_order: idx }));
      });
      showToast({ message: 'تم رفع الصور بنجاح', type: 'success' });
    },
    [showToast, updateImages],
  );

  const handleUploadError = useCallback(
    (err) => {
      const status = err?.status;
      const msg =
        err?.body?.message ||
        (status === 422 ? 'فشل رفع الصور — تحقق من الملفات' : 'فشل رفع الصور — حاول مجدداً');
      showToast({ message: msg, type: 'error' });
    },
    [showToast],
  );

  const { upload, uploads, cancelUpload } = useFileUpload({
    productId,
    apiClient: productImagesApi,
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
  });

  // ── File validation + upload pipeline ─────────────────────────────────
  const handleAcceptedFiles = useCallback(
    async (rawFiles) => {
      const { accepted, errors } = validateFiles(
        rawFiles,
        images.length,
        maxImages,
      );

      // Show one toast per error kind — but keep all messages distinct so
      // the user knows why each file was rejected.
      const seen = new Set();
      for (const err of errors) {
        const key = `${err.kind}:${err.message}`;
        if (seen.has(key)) continue;
        seen.add(key);
        showToast({
          message: err.message,
          type: err.kind === 'max' ? 'warning' : 'error',
        });
      }

      if (accepted.length === 0) return;

      if (!isEditMode) {
        // CREATE MODE — stage locally, no API call.
        const newImages = accepted.map(makeStagedImage);
        // First-image auto-cover for parity with backend behavior.
        const isFirstBatch = images.length === 0;
        if (isFirstBatch && newImages[0]) {
          newImages[0].image_role = 'cover';
        }
        const newStaged = new Map(stagedFilesById);
        newImages.forEach((img) => newStaged.set(img.id, img._file));
        setStagedFilesById(newStaged);
        updateImages((prev) => {
          const merged = [...prev, ...newImages].map((img, idx) => ({
            ...img,
            sort_order: idx,
          }));
          return merged;
        }, newStaged);
        showToast({ message: 'تم تجهيز الصور للرفع عند حفظ المنتج', type: 'info' });
        return;
      }

      // EDIT MODE — go through the upload pipeline.
      try {
        await upload(accepted);
      } catch {
        // Toast already surfaced by onError handler.
      }
    },
    [images.length, isEditMode, maxImages, showToast, stagedFilesById, updateImages, upload],
  );

  // ── Drop zone handlers ───────────────────────────────────────────────
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setDropOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setDropOver(false);
  }, []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setDropOver(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) handleAcceptedFiles(files);
    },
    [handleAcceptedFiles],
  );

  // ── Reorder (DnD) ────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortableIds = useMemo(() => images.map((i) => i.id), [images]);

  // DnD live-region announcements — keyed on `images` so they can resolve
  // each id to its current 1-based position. Module-scope is impossible
  // here (no access to `images`), which is why QA saw raw IDs in the prior
  // build.
  const dndAnnouncements = useMemo(() => {
    const positionOf = (id) =>
      images.findIndex((img) => String(img.id) === String(id)) + 1;
    return {
      onDragStart: ({ active }) =>
        `تم التقاط الصورة في الموضع ${positionOf(active.id)} من ${images.length}.`,
      onDragOver: ({ active, over }) =>
        over
          ? `الصورة من الموضع ${positionOf(active.id)} فوق الموضع ${positionOf(over.id)}.`
          : `الصورة لم تعد فوق منطقة قابلة للإفلات.`,
      onDragEnd: ({ over }) =>
        over
          ? `تم إفلات الصورة في الموضع ${positionOf(over.id)} من ${images.length}.`
          : `تم إفلات الصورة.`,
      onDragCancel: () => `تم إلغاء عملية إعادة الترتيب.`,
    };
  }, [images]);

  const scheduleReorder = useCallback(
    (orderedIds) => {
      if (!isEditMode) return;
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
      reorderTimerRef.current = setTimeout(() => {
        productImagesApi.reorder(productId, orderedIds).catch((err) => {
          showToast({
            message: err?.body?.message || 'فشل حفظ الترتيب',
            type: 'error',
          });
        });
      }, REORDER_DEBOUNCE_MS);
    },
    [isEditMode, productId, showToast],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const reordered = arrayMove(images, oldIndex, newIndex).map(
        (img, idx) => ({ ...img, sort_order: idx }),
      );
      // Parent notification flows through the emit-effect; we just commit
      // the new list and (in edit mode) schedule the API reorder.
      updateImages(reordered);
      scheduleReorder(reordered.map((i) => i.id));
    },
    [images, scheduleReorder, updateImages],
  );

  // ── Per-image mutations ──────────────────────────────────────────────
  const handleRoleChange = useCallback(
    async (imageId, nextRole) => {
      if (!isEditMode) {
        // Local-only role update in create mode (cover coordination still done via Set Cover).
        updateImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, image_role: nextRole } : img,
          ),
        );
        return;
      }
      // Optimistic update.
      const prevSnapshot = images;
      updateImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, image_role: nextRole } : img,
        ),
      );
      try {
        const updated = await productImagesApi.patch(productId, imageId, {
          image_role: nextRole,
        });
        // If switching to cover, the backend demotes the previous cover; refresh
        // by trusting the server response if it returns the full list, otherwise
        // patch a single row.
        if (Array.isArray(updated)) {
          updateImages(updated);
        } else if (updated && updated.id) {
          updateImages((prev) =>
            prev.map((img) => (img.id === updated.id ? updated : img)),
          );
        }
      } catch (err) {
        updateImages(prevSnapshot);
        showToast({
          message: err?.body?.message || 'تعذّر تحديث نوع الصورة',
          type: 'error',
        });
      }
    },
    [images, isEditMode, productId, showToast, updateImages],
  );

  const handleAltCommit = useCallback(
    async (imageId, patch) => {
      if (!isEditMode) {
        updateImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, ...patch } : img)),
        );
        return;
      }
      const prevSnapshot = images;
      updateImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, ...patch } : img)),
      );
      try {
        const updated = await productImagesApi.patch(productId, imageId, patch);
        if (updated && updated.id) {
          updateImages((prev) =>
            prev.map((img) => (img.id === updated.id ? updated : img)),
          );
        }
      } catch (err) {
        updateImages(prevSnapshot);
        showToast({
          message: err?.body?.message || 'تعذّر حفظ النص البديل',
          type: 'error',
        });
      }
    },
    [images, isEditMode, productId, showToast, updateImages],
  );

  const handleSetCover = useCallback(
    async (imageId) => {
      if (!isEditMode) {
        updateImages((prev) =>
          prev.map((img) => ({
            ...img,
            image_role:
              img.id === imageId
                ? 'cover'
                : img.image_role === 'cover'
                ? 'gallery'
                : img.image_role,
          })),
        );
        showToast({ message: 'تم تعيين الصورة كرئيسية', type: 'success' });
        return;
      }
      try {
        const result = await productImagesApi.setCover(productId, imageId);
        if (Array.isArray(result)) {
          updateImages(result);
        } else {
          updateImages((prev) =>
            prev.map((img) => ({
              ...img,
              image_role:
                img.id === imageId
                  ? 'cover'
                  : img.image_role === 'cover'
                  ? 'gallery'
                  : img.image_role,
            })),
          );
        }
        showToast({ message: 'تم تعيين الصورة كرئيسية', type: 'success' });
      } catch (err) {
        showToast({
          message: err?.body?.message || 'تعذّر تعيين الصورة الرئيسية',
          type: 'error',
        });
      }
    },
    [isEditMode, productId, showToast, updateImages],
  );

  const handleDelete = useCallback(
    async (imageId) => {
      if (images.length <= 1) return; // guard: cannot delete only image
      const prevSnapshot = images;
      const prevCoverId = findCoverId(prevSnapshot);

      if (!isEditMode) {
        const newStaged = new Map(stagedFilesById);
        newStaged.delete(imageId);
        const removed = prevSnapshot.find((i) => i.id === imageId);
        if (removed && isAbsoluteOrBlob(removed.url) && removed.url.startsWith('blob:')) {
          try { URL.revokeObjectURL(removed.url); } catch { /* noop */ }
        }
        const next = prevSnapshot
          .filter((i) => i.id !== imageId)
          .map((img, idx) => ({ ...img, sort_order: idx }));
        // If the deleted image was the cover, auto-promote the new first image.
        if (removed && removed.image_role === 'cover' && next[0]) {
          next[0] = { ...next[0], image_role: 'cover' };
        }
        const nextCoverId = findCoverId(next);
        setStagedFilesById(newStaged);
        updateImages(next, newStaged);
        showToast({ message: 'تم حذف الصورة', type: 'success' });
        if (prevCoverId !== nextCoverId && nextCoverId != null) {
          const newCover = next.find((i) => i.id === nextCoverId);
          const label = newCover?.alt_text_ar || 'الصورة التالية';
          showToast({
            message: `تم تعيين [${label}] كصورة رئيسية تلقائياً`,
            type: 'info',
          });
        }
        return;
      }

      // EDIT MODE — call API, then reconcile.
      // Optimistic removal.
      updateImages(prevSnapshot.filter((i) => i.id !== imageId));
      try {
        const result = await productImagesApi.deleteImage(productId, imageId);
        const next = Array.isArray(result)
          ? result
          : prevSnapshot.filter((i) => i.id !== imageId);
        updateImages(next);
        const nextCoverId = findCoverId(next);
        showToast({ message: 'تم حذف الصورة', type: 'success' });
        if (prevCoverId !== nextCoverId && nextCoverId != null) {
          const newCover = next.find((i) => i.id === nextCoverId);
          const label = newCover?.alt_text_ar || 'الصورة التالية';
          showToast({
            message: `تم تعيين [${label}] كصورة رئيسية تلقائياً`,
            type: 'info',
          });
        }
      } catch (err) {
        // Restore on failure.
        updateImages(prevSnapshot);
        showToast({
          message: err?.body?.message || 'فشل حذف الصورة',
          type: 'error',
        });
      }
    },
    [images, isEditMode, productId, showToast, stagedFilesById, updateImages],
  );

  const handleRetryEmbedding = useCallback(() => {
    // TODO: backend retry endpoint not implemented yet (spec §6.1).
    // Intentional no-op for now.
  }, []);

  // ── Derived render values ────────────────────────────────────────────
  const remaining = Math.max(0, maxImages - images.length);
  const dropDisabled = images.length >= maxImages;
  const coverId = findCoverId(images);
  const canDelete = images.length > 1;
  const uploadEntries = useMemo(() => Object.entries(uploads), [uploads]);

  // Cleanup blob URLs on unmount (create mode safety net).
  // We read the latest images list via a ref so the cleanup effect itself can
  // depend on `[]` without lint complaining.
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(
    () => () => {
      imagesRef.current.forEach((img) => {
        if (typeof img.url === 'string' && img.url.startsWith('blob:')) {
          try { URL.revokeObjectURL(img.url); } catch { /* noop */ }
        }
      });
    },
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <section className={styles.root} aria-label="إدارة صور المنتج">
      <div className={styles.headerStrip}>
        <h3 className={styles.headerTitle}>صور المنتج</h3>
        <span
          className={[
            styles.headerCount,
            dropDisabled ? styles.headerCountFull : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-live="polite"
        >
          {images.length} / {maxImages}
        </span>
      </div>

      <DropZone
        disabled={dropDisabled || isLoading}
        isOver={dropOver}
        inputId={dropZoneInputId}
        onPickFiles={handleAcceptedFiles}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        remaining={remaining}
        maxImages={maxImages}
      />

      {uploadEntries.length > 0 ? (
        <div className={styles.uploadList} aria-label="تقدم الرفع">
          {uploadEntries.map(([tempId, info]) => {
            const isError = info.status === 'error';
            const isDone = info.status === 'done';
            const isUploading = info.status === 'uploading';
            return (
              <div key={tempId} className={styles.uploadRow}>
                <div className={styles.uploadName} title={info.fileName}>
                  {info.fileName}
                  {info.error ? ` — ${info.error}` : ''}
                  {info.status === 'cancelled' ? ' — تم الإلغاء' : ''}
                </div>
                {isUploading ? (
                  <button
                    type="button"
                    className={styles.uploadCancel}
                    onClick={() => cancelUpload(tempId)}
                    aria-label={`إلغاء رفع ${info.fileName}`}
                  >
                    <X size={14} strokeWidth={2} aria-hidden />
                  </button>
                ) : (
                  <span
                    className={[
                      styles.uploadStatus,
                      isError ? styles.uploadStatusError : '',
                      isDone ? styles.uploadStatusDone : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isDone ? 'تم' : isError ? 'فشل' : `${info.progress}%`}
                  </span>
                )}
                <div className={styles.uploadBar} aria-hidden>
                  <div
                    className={[
                      styles.uploadBarFill,
                      isError ? styles.uploadBarError : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ inlineSize: `${info.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {isLoading ? (
        <SkeletonGrid />
      ) : images.length === 0 ? (
        <div className={styles.empty}>
          <ImageIcon size={28} strokeWidth={1.5} aria-hidden />
          <div className={styles.emptyTitle}>لا توجد صور بعد</div>
          <div className={styles.emptyMeta}>
            ابدأ برفع صورة واحدة على الأقل — ستصبح تلقائياً الصورة الرئيسية للمنتج.
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements: dndAnnouncements,
            screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS,
          }}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className={`${styles.grid} ${styles.fadeIn}`}>
              {images.map((img, idx) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  index={idx}
                  isCover={img.id === coverId}
                  canDelete={canDelete}
                  showEmbedding={isEditMode}
                  onRoleChange={handleRoleChange}
                  onAltCommit={handleAltCommit}
                  onSetCover={handleSetCover}
                  onDelete={handleDelete}
                  onRetryEmbedding={handleRetryEmbedding}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Hidden helper text re: dev-only file size info — read by screen readers if focused. */}
      <p className="visually-hidden">
        يدعم النظام رفع الصور بصيغة JPEG و PNG و WebP بحجم أقصى ٥ ميغابايت لكل ملف،
        وحتى {maxImages} صور لكل منتج. حجم الملف الأقصى: {bytesLabel(MAX_FILE_SIZE)}.
      </p>
    </section>
  );
}
