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
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}

      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={styles.field}
        />
      ) : select ? (
        <select id={fieldId} name={name} className={`${styles.field} ${styles.select}`}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
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
        />
      )}
    </div>
  );
}

export default InputField;
