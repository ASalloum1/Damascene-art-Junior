import styles from './TrackingStep.module.css';

export function TrackingStep({ label, date, stepNumber, status = 'pending', isLast = false }) {
  return (
    <div className={styles.container}>
      {/* Left column: circle + line */}
      <div className={styles.leftCol}>
        <div className={`${styles.circle} ${styles[status]}`}>
          {status === 'done' ? '✓' : stepNumber}
        </div>
        {!isLast && (
          <div className={`${styles.line} ${status === 'done' ? styles.lineDone : ''}`} />
        )}
      </div>

      {/* Right column: text */}
      <div className={styles.rightCol}>
        <p className={`${styles.label} ${styles[`label_${status}`]}`}>{label}</p>
        {date && <p className={styles.date}>{date}</p>}
      </div>
    </div>
  );
}

export default TrackingStep;
