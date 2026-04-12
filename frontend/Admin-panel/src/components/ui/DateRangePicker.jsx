import { CalendarRange } from 'lucide-react';
import styles from './DateRangePicker.module.css';

/**
 * DateRangePicker — two native date inputs for date range selection
 *
 * @param {string} startDate — ISO date string or empty
 * @param {string} endDate — ISO date string or empty
 * @param {function} onChange — called with {startDate, endDate}
 * @param {string} [label] — optional label above
 */
export default function DateRangePicker({
  startDate = '',
  endDate = '',
  onChange,
  label,
}) {
  const handleStartChange = (e) => {
    onChange?.({ startDate: e.target.value, endDate });
  };

  const handleEndChange = (e) => {
    onChange?.({ startDate, endDate: e.target.value });
  };

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.inputs}>
        <CalendarRange
          size={16}
          strokeWidth={1.8}
          className={styles.calIcon}
          aria-hidden="true"
        />
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel} htmlFor="date-range-start">من</label>
          <input
            id="date-range-start"
            type="date"
            value={startDate}
            onChange={handleStartChange}
            className={styles.dateInput}
            aria-label="تاريخ البداية"
          />
        </div>
        <span className={styles.separator} aria-hidden="true">—</span>
        <div className={styles.dateGroup}>
          <label className={styles.dateLabel} htmlFor="date-range-end">إلى</label>
          <input
            id="date-range-end"
            type="date"
            value={endDate}
            onChange={handleEndChange}
            min={startDate || undefined}
            className={styles.dateInput}
            aria-label="تاريخ النهاية"
          />
        </div>
      </div>
    </div>
  );
}
