import styles from './Button.module.css';

export function Button({
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
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </button>
  );
}

export default Button;
