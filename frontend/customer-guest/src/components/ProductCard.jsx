import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './Badge.jsx';
import { StarRating } from './StarRating.jsx';
import styles from './ProductCard.module.css';

function getBadgeVariant(badgeText) {
  if (!badgeText) return 'primary';
  if (badgeText.includes('خصم')) return 'sale';
  if (badgeText.includes('جديد')) return 'new';
  return 'primary';
}

export function ProductCard({ product, onNavigate }) {
  const { id, name, cat, category, price, oldPrice, originalPrice, rating, reviews, badge, image } = product;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <article
      className={styles.card}
      onClick={() => onNavigate?.(id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' ? onNavigate?.(id) : null}
      role="button"
      aria-label={name}
    >
      <div className={styles.imageArea}>
        {image && !imageError ? (
          <img 
            src={image} 
            alt={name} 
            className={styles.productImage}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error('Image failed to load:', image);
              setImageError(true);
            }}
          />
        ) : null}
        <ImageIcon size={48} className={`${styles.imagePlaceholder} ${imageLoaded ? styles.hidden : ''}`} />
        {badge ? (
          <div className={styles.badgeOverlay}>
            <Badge text={badge} variant={getBadgeVariant(badge)} />
          </div>
        ) : null}
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{cat || category}</p>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.stars}>
          <StarRating rating={rating} reviewCount={reviews} size="sm" />
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{price} $</span>
            {oldPrice || originalPrice ? (
              <span className={styles.oldPrice}>{oldPrice || originalPrice} $</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
