import styles from './ActionBtn.module.css';

/**
 * ActionBtn — primary action button
 * variant: 'primary' | 'success' | 'error' | 'info' | 'ghost'
 */
export function ActionBtn({ text, variant = 'primary', onClick, icon, disabled = false, type = 'button', ariaLabel }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || text}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {text}
    </button>
  );
}

export default ActionBtn;
