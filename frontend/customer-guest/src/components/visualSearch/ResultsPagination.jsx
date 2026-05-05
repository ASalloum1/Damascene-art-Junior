import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ResultsPagination.module.css';

function buildPageStrip(page, totalPages) {
  if (totalPages <= 1) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([
    1,
    totalPages,
    page,
    page - 1,
    page + 1,
    page - 2,
    page + 2,
  ]);
  const filtered = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < filtered.length; i++) {
    out.push(filtered[i]);
    if (i < filtered.length - 1 && filtered[i + 1] - filtered[i] > 1) {
      out.push('ellipsis');
    }
  }
  return out;
}

export function ResultsPagination({ page, totalPages, onPageChange }) {
  const strip = useMemo(() => buildPageStrip(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="تصفح صفحات النتائج">
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      {strip.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ell-${i}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={
              p === page
                ? `${styles.pageBtn} ${styles.pageBtnActive}`
                : styles.pageBtn
            }
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`الصفحة ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default ResultsPagination;
