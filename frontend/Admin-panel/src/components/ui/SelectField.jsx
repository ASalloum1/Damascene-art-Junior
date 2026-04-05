import { ChevronDown } from 'lucide-react';
import styles from './SelectField.module.css';

/**
 * SelectField — native select with styled wrapper
 *
 * @param {string} label — Arabic label
 * @param {Array<{value, label}>} options
 * @param {string} value — controlled value
 * @param {function} onChange
 * @param {string} [placeholder] — default empty option text
 * @param {string} [error]
 * @param {boolean} [required=false]
 * @param {boolean} [disabled=false]
 */
export default function SelectField({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  id,
  name,
}) {
  const selectId = id || `select-${label?.replace(/\s/g, '-') || Math.random()}`;

  return (
    <div className={styles.fieldGroup}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className={[styles.select, error ? styles.selectError : '']
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={styles.chevron}
          aria-hidden="true"
        />
      </div>
      {error && (
        <span className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
