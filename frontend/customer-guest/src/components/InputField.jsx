import { useId } from 'react';
import styles from './InputField.module.css';

export function InputField({
  label,
  type = 'text',
  placeholder,
  textarea = false,
  rows = 4,
  select = false,
  options = [],
  id,
  name,
  value = '',
  onChange,
  disabled = false,
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;

  return (
    <div className={styles.wrapper}>
      {label ? (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      ) : null}

      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={styles.field}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      ) : select ? (
        <select id={fieldId} name={name} className={`${styles.field} ${styles.select}`} value={value} onChange={onChange} disabled={disabled}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          className={styles.field}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default InputField;
