import styles from './MiniBar.module.css';

/**
 * MiniBar — small horizontal progress bar
 *
 * @param {number} percentage — 0 to 100
 * @param {string} [color] — hex color (defaults to var(--color-gold))
 * @param {string} [label] — label displayed inline-start
 * @param {string} [value] — value displayed inline-end
 * @param {number} [height=8] — bar height in px
 */
export default function MiniBar({
  percentage = 0,
  color,
  label,
  value,
  height = 8,
}) {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className={styles.container}>
      {(label || value) && (
        <div className={styles.labels}>
          {label && <span className={styles.label}>{label}</span>}
          {value && <span className={styles.value}>{value}</span>}
        </div>
      )}
      <div
        className={styles.track}
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={clampedPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.fill}
          style={{
            width: `${clampedPct}%`,
            backgroundColor: color || 'var(--color-gold)',
          }}
        />
      </div>
    </div>
  );
}
