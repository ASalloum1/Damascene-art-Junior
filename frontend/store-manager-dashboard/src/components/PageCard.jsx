import styles from './PageCard.module.css';

/**
 * PageCard — standard content container card
 */
export function PageCard({ children, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {children}
    </div>
  );
}

export default PageCard;
