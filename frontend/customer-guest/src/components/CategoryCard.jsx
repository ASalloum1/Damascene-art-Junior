import styles from './CategoryCard.module.css';

export function CategoryCard({ name, icon: Icon, count, onClick }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onClick?.();
    }
  };

  return (
    <article
      className={styles.card}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={name}
    >
      {Icon ? (
        <Icon size={44} className={styles.icon} />
      ) : null}
      <p className={styles.name}>{name}</p>
      <p className={styles.count}>{count} منتج</p>
    </article>
  );
}

export default CategoryCard;
