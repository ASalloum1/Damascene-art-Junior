import { useState, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  BarChart2,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
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
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const totalRevenue = mockTransactions
    .filter((t) => t.type === 'دفعة' && t.status === 'مكتملة')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRefunds = mockTransactions
    .filter((t) => t.type === 'استرداد')
    .reduce((acc, t) => acc + t.amount, 0);

  const avgOrderValue = Math.round(
    mockTransactions.filter((t) => t.type === 'دفعة').reduce((acc, t) => acc + t.amount, 0) /
      (mockTransactions.filter((t) => t.type === 'دفعة').length || 1)
  );

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchType   = !typeFilter || t.type === typeFilter;
      const matchSearch = !search || t.transactionNumber.includes(search) || t.customer.includes(search);
      return matchType && matchSearch;
    });
  }, [typeFilter, search]);

  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setType(''); setSearch(''); setPage(1);
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
            { label: 'عرض التفاصيل', icon: Eye, onClick: () => showToast({ message: `عرض ${row.transactionNumber}`, type: 'info' }) },
            { label: 'تصدير PDF', icon: FileText, onClick: () => showToast({ message: 'جاري تصدير المعاملة...', type: 'info' }) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <h1 className={styles.pageTitle}>الإدارة المالية</h1>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={DollarSign}
          label="إجمالي الإيرادات"
          value={formatCurrency(totalRevenue)}
          color="green"
          subtitle="هذا الشهر"
          trend="+١٢%"
          trendUp
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
          subtitle={`${toArabicNum(mockTransactions.filter((t) => t.type === 'استرداد').length)} عملية`}
        />
        <StatCard
          icon={BarChart2}
          label="متوسط قيمة الطلب"
          value={formatCurrency(avgOrderValue)}
          color="gold"
          trend="+٥%"
          trendUp
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
          <h3 className={styles.tableTitle}>المعاملات المالية</h3>
          <div className={styles.exportBtns}>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => showToast({ message: 'جاري تصدير PDF...', type: 'info' })}
            >
              <FileText size={14} strokeWidth={1.8} />
              تصدير PDF
            </button>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => showToast({ message: 'جاري تصدير Excel...', type: 'info' })}
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
              onChange: setSearch,
            },
            {
              type: 'select',
              label: 'النوع',
              placeholder: 'الكل',
              value: typeFilter,
              onChange: setType,
              options: [
                { value: 'دفعة',    label: 'دفعات' },
                { value: 'استرداد', label: 'استردادات' },
              ],
            },
          ]}
          onReset={resetFilters}
          activeCount={[search, typeFilter].filter(Boolean).length}
        />

        <div className={styles.tableCard}>
          <DataTable
            headers={headers}
            rows={pagedRows}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: setPage,
              onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
            }}
          />
        </div>
      </div>
    </div>
  );
}
