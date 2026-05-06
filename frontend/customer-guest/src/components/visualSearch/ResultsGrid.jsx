import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  SearchX,
} from 'lucide-react';
import { Button } from '../Button.jsx';
import { ResultCard } from './ResultCard.jsx';
import { ResultsPagination } from './ResultsPagination.jsx';
import styles from './ResultsGrid.module.css';

const SKELETON_COUNT = 10;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, i) => i);

function SkeletonGrid() {
  return (
    <>
      <p className={styles.statusLine} role="status">
        جاري البحث عن منتجات مشابهة…
      </p>
      <div className={styles.grid}>
        {SKELETON_KEYS.map((i) => (
          <div key={i} className={styles.skeletonCard} aria-hidden="true">
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonLineWide} />
            <div className={styles.skeletonLineNarrow} />
          </div>
        ))}
      </div>
    </>
  );
}

function ResultsView({ results, pagination, onProductClick, onPageChange }) {
  return (
    <>
      <div className={styles.grid}>
        {results.map((result) => (
          <ResultCard
            key={`${result.product.id}-${result.product_image_id}`}
            result={result}
            onProductClick={onProductClick}
          />
        ))}
      </div>
      {pagination ? (
        <ResultsPagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          onPageChange={onPageChange}
        />
      ) : null}
    </>
  );
}

function EmptyState({ onTextSearchFallback }) {
  return (
    <div className={styles.stateCard} role="status">
      <SearchX size={48} className={styles.stateIconMuted} aria-hidden="true" />
      <h2 className={styles.stateHeading}>لم نجد منتجات مطابقة</h2>
      <p className={styles.stateSubtext}>جرّب صورة بزاوية أو إضاءة مختلفة</p>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>أو</span>
        <span className={styles.dividerLine} />
      </div>
      <button
        type="button"
        className={styles.fallbackLink}
        onClick={onTextSearchFallback}
      >
        ابحث عن منتجاتنا بالاسم ←
      </button>
    </div>
  );
}

function ServiceUnavailableState({ message, onRetry, onTextSearchFallback }) {
  return (
    <div className={styles.stateCard} role="alert">
      <AlertTriangle size={64} className={styles.stateIcon} aria-hidden="true" />
      <h2 className={styles.stateHeading}>
        {message || 'خدمة البحث البصري غير متاحة حالياً'}
      </h2>
      <p className={styles.stateSubtext}>حاول مجدداً بعد قليل</p>
      <div className={styles.stateActions}>
        <Button variant="primary" size="md" onClick={onRetry}>
          إعادة المحاولة
        </Button>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>أو</span>
          <span className={styles.dividerLine} />
        </div>
        <button
          type="button"
          className={styles.fallbackLink}
          onClick={onTextSearchFallback}
        >
          ابحث عن منتجاتنا بالاسم ←
        </button>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.stateCard} role="alert">
      <AlertCircle size={64} className={styles.stateIconError} aria-hidden="true" />
      <h2 className={styles.stateHeading}>
        {message || 'حدث خطأ — حاول مجدداً'}
      </h2>
      <div className={styles.stateActions}>
        <Button variant="primary" size="md" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}

function ResultsGridImpl({
  status,
  results,
  pagination,
  errorMessage,
  onProductClick,
  onPageChange,
  onRetry,
  onTextSearchFallback,
}) {
  const gridContainerRef = useRef(null);

  // Scroll-to-top on page change. On mobile (no scroll context on the
  // column itself), also scroll the window so the user lands at the top
  // of the new page.
  useEffect(() => {
    if (status !== 'results') return;
    const node = gridContainerRef.current;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduceMotion ? 'auto' : 'smooth';

    if (node && typeof node.scrollTo === 'function') {
      node.scrollTo({ top: 0, behavior });
    }

    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior });
    }
  }, [pagination?.page, status]);

  function renderBody() {
    if (status === 'searching') return <SkeletonGrid />;
    if (status === 'service_unavailable') {
      return (
        <ServiceUnavailableState
          message={errorMessage}
          onRetry={onRetry}
          onTextSearchFallback={onTextSearchFallback}
        />
      );
    }
    if (status === 'error') {
      return <ErrorState message={errorMessage} onRetry={onRetry} />;
    }
    if (status === 'results' && results.length === 0) {
      return <EmptyState onTextSearchFallback={onTextSearchFallback} />;
    }
    if (status === 'results') {
      return (
        <ResultsView
          results={results}
          pagination={pagination}
          onProductClick={onProductClick}
          onPageChange={onPageChange}
        />
      );
    }
    return null;
  }

  return (
    <section
      ref={gridContainerRef}
      className={styles.column}
      aria-busy={status === 'searching'}
      aria-live="polite"
      aria-label="نتائج البحث البصري"
    >
      {renderBody()}
    </section>
  );
}

export default React.memo(ResultsGridImpl);
