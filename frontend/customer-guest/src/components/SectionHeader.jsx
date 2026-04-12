import { Diamond } from 'lucide-react';
import styles from './SectionHeader.module.css';

export function SectionHeader({ title, subtitle, light = false, align = 'center' }) {
  return (
    <div
      className={`${styles.container} ${styles[align]} ${light ? styles.light : ''}`}
    >
      <div className={styles.ornament}>
        <Diamond size={8} />
        <Diamond size={8} />
        <Diamond size={8} />
      </div>

      <h2 className={styles.title}>{title}</h2>

      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeader;
