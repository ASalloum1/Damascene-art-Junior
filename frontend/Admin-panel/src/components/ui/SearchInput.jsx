import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchInput.module.css';

/**
 * SearchInput — search field with debounce and clear button
 *
 * @param {string} placeholder — Arabic placeholder
 * @param {function} onSearch — called after debounce with current value
 * @param {number} [debounceMs=300]
 * @param {string} [value] — controlled value (optional)
 * @param {function} [onChange] — controlled change handler (optional)
 */
export default function SearchInput({
  placeholder = 'بحث...',
  onSearch,
  debounceMs = 300,
  value: controlledValue,
  onChange: controlledOnChange,
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const value = isControlled ? controlledValue : internalValue;
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onSearch) onSearch(value);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, debounceMs, onSearch]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (isControlled) {
      if (controlledOnChange) controlledOnChange(newVal);
    } else {
      setInternalValue(newVal);
    }
  };

  const handleClear = () => {
    if (isControlled) {
      if (controlledOnChange) controlledOnChange('');
    } else {
      setInternalValue('');
    }
    if (onSearch) onSearch('');
  };

  return (
    <div className={styles.wrapper}>
      <Search
        size={16}
        strokeWidth={1.8}
        className={styles.searchIcon}
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={styles.input}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearBtn}
          aria-label="مسح البحث"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
