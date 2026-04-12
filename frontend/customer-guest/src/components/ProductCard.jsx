import { ImageIcon } from 'lucide-react';
import { Badge } from './Badge.jsx';
import { StarRating } from './StarRating.jsx';
import { Button } from './Button.jsx';
import styles from './ProductCard.module.css';

function getBadgeVariant(badgeText) {
  if (!badgeText) return 'primary';
  if (badgeText.includes('خصم')) return 'sale';
  if (badgeText.includes('جديد')) return 'new';
  return 'primary';
}

export function ProductCard({ product, onNavigate, onAddToCart }) {
  const { id, name, cat, price, oldPrice, rating, reviews, badge } = product;

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
        <ImageIcon size={48} className={styles.imagePlaceholder} />
        {badge ? (
          <div className={styles.badgeOverlay}>
            <Badge text={badge} variant={getBadgeVariant(badge)} />
          </div>
        ) : null}
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{cat}</p>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.stars}>
          <StarRating rating={rating} reviewCount={reviews} size="sm" />
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{price} $</span>
            {oldPrice ? (
              <span className={styles.oldPrice}>{oldPrice} $</span>
            ) : null}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          >
            أضف للسلة
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
