import styles from './Badge.module.css';

/**
 * Badge — semantic status label
 * variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
 */
export function Badge({ text, variant = 'neutral' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {text}
    </span>
  );
}

export default Badge;
