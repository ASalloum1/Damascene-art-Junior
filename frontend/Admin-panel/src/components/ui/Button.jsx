import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

/**
 * Button — primary UI action component
 *
 * @param {'primary'|'outline'|'danger'|'ghost'|'success'} variant
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {React.ComponentType} [icon] — lucide icon component
 * @param {'start'|'end'} [iconPosition='start']
 * @param {boolean} [loading=false]
 * @param {boolean} [disabled=false]
 * @param {boolean} [fullWidth=false]
 * @param {'button'|'submit'|'reset'} [type='button']
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classNames = [
    styles.btn,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  const iconEl = loading ? (
    <Loader2 size={16} strokeWidth={1.8} className={styles.spinner} />
  ) : Icon ? (
    <Icon size={16} strokeWidth={1.8} className={styles.icon} />
  ) : null;

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {iconPosition === 'start' && iconEl}
      {children && <span className={styles.label}>{children}</span>}
      {iconPosition === 'end' && iconEl}
    </button>
  );
}
