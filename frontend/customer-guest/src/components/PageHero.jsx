import styles from './PageHero.module.css';

export function PageHero({ title, subtitle, icon: Icon }) {
  return (
    <div className={styles.container}>
      {Icon ? (
        <div className={styles.iconWrapper}>
          <Icon size={48} color="var(--color-gold)" />
        </div>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}

export default PageHero;
