import React, { useCallback } from 'react';
import { Star, ImageIcon } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import styles from './ResultCard.module.css';

function ResultCardImpl({ result, onProductClick }) {
  const { product, matched_image_url, similarity_score, rank } = result;

  const showBadge = Number.isFinite(similarity_score) && similarity_score >= 0.5;
  const percent = showBadge ? Math.round(similarity_score * 100) : null;

  const matchedSrc = resolveImageUrl(matched_image_url);
  const thumbSrc = resolveImageUrl(product?.thumbnail_url);
  const imgSrc = matchedSrc ?? thumbSrc;

  const handleClick = useCallback(() => {
    onProductClick(product, rank, similarity_score);
  }, [onProductClick, product, rank, similarity_score]);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={handleClick}
      aria-label={`عرض المنتج: ${product?.name ?? ''}`}
    >
      <div className={styles.imageArea}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product?.name ?? ''}
            className={styles.productImage}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <ImageIcon size={48} />
          </div>
        )}
        {showBadge ? (
          <span
            className={styles.similarityBadge}
            aria-label={`نسبة التطابق ${percent} بالمئة`}
          >
            <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            <span aria-hidden="true">{percent}% تطابق</span>
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        {product?.category?.name ? (
          <p className={styles.category}>{product.category.name}</p>
        ) : null}
        <h3 className={styles.name}>{product?.name}</h3>
        <p className={styles.price}>{product?.price} ر.س</p>
      </div>
    </button>
  );
}

function arePropsEqual(prev, next) {
  return (
    prev.result.product.id === next.result.product.id &&
    prev.result.matched_image_url === next.result.matched_image_url &&
    prev.result.similarity_score === next.result.similarity_score &&
    prev.result.rank === next.result.rank &&
    prev.onProductClick === next.onProductClick
  );
}

export const ResultCard = React.memo(ResultCardImpl, arePropsEqual);
export default ResultCard;
