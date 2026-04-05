import styles from './Badge.module.css';

export function Badge({ text, variant = 'primary' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {text}
    </span>
  );
}

export default Badge;
