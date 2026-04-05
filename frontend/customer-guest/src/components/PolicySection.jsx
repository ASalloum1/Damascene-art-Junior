import styles from './PolicySection.module.css';

export function PolicySection({ icon: Icon, title, description }) {
  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        {Icon && <Icon size={20} className={styles.icon} />}
        <h3 className={styles.title}>{title}</h3>
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default PolicySection;
