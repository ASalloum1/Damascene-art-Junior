import { useState, useMemo, lazy, Suspense } from 'react';
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  BarChart2,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import Modal from '../../components/ui/Modal.jsx';
import AreaChartWrapper from '../../components/charts/AreaChartWrapper.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  mockTransactions,
  monthlyRevenue,
  mockStores,
} from '../../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import styles from './FinancialManagement.module.css';

// ── Single-transaction receipt printer ───────────────────────────────────────
// Opens a clean isolated window, writes a self-contained HTML document with
// embedded CSS + Tajawal from Google Fonts + <bdi> for mixed content, then
// triggers the browser's native print dialog once fonts have loaded. This
// avoids the @react-pdf/renderer glyph drop bugs (orphan "د", missing hamza
// on "الإدارية", and BiDi reversal on "TXN-2026-0001"/"#o1") that plagued the
// previous two attempts at this single-document export.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function printTransactionReceipt(tx, onPopupBlocked) {
  const w = window.open('', '_blank', 'width=900,height=1200');
  if (!w) {
    if (onPopupBlocked) onPopupBlocked();
    return;
  }

  const txNumber       = escapeHtml(tx.transactionNumber);
  const txType         = escapeHtml(tx.type);
  const txPaymentMethod = escapeHtml(tx.paymentMethod);
  const txOrderId      = escapeHtml(tx.orderId);
  const txCustomer     = escapeHtml(tx.customer);
  const txStore        = escapeHtml(tx.store);
  const txStatus       = escapeHtml(tx.status);
  const isRefund       = tx.type === 'استرداد';
  const amountClass    = isRefund ? 'amount-negative' : 'amount-positive';
  const amountSign     = isRefund ? '-' : '+';
  const amountStr      = escapeHtml(formatCurrency(tx.amount));
  const dateStr        = escapeHtml(formatDate(tx.date));
  const issuedStr      = new Date().toLocaleDateString('ar-EG');

  w.document.write(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>إيصال معاملة ${txNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Tajawal', sans-serif;
      direction: rtl;
      text-align: right;
      color: #1A1F3A;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { padding: 20mm; max-width: 210mm; margin: 0 auto; }
    .header {
      text-align: center;
      border-bottom: 2px solid #C8A45A;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand { font-size: 24px; font-weight: 800; color: #1A1F3A; }
    .subtitle { font-size: 14px; color: #666; margin-top: 4px; }
    .doc-title { font-size: 18px; font-weight: 700; margin-top: 12px; color: #C8A45A; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #666;
    }
    .meta-row span bdi { font-weight: 600; color: #1A1F3A; }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1A1F3A;
      border-bottom: 1px solid #C8A45A;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table tr { border-bottom: 1px solid #f0f0f0; }
    .details-table td {
      padding: 12px 8px;
      font-size: 14px;
      vertical-align: middle;
    }
    .details-table td.label {
      font-weight: 600;
      color: #555;
      width: 35%;
    }
    .details-table td.value {
      font-weight: 500;
      color: #1A1F3A;
    }
    .amount-positive { color: #2D7A3E; font-weight: 700; }
    .amount-negative { color: #C53030; font-weight: 700; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
    @media print {
      body { padding: 15mm; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">الفن الدمشقي</div>
    <div class="subtitle">لوحة التحكم الإدارية</div>
    <div class="doc-title">إيصال معاملة مالية</div>
  </div>

  <div class="meta-row">
    <span>تاريخ الإصدار: <bdi>${issuedStr}</bdi></span>
    <span>رقم المعاملة: <bdi>${txNumber}</bdi></span>
  </div>

  <div class="section-title">تفاصيل المعاملة</div>

  <table class="details-table">
    <tr>
      <td class="label">رقم المعاملة</td>
      <td class="value"><bdi>${txNumber}</bdi></td>
    </tr>
    <tr>
      <td class="label">النوع</td>
      <td class="value">${txType}</td>
    </tr>
    <tr>
      <td class="label">المبلغ</td>
      <td class="value ${amountClass}">
        <bdi>${amountSign}${amountStr}</bdi>
      </td>
    </tr>
    <tr>
      <td class="label">طريقة الدفع</td>
      <td class="value">${txPaymentMethod}</td>
    </tr>
    <tr>
      <td class="label">الطلب المرتبط</td>
      <td class="value"><bdi>#${txOrderId}</bdi></td>
    </tr>
    <tr>
      <td class="label">العميل</td>
      <td class="value">${txCustomer}</td>
    </tr>
    <tr>
      <td class="label">المتجر</td>
      <td class="value">${txStore}</td>
    </tr>
    <tr>
      <td class="label">الحالة</td>
      <td class="value">${txStatus}</td>
    </tr>
    <tr>
      <td class="label">التاريخ</td>
      <td class="value"><bdi>${dateStr}</bdi></td>
    </tr>
  </table>

  <div class="footer">
    <div>صفحة ١ من ١</div>
    <div>© ٢٠٢٦ الفن الدمشقي - جميع الحقوق محفوظة</div>
  </div>

  <script>
    // انتظر تحميل الخط ثم اطبع
    document.fonts.ready.then(function () {
      setTimeout(function () {
        window.print();
        // النافذة تُغلق بعد إنهاء الطباعة
        setTimeout(function () { window.close(); }, 500);
      }, 200);
    });
  </script>
</body>
</html>
  `);
  w.document.close();
}

// ── Lazy boundaries ──────────────────────────────────────────────────────────
// The entire @react-pdf/renderer dependency (≈ several hundred KB) and the
// xlsx writer ship in their own chunks. Both load only when the admin actually
// triggers an export, keeping the financial page's initial JS small.
const LazyFinancialReportLink = lazy(() =>
  import('../../utils/pdf/LazyFinancialReportLink.jsx')
);

const STATUS_VARIANT = {
  'مكتملة': 'success',
  'معلقة':  'warning',
  'فاشلة':  'danger',
};

const TYPE_VARIANT = {
  'دفعة':    'success',
  'استرداد': 'danger',
};

const PAGE_SIZE = 10;

// Dual area data: revenue vs simulated expenses
const revenueExpenseData = monthlyRevenue.map((item) => ({
  name: item.name,
  revenue: item.value,
  expenses: Math.round(item.value * 0.65),
}));

// Revenue by store
const storeRevenueData = mockStores.map((s) => ({
  name: s.name,
  value: s.monthlyRevenue,
}));

// ── Export helpers ───────────────────────────────────────────────────────────
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const TOAST = {
  excelSuccess: 'تم تنزيل ملف Excel بنجاح',
  excelFail: 'فشل تصدير الملف. حاول مرة أخرى',
  popupBlocked: 'يرجى السماح بالنوافذ المنبثقة',
  emptyFilter: 'لا توجد معاملات للتصدير',
};

export default function FinancialManagementPage() {
  const { showToast } = useToast();

  const [typeFilter, setType]         = useState('');
  const [storeFilter, setStore]       = useState('');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(() => PAGE_SIZE);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx]   = useState(null);

  const { totalRevenue, totalRefunds, avgOrderValue, refundCount } = useMemo(() => {
    const revenue = mockTransactions
      .filter((t) => t.type === 'دفعة' && t.status === 'مكتملة')
      .reduce((acc, t) => acc + t.amount, 0);

    const refunds = mockTransactions
      .filter((t) => t.type === 'استرداد')
      .reduce((acc, t) => acc + t.amount, 0);

    const payments = mockTransactions.filter((t) => t.type === 'دفعة');
    const avg = Math.round(
      payments.reduce((acc, t) => acc + t.amount, 0) / (payments.length || 1)
    );

    const rCount = mockTransactions.filter((t) => t.type === 'استرداد').length;

    return { totalRevenue: revenue, totalRefunds: refunds, avgOrderValue: avg, refundCount: rCount };
  }, []);

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchType   = !typeFilter || t.type === typeFilter;
      const matchStore  = !storeFilter || t.store === storeFilter;
      const matchSearch = !search ||
        t.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.customer.toLowerCase().includes(search.toLowerCase());
      return matchType && matchStore && matchSearch;
    });
  }, [typeFilter, storeFilter, search]);

  const pagedRows = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  // Stable document props for the report PDF — only re-creates when the
  // underlying filters or KPIs change, so PDFDownloadLink doesn't keep
  // re-generating the blob on every render.
  const reportDocumentProps = useMemo(
    () => ({
      kpis: {
        totalRevenue,
        totalRefunds,
        avgOrderValue,
        refundCount,
        transactionsCount: mockTransactions.length,
      },
      stores: mockStores,
      transactions: filtered,
      filters: {
        store: storeFilter,
        type: typeFilter,
        search,
      },
      generatedAt: new Date(),
    }),
    [filtered, storeFilter, typeFilter, search, totalRevenue, totalRefunds, avgOrderValue, refundCount]
  );

  const reportFileName = `damascene-financial-report-${todayIso()}.pdf`;

  function resetFilters() {
    setType('');
    setStore('');
    setSearch('');
    setPage(1);
  }

  // ── Excel export ───────────────────────────────────────────────────────────
  async function handleExcelExport() {
    if (filtered.length === 0) {
      showToast({ message: TOAST.emptyFilter, type: 'warning' });
      return;
    }
    try {
      const { exportTransactionsExcel } = await import(
        '../../utils/pdf/exportTransactionsExcel.js'
      );
      exportTransactionsExcel(filtered, {
        filename: `damascene-transactions-${todayIso()}.xlsx`,
      });
      showToast({ message: TOAST.excelSuccess, type: 'success' });
    } catch (err) {
      console.error('Excel export failed:', err);
      showToast({ message: TOAST.excelFail, type: 'error' });
    }
  }

  // ── Single-transaction PDF export ──────────────────────────────────────────
  // Pivoted away from @react-pdf/renderer for this one document — the receipt
  // is now printed from a clean isolated browser window via
  // printTransactionReceipt() defined at module scope. This sidesteps the
  // glyph-drop and BiDi-reversal bugs that two prior @react-pdf attempts hit.
  function handleSingleTxPdfExport(transaction) {
    if (!transaction) return;
    printTransactionReceipt(transaction, () => {
      showToast({ message: TOAST.popupBlocked, type: 'error' });
    });
  }

  const headers = [
    { key: 'transactionNumber', label: 'رقم المعاملة' },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => <Badge text={val} variant={TYPE_VARIANT[val] || 'default'} />,
    },
    {
      key: 'amount',
      label: 'المبلغ',
      sortable: true,
      render: (val, row) => (
        <span className={row.type === 'استرداد' ? styles.refundAmount : styles.paymentAmount}>
          {row.type === 'استرداد' ? '-' : '+'}{formatCurrency(val)}
        </span>
      ),
    },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
    { key: 'orderId', label: 'الطلب المرتبط', render: (val) => `#${val}` },
    { key: 'customer',  label: 'العميل' },
    { key: 'store',     label: 'المتجر' },
    { key: 'date', label: 'التاريخ', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => <Badge text={val} variant={STATUS_VARIANT[val] || 'default'} />,
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_, row) => (
        <ActionMenu
          actions={[
            {
              label: 'عرض التفاصيل',
              icon: Eye,
              onClick: () => {
                setSelectedTx(row);
                setDetailsOpen(true);
              },
            },
            {
              label: 'تصدير PDF',
              icon: FileText,
              onClick: () => handleSingleTxPdfExport(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div>
        <h1 className={styles.pageTitle}>الإدارة المالية</h1>
        <p className={styles.pageSubtitle}>مراقبة الإيرادات والمدفوعات والتسويات المالية بين المتاجر والمنصة</p>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={DollarSign}
          label="إجمالي الإيرادات"
          value={formatCurrency(totalRevenue)}
          color="green"
          subtitle="هذا الشهر"
          trend="+١٢%"
          trendUp={true}
        />
        <StatCard
          icon={CreditCard}
          label="المعاملات"
          value={toArabicNum(mockTransactions.length)}
          color="blue"
          subtitle="هذا الشهر"
        />
        <StatCard
          icon={RefreshCcw}
          label="المستردات"
          value={formatCurrency(totalRefunds)}
          color="red"
          subtitle={`${toArabicNum(refundCount)} عملية`}
        />
        <StatCard
          icon={BarChart2}
          label="متوسط قيمة الطلب"
          value={formatCurrency(avgOrderValue)}
          color="gold"
          trend="+٥%"
          trendUp={true}
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className={styles.card}>
        <AreaChartWrapper
          data={revenueExpenseData}
          areas={[
            { key: 'revenue',  color: COLORS.green,  label: 'الإيرادات' },
            { key: 'expenses', color: COLORS.orange, label: 'المصروفات' },
          ]}
          title="الإيرادات والمصروفات"
          height={300}
          formatValue={(v) => `${Math.round(v / 1000)}k`}
        />
      </div>

      {/* Revenue by Store */}
      <div className={styles.card}>
        <BarChartWrapper
          data={storeRevenueData}
          xKey="name"
          yKey="value"
          color={COLORS.blue}
          title="الإيرادات حسب المتجر"
          height={260}
          formatValue={(v) => `${Math.round(v / 1000)}k`}
        />
      </div>

      {/* Transactions Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle} id="transactions-table-title">المعاملات المالية</h3>
          <div className={styles.exportBtns}>
            <Suspense
              fallback={
                <button type="button" className={styles.exportBtn} disabled>
                  <Loader2 size={14} strokeWidth={1.8} className={styles.spinner} />
                  تحضير PDF...
                </button>
              }
            >
              <LazyFinancialReportLink
                documentProps={reportDocumentProps}
                fileName={reportFileName}
                className={styles.exportBtn}
                ariaLabel="تصدير المعاملات إلى ملف PDF"
              >
                {({ loading, error }) => (
                  <>
                    {loading ? (
                      <Loader2 size={14} strokeWidth={1.8} className={styles.spinner} />
                    ) : (
                      <FileText size={14} strokeWidth={1.8} />
                    )}
                    {loading ? 'جارٍ التحضير...' : error ? 'تعذّر التحضير' : 'تصدير PDF'}
                  </>
                )}
              </LazyFinancialReportLink>
            </Suspense>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={handleExcelExport}
              aria-label="تصدير المعاملات إلى ملف Excel"
            >
              <FileText size={14} strokeWidth={1.8} />
              تصدير Excel
            </button>
          </div>
        </div>

        <FilterBar
          filters={[
            {
              type: 'search',
              placeholder: 'بحث برقم المعاملة أو اسم العميل...',
              value: search,
              onChange: (val) => { setSearch(() => val); setPage(() => 1); },
            },
            {
              type: 'select',
              label: 'النوع',
              placeholder: 'الكل',
              value: typeFilter,
              onChange: (val) => { setType(() => val); setPage(() => 1); },
              options: [
                { value: 'دفعة',    label: 'دفعات' },
                { value: 'استرداد', label: 'استردادات' },
              ],
            },
            {
              type: 'select',
              label: 'المتجر',
              placeholder: 'الكل',
              value: storeFilter,
              onChange: (val) => { setStore(() => val); setPage(() => 1); },
              options: mockStores.map((s) => ({ value: s.name, label: s.name })),
            },
          ]}
          onReset={resetFilters}
          activeCount={[search, typeFilter, storeFilter].filter(Boolean).length}
        />

        <div className={styles.tableCard} role="region" aria-labelledby="transactions-table-title">
          <DataTable
            headers={headers}
            rows={pagedRows}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: (p) => setPage(() => p),
              onPageSizeChange: (s) => {
                setPageSize(() => s);
                setPage(() => 1);
              },
            }}
          />
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={`تفاصيل المعاملة: ${selectedTx?.transactionNumber}`}
        size="sm"
      >
        <div className={styles.transactionDetails}>
          <div className={styles.detailsField}>
            <label>رقم المعاملة</label>
            <p>{selectedTx?.transactionNumber}</p>
          </div>
          <div className={styles.detailsField}>
            <label>النوع</label>
            <p>
              <Badge text={selectedTx?.type} variant={TYPE_VARIANT[selectedTx?.type] || 'default'} />
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>المبلغ</label>
            <p className={selectedTx?.type === 'استرداد' ? styles.refundAmount : styles.paymentAmount}>
              {selectedTx?.type === 'استرداد' ? '-' : '+'}{formatCurrency(selectedTx?.amount)}
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>طريقة الدفع</label>
            <p>{selectedTx?.paymentMethod}</p>
          </div>
          <div className={styles.detailsField}>
            <label>الطلب المرتبط</label>
            <p>#{selectedTx?.orderId}</p>
          </div>
          <div className={styles.detailsField}>
            <label>العميل</label>
            <p>{selectedTx?.customer}</p>
          </div>
          <div className={styles.detailsField}>
            <label>المتجر</label>
            <p>{selectedTx?.store}</p>
          </div>
          <div className={styles.detailsField}>
            <label>الحالة</label>
            <p>
              <Badge text={selectedTx?.status} variant={STATUS_VARIANT[selectedTx?.status] || 'default'} />
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>التاريخ</label>
            <p>{formatDate(selectedTx?.date)}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
