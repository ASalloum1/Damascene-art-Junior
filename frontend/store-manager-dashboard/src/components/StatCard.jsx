import styles from './StatCard.module.css';
import { Icon } from './SvgIcons';

/**
 * StatCard — summary metric card
 * accentVariant: 'success' | 'warning' | 'error' | 'info' | 'primary'
 */
export function StatCard({ icon: iconName, label, value, accentVariant = 'primary', sub }) {
  return (
    <div className={`${styles.card} ${styles[accentVariant]}`} role="region" aria-label={label}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {iconName ? <Icon name={iconName} size={20} aria-hidden="true" /> : null}
        </div>
        <span className={styles.sub}>{sub}</span>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
export default StatCard;
