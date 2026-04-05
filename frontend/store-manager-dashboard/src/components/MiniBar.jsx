import styles from './MiniBar.module.css';

/**
 * MiniBar — horizontal progress/fill bar
 */
export function MiniBar({ pct, variant = 'primary' }) {
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`${styles.fill} ${styles[variant]}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default MiniBar;
