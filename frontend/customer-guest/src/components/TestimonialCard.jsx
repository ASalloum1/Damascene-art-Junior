import { StarRating } from './StarRating.jsx';
import styles from './TestimonialCard.module.css';

export function TestimonialCard({ name, text, rating, location }) {
  return (
    <article className={styles.card}>
      <div className={styles.stars}>
        <StarRating rating={rating} size="sm" />
      </div>

      <p className={styles.text}>"{text}"</p>

      <footer className={styles.footer}>
        <p className={styles.name}>{name}</p>
        {location && <p className={styles.location}>{location}</p>}
      </footer>
    </article>
  );
}

export default TestimonialCard;
