import { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '../Button.jsx';
import styles from './QueryImagePreview.module.css';

export function QueryImagePreview({
  previewUrl,
  isSearching,
  onFileSelected,
  onReset,
}) {
  const fileInputRef = useRef(null);
  const [imageBroken, setImageBroken] = useState(false);

  // Reset broken state when previewUrl changes (new file picked)
  useEffect(() => {
    setImageBroken(false);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <section
      className={styles.container}
      aria-busy={isSearching || undefined}
      aria-label="الصورة المرفوعة للبحث"
    >
      <div className={styles.imageWrap}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onReset}
          aria-label="إزالة الصورة والبدء من جديد"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {previewUrl && !imageBroken ? (
          <img
            src={previewUrl}
            alt="الصورة المرفوعة للبحث"
            className={styles.image}
            decoding="async"
            draggable={false}
            onError={() => setImageBroken(true)}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            <ImageIcon size={48} />
          </div>
        )}

        {isSearching ? (
          <div className={styles.busyOverlay} aria-hidden="true">
            <Loader2 size={20} className={styles.spinner} />
          </div>
        ) : null}
      </div>

      <div className={styles.buttonRow}>
        <Button
          variant="primary"
          size="md"
          full
          icon={<Camera size={18} aria-hidden="true" />}
          onClick={openFilePicker}
        >
          بحث بصورة أخرى
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </section>
  );
}

export default QueryImagePreview;
