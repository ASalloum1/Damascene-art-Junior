import { useState, useEffect } from 'react';

/**
 * Debounced search hook
 * @param {string} initialValue — initial search value
 * @param {number} debounceMs — debounce delay in ms (default 300)
 * @returns {{ searchValue, setSearchValue, debouncedValue }}
 */
export function useSearch(initialValue = '', debounceMs = 300) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue, debounceMs]);

  return {
    searchValue,
    setSearchValue,
    debouncedValue,
  };
}
