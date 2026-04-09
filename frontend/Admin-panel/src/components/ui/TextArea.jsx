import { useId } from 'react';
import styles from './TextArea.module.css';
import { toArabicNum } from '../../utils/formatters.js';

/**
 * TextArea — multi-line text input with optional character counter
 *
 * @param {string} label
 * @param {string} [placeholder]
 * @param {number} [rows=4]
 * @param {string} value
 * @param {function} onChange
 * @param {string} [error]
 * @param {boolean} [required=false]
 * @param {number} [maxLength] — shows character counter if provided
 * @param {boolean} [disabled=false]
 */
export default function TextArea({
  label,
  placeholder,
  rows = 4,
  value,
  onChange,
  error,
  required = false,
  maxLength,
  disabled = false,
  id,
  name,
}) {
  const reactId = useId();
  const textareaId = id || reactId;
  const currentLength = value?.length || 0;

  return (
    <div className={styles.fieldGroup}>
      {label ? (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={[styles.textarea, error ? styles.textareaError : '']
          .filter(Boolean)
          .join(' ')}
      />
      <div className={styles.footer}>
        {error ? (
          <span className={styles.errorMsg} role="alert">
            {error}
          </span>
        ) : null}
        {maxLength ? (
          <span
            className={[
              styles.counter,
              currentLength >= maxLength ? styles.counterMax : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {toArabicNum(currentLength)}/{toArabicNum(maxLength)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
