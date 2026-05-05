import styles from './CategoryCard.module.css';

export function CategoryCard({ name, icon: Icon, count, onClick }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onClick?.();
    }
  };

  const countText = typeof count === 'number' && count > 0 ? `${count} منتج` : 'عرض المزيد';

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
      <p className={styles.count}>{countText}</p>
    </article>
  );
}

export default CategoryCard;
