import styles from './Timeline.module.css';

/**
 * Timeline — vertical timeline for order status history, activity steps
 *
 * @param {Array<{label, date?, done, active, description?}>} steps
 */
export default function Timeline({ steps = [] }) {
  return (
    <ol className={styles.timeline} aria-label="المراحل الزمنية">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const statusClass = step.done
          ? styles.done
          : step.active
          ? styles.active
          : styles.pending;

        return (
          <li key={index} className={[styles.step, statusClass].join(' ')} style={{ '--index': index }}>
            {/* Connector line (not on last item) */}
            {!isLast ? <div className={styles.connector} /> : null}

            {/* Dot */}
            <div className={styles.dot} aria-hidden="true">
              {step.active ? <div className={styles.pulse} /> : null}
            </div>

            {/* Content */}
            <div className={styles.content}>
              <span className={styles.label}>{step.label}</span>
              {step.description ? (
                <span className={styles.description}>{step.description}</span>
              ) : null}
              {step.date ? (
                <span className={styles.date}>{step.date}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
