/**
 * NOTE: Deliberate deviation from visual-search-FRONTEND-spec-v2.md §7.1.
 * The spec calls for Camera icon on both buttons; we use Upload for the
 * file picker and Camera only for capture. Cleaner differentiation,
 * approved during planning.
 */
import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import styles from './ImageDropZone.module.css';

export function ImageDropZone({ onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const openFilePicker = () => fileInputRef.current?.click();
  const openCameraPicker = () => cameraInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    const firstImage = files.find((f) => f.type.startsWith('image/'));
    if (firstImage) onFileSelected(firstImage);
  };

  const handleCameraClick = (e) => {
    e.stopPropagation();
    openCameraPicker();
  };

  const dropZoneClass = isDragging
    ? `${styles.dropZone} ${styles.dropZoneDragging}`
    : styles.dropZone;

  return (
    <button
      type="button"
      className={dropZoneClass}
      onClick={openFilePicker}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="منطقة رفع الصورة. اضغط لاختيار صورة أو اسحب صورة من جهازك"
    >
      <Camera size={64} className={styles.icon} aria-hidden="true" />
      <p className={styles.helper}>اسحب صورة هنا أو انقر للاختيار</p>
      <p className={styles.subHelper}>JPEG, PNG, WebP — حتى 10 ميجابايت</p>
      <p className={styles.hint}>يبحث النظام عن منتجات شبيهة في كتالوجنا</p>

      <div className={styles.buttonRow}>
        <span className={styles.pseudoBtnPrimary} role="presentation">
          <Upload size={18} aria-hidden="true" />
          <span>اختيار من الجهاز</span>
        </span>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>أو</span>
          <span className={styles.dividerLine} />
        </div>

        <span
          className={styles.pseudoBtnOutline}
          role="presentation"
          onClick={handleCameraClick}
          title="التقاط صورة بالكاميرا"
        >
          <Camera size={18} aria-hidden="true" />
          <span>التقاط صورة بالكاميرا</span>
        </span>
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
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </button>
  );
}

export default ImageDropZone;
