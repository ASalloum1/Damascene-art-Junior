import styles from './Badge.module.css';

/**
 * Badge — colored pill for statuses, roles, categories
 *
 * @param {string} text — display text (Arabic)
 * @param {'success'|'danger'|'warning'|'info'|'default'|'purple'|'gold'} variant
 * @param {string} [color] — custom hex color (overrides variant)
 * @param {string} [bg] — custom background hex with alpha (overrides variant)
 * @param {'sm'|'md'} [size='md']
 */
export default function Badge({
  text,
  variant = 'default',
  color,
  bg,
  size = 'md',
}) {
  const inlineStyle =
    color || bg
      ? {
          color: color || undefined,
          backgroundColor: bg || undefined,
        }
      : undefined;

  return (
    <span
      className={[
        styles.badge,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
      ]
        .filter(Boolean)
        .join(' ')}
      style={inlineStyle}
    >
      {text}
    </span>
  );
}
