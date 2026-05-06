// Pure helper: convert a list of transactions into a styled .xlsx file using
// SheetJS and trigger the browser download. Numbers stay numeric (Excel
// formats them) and dates are real Date objects so Excel recognises them.

import * as XLSX from 'xlsx';

const COLUMN_WIDTHS = [
  { wch: 20 }, // رقم المعاملة
  { wch: 12 }, // النوع
  { wch: 14 }, // المبلغ
  { wch: 18 }, // طريقة الدفع
  { wch: 22 }, // العميل
  { wch: 22 }, // المتجر
  { wch: 12 }, // الحالة
  { wch: 18 }, // التاريخ
];

/**
 * Export a list of transactions to an .xlsx file and trigger a browser
 * download. Throws on failure so callers can surface a toast.
 *
 * @param {Array<object>} transactions
 * @param {{ filename: string }} options
 */
export function exportTransactionsExcel(transactions, { filename }) {
  if (!filename) {
    throw new Error('exportTransactionsExcel: filename is required');
  }

  const rows = transactions.map((t) => ({
    'رقم المعاملة': t.transactionNumber,
    'النوع': t.type,
    'المبلغ': t.amount,
    'طريقة الدفع': t.paymentMethod,
    'العميل': t.customer,
    'المتجر': t.store,
    'الحالة': t.status,
    'التاريخ': t.date ? new Date(t.date) : null,
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true });
  ws['!cols'] = COLUMN_WIDTHS;

  // Mark the worksheet as RTL so Excel renders columns right-to-left.
  if (ws['!ref']) {
    ws['!views'] = [{ RTL: true }];
  }

  // Apply a number format to the amount column (col index 2) so values render
  // with thousands separators by default. Also apply a date format to col 7.
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
    const amountAddr = XLSX.utils.encode_cell({ r: row, c: 2 });
    if (ws[amountAddr]) {
      ws[amountAddr].z = '#,##0';
    }
    const dateAddr = XLSX.utils.encode_cell({ r: row, c: 7 });
    if (ws[dateAddr] && ws[dateAddr].t === 'd') {
      ws[dateAddr].z = 'yyyy-mm-dd';
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المعاملات');
  XLSX.writeFile(wb, filename);
}

export default exportTransactionsExcel;
