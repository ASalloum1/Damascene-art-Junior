import { Package, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { toArabicNum } from '../../utils/formatters.js';
import styles from './DataTable.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * DataTable — sortable, selectable, paginated data table
 *
 * @param {Array<{key, label, sortable?, render?}>} headers — column definitions
 * @param {Array<object>} rows — data rows
 * @param {function} [onSort] — (key, direction) callback
 * @param {string} [sortKey] — currently sorted column
 * @param {'asc'|'desc'} [sortDirection]
 * @param {boolean} [loading=false] — show skeleton rows
 * @param {ReactNode} [emptyState] — custom empty state
 * @param {boolean} [selectable=false] — show checkbox column
 * @param {Array<string>} [selected=[]] — selected row IDs
 * @param {function} [onSelectChange] — (selectedIds) callback
 * @param {{ page, pageSize, total, onPageChange, onPageSizeChange }?} pagination
 */
export default function DataTable({
  headers = [],
  rows = [],
  onSort,
  sortKey,
  sortDirection = 'asc',
  loading = false,
  emptyState,
  selectable = false,
  selected = [],
  onSelectChange,
  pagination,
}) {
  const selectedSet = new Set(selected);

  const allPageSelected =
    rows.length > 0 ? rows.every((r) => selectedSet.has(r.id)) : false;
  const someSelected = rows.some((r) => selectedSet.has(r.id));

  function handleSelectAll(e) {
    if (!onSelectChange) return;
    if (e.target.checked) {
      const ids = rows.map((r) => r.id);
      onSelectChange([...new Set([...selected, ...ids])]);
    } else {
      const ids = new Set(rows.map((r) => r.id));
      onSelectChange(selected.filter((id) => !ids.has(id)));
    }
  }

  function handleSelectRow(id, checked) {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange([...selected, id]);
    } else {
      onSelectChange(selected.filter((s) => s !== id));
    }
  }

  function handleSort(key) {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  }

  function getSortIcon(key) {
    if (sortKey !== key) return <ChevronsUpDown size={14} strokeWidth={1.8} className={styles.sortIcon} />;
    if (sortDirection === 'asc') return <ChevronUp size={14} strokeWidth={1.8} className={styles.sortIconActive} />;
    return <ChevronDown size={14} strokeWidth={1.8} className={styles.sortIconActive} />;
  }

  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {selectable ? (
                <th className={[styles.th, styles.checkboxTh].join(' ')}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = someSelected ? !allPageSelected : false;
                      }
                    }}
                    onChange={handleSelectAll}
                    aria-label="تحديد الكل"
                  />
                </th>
              ) : null}
              {headers.map((col) => (
                <th
                  key={col.key}
                  className={[
                    styles.th,
                    col.sortable ? styles.sortable : '',
                    sortKey === col.key ? styles.sorted : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className={styles.thContent}>
                    {col.label}
                    {col.sortable ? getSortIcon(col.key) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              skeletonRows.map((i) => (
                <tr key={i} className={styles.tr}>
                  {selectable ? (
                    <td className={styles.td}>
                      <div className={`${styles.skeletonCell} skeleton-shimmer`} style={{ width: '16px', height: '16px' }} />
                    </td>
                  ) : null}
                  {headers.map((col) => (
                    <td key={col.key} className={styles.td}>
                      <div
                        className={`${styles.skeletonCell} skeleton-shimmer`}
                        style={{ width: `${60 + ((i * 17 + headers.indexOf(col) * 31) % 40)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + (selectable ? 1 : 0)}
                  className={styles.emptyTd}
                >
                  {emptyState || (
                    <EmptyState
                      icon={Package}
                      title="لا توجد بيانات"
                      description="لا توجد نتائج تطابق معايير البحث أو التصفية."
                    />
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const isSelected = selectedSet.has(row.id);
                return (
                  <tr
                    key={row.id || rowIndex}
                    className={[
                      styles.tr,
                      rowIndex % 2 === 1 ? styles.altRow : '',
                      isSelected ? styles.selectedRow : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {selectable ? (
                      <td className={styles.td}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          aria-label={`تحديد الصف ${toArabicNum(rowIndex + 1)}`}
                        />
                      </td>
                    ) : null}
                    {headers.map((col) => (
                      <td key={col.key} className={styles.td}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination ? (
        <div className={styles.paginationBar}>
          <div className={styles.paginationInfo}>
            <span className={styles.infoText}>
              عرض{' '}
              <strong>{toArabicNum(
                Math.min(
                  (pagination.page - 1) * pagination.pageSize + 1,
                  pagination.total
                )
              )}</strong>{' '}
              —{' '}
              <strong>{toArabicNum(
                Math.min(pagination.page * pagination.pageSize, pagination.total)
              )}</strong>{' '}
              من{' '}
              <strong>{toArabicNum(pagination.total)}</strong>
            </span>
          </div>

          <div className={styles.paginationControls}>
            <span className={styles.pageSizeLabel}>صفوف في الصفحة:</span>
            <select
              className={styles.pageSizeSelect}
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
              aria-label="عدد الصفوف في الصفحة"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {toArabicNum(size)}
                </option>
              ))}
            </select>

            <div className={styles.pageButtons}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => pagination.onPageChange?.(1)}
                disabled={pagination.page <= 1}
                aria-label="الصفحة الأولى"
              >
                ««
              </button>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => pagination.onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="الصفحة السابقة"
              >
                ‹
              </button>
              <span className={styles.pageIndicator}>
                {toArabicNum(pagination.page)} / {toArabicNum(Math.ceil(pagination.total / pagination.pageSize) || 1)}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => pagination.onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                aria-label="الصفحة التالية"
              >
                ›
              </button>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => pagination.onPageChange?.(Math.ceil(pagination.total / pagination.pageSize))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                aria-label="الصفحة الأخيرة"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
