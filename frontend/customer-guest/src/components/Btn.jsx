import styles from './Btn.module.css';

export function Btn({
  variant = 'primary',
  size = 'md',
  icon,
  full = false,
  onClick,
  type = 'button',
  disabled = false,
  ariaLabel,
  children,
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    full ? styles.full : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

export default Btn;
