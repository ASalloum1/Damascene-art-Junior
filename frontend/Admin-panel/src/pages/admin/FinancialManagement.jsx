import { useState, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  BarChart2,
  Eye,
  FileText,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import AreaChartWrapper from '../../components/charts/AreaChartWrapper.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockTransactions, monthlyRevenue, mockStores } from '../../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import styles from './FinancialManagement.module.css';

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

export default function FinancialManagementPage() {
  const { showToast } = useToast();

  const [typeFilter, setType]   = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(() => PAGE_SIZE);

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
      const matchSearch = !search || 
        t.transactionNumber.toLowerCase().includes(search.toLowerCase()) || 
        t.customer.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [typeFilter, search]);

  const pagedRows = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  function resetFilters() {
    setType('');
    setSearch('');
    setPage(1);
  }

  const headers = useMemo(() => [
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
              onClick: () => showToast({ message: `عرض ${row.transactionNumber}`, type: 'info' }) 
            },
            { 
              label: 'تصدير PDF', 
              icon: FileText, 
              onClick: () => showToast({ message: 'جاري تصدير المعاملة...', type: 'info' }) 
            },
          ]}
        />
      ),
    },
  ], [showToast]);

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
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => showToast({ message: 'جاري تصدير PDF...', type: 'info' })}
              aria-label="تصدير المعاملات إلى ملف PDF"
            >
              <FileText size={14} strokeWidth={1.8} />
              تصدير PDF
            </button>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => showToast({ message: 'جاري تصدير Excel...', type: 'info' })}
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
          ]}
          onReset={resetFilters}
          activeCount={[search, typeFilter].filter(Boolean).length}
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
    </div>
  );
}
