import Button from './Button.jsx';
import SearchInput from './SearchInput.jsx';
import SelectField from './SelectField.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import { toArabicNum } from '../../utils/formatters.js';
import styles from './FilterBar.module.css';

/**
 * FilterBar — renders an array of filter configurations
 *
 * @param {Array<{type, label, options?, value, onChange, placeholder?}>} filters
 * @param {function} [onReset] — "مسح الفلاتر" button handler
 * @param {number} [activeCount] — number of active filters (shows badge)
 */
export default function FilterBar({ filters = [], onReset, activeCount = 0 }) {
  return (
    <div className={styles.bar}>
      {filters.map((filter, index) => {
        const key = `filter-${index}`;

        if (filter.type === 'search') {
          return (
            <div key={key} className={styles.filterItem}>
              <SearchInput
                placeholder={filter.placeholder || 'بحث...'}
                onSearch={filter.onChange}
                value={filter.value}
              />
            </div>
          );
        }

        if (filter.type === 'select') {
          return (
            <div key={key} className={styles.filterItem}>
              <SelectField
                label={filter.label}
                options={filter.options || []}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={filter.placeholder || 'الكل'}
              />
            </div>
          );
        }

        if (filter.type === 'daterange') {
          return (
            <div key={key} className={[styles.filterItem, styles.wide].join(' ')}>
              <DateRangePicker
                label={filter.label}
                startDate={filter.value?.startDate || ''}
                endDate={filter.value?.endDate || ''}
                onChange={filter.onChange}
              />
            </div>
          );
        }

        return null;
      })}

      {onReset && (
        <div className={styles.resetWrapper}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            مسح الفلاتر
            {activeCount > 0 && (
              <span className={styles.badge}>{toArabicNum(activeCount)}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
