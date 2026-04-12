import styles from './StatCard.module.css';

/**
 * StatCard — summary metric card
 * accentVariant: 'success' | 'warning' | 'error' | 'info' | 'primary'
 */
export function StatCard({ icon: IconComponent, label, value, accentVariant = 'primary', sub }) {
  return (
    <div className={`${styles.card} ${styles[accentVariant]}`} role="region" aria-label={label}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {IconComponent && <IconComponent size={20} aria-hidden="true" />}
        </div>
        <span className={styles.sub}>{sub}</span>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
export default StatCard;
