import { useId } from 'react';
import styles from './InputField.module.css';

/**
 * InputField — labeled text input with error/hint support
 *
 * @param {string} label — Arabic field label
 * @param {string} [type='text'] — input type
 * @param {string} [placeholder] — Arabic placeholder
 * @param {string} value — controlled value
 * @param {function} onChange — change handler
 * @param {string} [error] — Arabic error message
 * @param {boolean} [required=false] — shows asterisk on label
 * @param {boolean} [disabled=false]
 * @param {string} [hint] — optional hint text below input
 * @param {string} [id] — input id (auto-generated if not provided)
 * @param {React.ReactNode} [suffix] — optional element shown inside input on the right (RTL left)
 */
export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  hint,
  id,
  name,
  suffix,
  ...rest
}) {
  const reactId = useId();
  const inputId = id || reactId;

  return (
    <div className={styles.fieldGroup}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={[
            styles.input,
            error ? styles.inputError : '',
            suffix ? styles.hasSuffix : '',
          ].filter(Boolean).join(' ')}
          {...rest}
        />
        {suffix ? <div className={styles.suffix}>{suffix}</div> : null}
      </div>
      {error ? (
        <span id={`${inputId}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      ) : null}
      {hint ? (!error ? (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null) : null}
    </div>
  );
}
