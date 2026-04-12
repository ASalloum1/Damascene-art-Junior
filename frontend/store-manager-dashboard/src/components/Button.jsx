import styles from './Button.module.css';

/**
 * Button — primary action button
 * variant: 'primary' | 'success' | 'error' | 'info' | 'ghost'
 */
export function Button({ text, variant = 'primary', onClick, icon, disabled = false, type = 'button', ariaLabel }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || text}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {text}
    </button>
  );
}

export default Button;
