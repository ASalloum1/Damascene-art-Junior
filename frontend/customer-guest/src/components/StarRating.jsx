import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

export function StarRating({ rating, reviewCount, size = 'md' }) {
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <div
      className={`${styles.container} ${styles[size]}`}
      role="img"
      aria-label={`${rating} من ٥ نجوم`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={iconSize}
          fill={i < rating ? 'var(--color-gold)' : 'none'}
          stroke={i < rating ? 'var(--color-gold)' : 'var(--color-stone-light)'}
          strokeWidth={1.5}
        />
      ))}

      {reviewCount !== undefined && (
        <span className={styles.count}>({reviewCount})</span>
      )}
    </div>
  );
}

export default StarRating;
