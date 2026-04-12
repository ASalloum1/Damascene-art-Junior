import { ChevronLeft } from 'lucide-react';
import styles from './Breadcrumb.module.css';

export function Breadcrumb({ items = [], onNavigate }) {
  return (
    <nav aria-label="مسار التنقل" className={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.pageId ?? item.label} className={styles.item}>
            {!isLast ? (
              <button
                type="button"
                className={styles.link}
                onClick={() => onNavigate?.(item.pageId)}
              >
                {item.label}
              </button>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}

            {!isLast ? (
              <ChevronLeft size={12} className={styles.separator} />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
