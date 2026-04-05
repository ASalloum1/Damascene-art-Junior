import { useState, useCallback, useMemo } from 'react';

/**
 * Multi-filter state management hook
 * @param {object} initialFilters — object of key → defaultValue
 * @returns {{ filters, setFilter, resetFilters, activeFilterCount }}
 */
export function useFilter(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).reduce((count, key) => {
      const current = filters[key];
      const initial = initialFilters[key];
      const isActive =
        current !== initial &&
        current !== '' &&
        current !== null &&
        current !== undefined;
      return isActive ? count + 1 : count;
    }, 0);
  }, [filters, initialFilters]);

  return {
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
  };
}
