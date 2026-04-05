import Button from './Button.jsx';
import styles from './EmptyState.module.css';

/**
 * EmptyState — shown when tables/lists have no data
 *
 * @param {React.ComponentType} icon — lucide icon component
 * @param {string} title — Arabic title e.g. "لا توجد بيانات"
 * @param {string} [description] — Arabic subtitle
 * @param {string} [actionLabel] — button label
 * @param {function} [onAction] — button click handler
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.container}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon size={64} strokeWidth={1.2} className={styles.icon} />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
