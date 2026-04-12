import styles from './Table.module.css';

/**
 * Table — responsive data table with hover rows
 */
export function Table({ headers, rows, emptyTitle = "لا توجد بيانات حالياً", emptyDesc = "سيتم عرض المحتوى هنا بمجرد توفره في النظام." }) {
  return (
    <div className={styles.wrapper} role="region" tabIndex={0}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={styles.th} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className={styles.emptyCell}>
                <div className={styles.emptyContent}>
                  <p className={styles.emptyTitle}>{emptyTitle}</p>
                  <p className={styles.emptyDesc}>{emptyDesc}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className={styles.tr}>
                {row.map((cell, j) => (
                  <td key={j} className={styles.td}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
