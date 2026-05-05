import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { useVisualSearch } from '../hooks/useVisualSearch.js';
import ImageDropZone from '../components/visualSearch/ImageDropZone.jsx';
import QueryImagePreview from '../components/visualSearch/QueryImagePreview.jsx';
import ResultsGrid from '../components/visualSearch/ResultsGrid.jsx';
import styles from './VisualSearchPage.module.css';

const TOAST_DURATION_MS = 2500;

export default function VisualSearchPage({ onNavigate }) {
  const { setSelectedProductId } = useApi();

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleCancelToast = useCallback(() => {
    showToast('تم إلغاء البحث');
  }, [showToast]);

  const {
    file,
    previewUrl,
    status,
    results,
    pagination,
    errorMessage,
    search,
    goToPage,
    reset,
    cancel,
    logClick,
  } = useVisualSearch({ onCancel: handleCancelToast });

  const handleFileSelected = useCallback(
    (newFile) => {
      search(newFile);
    },
    [search]
  );

  // The hook's internal search() already aborts the prior in-flight
  // controller (see useVisualSearch.js:114-116), so no explicit cancel
  // here. Calling cancel() first would flicker through 'idle' and
  // wrongly fire the toast.
  const handleNewFileDuringSearch = useCallback(
    (newFile) => {
      search(newFile);
    },
    [search]
  );

  const handlePageChange = useCallback(
    (page) => {
      goToPage(page);
    },
    [goToPage]
  );

  const handleProductClick = useCallback(
    (product, position, score) => {
      logClick(product, position, score);
      setSelectedProductId(product.id);
      onNavigate?.('product');
    },
    [logClick, setSelectedProductId, onNavigate]
  );

  const handleRetry = useCallback(() => {
    if (file) {
      search(file);
    } else {
      reset();
    }
  }, [file, search, reset]);

  const handleTextSearchFallback = useCallback(() => {
    onNavigate?.('search');
  }, [onNavigate]);

  // × button handler. The split: cancel() during searching (fires the
  // toast via onCancel); reset() everywhere else (no toast, no abort to
  // perform). Calling cancel() outside 'searching' would surface a
  // misleading "تم إلغاء البحث" with nothing actually canceling.
  const handleResetFromPreview = useCallback(() => {
    if (status === 'searching') {
      cancel();
    } else {
      reset();
    }
  }, [status, cancel, reset]);

  const handleBack = useCallback(() => {
    onNavigate?.('home');
  }, [onNavigate]);

  const columnsClassName =
    status === 'idle'
      ? styles.columns
      : `${styles.columns} ${styles.columnsWithResults}`;

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backLink}
            onClick={handleBack}
          >
            <ArrowRight size={16} aria-hidden="true" />
            <span>العودة</span>
          </button>
          <h1 className={styles.title}>البحث بالصورة</h1>
        </header>

        <div className={columnsClassName}>
          <section
            className={styles.previewColumn}
            aria-label="منطقة الصورة المرفوعة"
          >
            {status === 'idle' ? (
              <ImageDropZone onFileSelected={handleFileSelected} />
            ) : (
              <QueryImagePreview
                previewUrl={previewUrl}
                isSearching={status === 'searching'}
                onFileSelected={handleNewFileDuringSearch}
                onReset={handleResetFromPreview}
              />
            )}
          </section>

          {status !== 'idle' ? (
            <section className={styles.resultsColumn}>
              <ResultsGrid
                status={status}
                results={results}
                pagination={pagination}
                errorMessage={errorMessage}
                onProductClick={handleProductClick}
                onPageChange={handlePageChange}
                onRetry={handleRetry}
                onTextSearchFallback={handleTextSearchFallback}
              />
            </section>
          ) : null}
        </div>
      </div>

      {toastMessage ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}
