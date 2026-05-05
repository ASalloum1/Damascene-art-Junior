import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  BarChart2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import PieChartWrapper from '../../components/charts/PieChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest } from '../../utils/adminApi.js';
import styles from './FinancialManagement.module.css';

const STATUS_VARIANT = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

function normalizeTransaction(transaction, index) {
  return {
    id: transaction.id || index,
    transactionNumber: transaction.transaction_number || transaction.reference || `TX-${index + 1}`,
    type: transaction.type || 'payment',
    amount: Number(transaction.amount || transaction.total || 0),
    paymentMethod: transaction.payment_method_label || transaction.payment_method || '—',
    orderId: transaction.order_id || transaction.order || '—',
    customer: transaction.customer || transaction.customer_name || '—',
    store: transaction.store || transaction.store_name || '—',
    date: transaction.date || transaction.created_at,
    status: transaction.status || 'completed',
  };
}

export default function FinancialManagementPage() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState({
    total_revenue: 0,
    refunds_total: 0,
    average_order_value: 0,
    completed_transactions: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setType] = useState('');
  const [storeFilter, setStore] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadFinancials = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.financials);
      const payload = data?.data || {};
      setSummary({
        total_revenue: Number(payload.summary?.total_revenue || 0),
        refunds_total: Number(payload.summary?.refunds_total || 0),
        average_order_value: Number(payload.summary?.average_order_value || 0),
        completed_transactions: Number(payload.summary?.completed_transactions || 0),
      });
      setTransactions((payload.transactions || []).map(normalizeTransaction));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل البيانات المالية', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadFinancials();
  }, [loadFinancials]);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchType = !typeFilter || transaction.type === typeFilter;
      const matchStore = !storeFilter || transaction.store === storeFilter;
      const matchSearch =
        !search ||
        transaction.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
        transaction.customer.toLowerCase().includes(search.toLowerCase());
      return matchType && matchStore && matchSearch;
    });
  }, [transactions, typeFilter, storeFilter, search]);

  const pagedRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const paymentByStore = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((transaction) => {
      const current = grouped.get(transaction.store) || 0;
      grouped.set(transaction.store, current + transaction.amount);
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const byType = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((transaction) => {
      const current = grouped.get(transaction.type) || 0;
      grouped.set(transaction.type, current + 1);
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const storeOptions = useMemo(
    () => Array.from(new Set(transactions.map((transaction) => transaction.store))).filter(Boolean).map((store) => ({ value: store, label: store })),
    [transactions]
  );

  function resetFilters() {
    setType('');
    setStore('');
    setSearch('');
    setPage(1);
  }

  const headers = [
    { key: 'transactionNumber', label: 'رقم المعاملة' },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => <Badge text={val} variant={val === 'refund' ? 'danger' : 'success'} />,
    },
    {
      key: 'amount',
      label: 'المبلغ',
      sortable: true,
      render: (val, row) => (
        <span className={row.type === 'refund' ? styles.refundAmount : styles.paymentAmount}>
          {row.type === 'refund' ? '-' : '+'}{formatCurrency(val)}
        </span>
      ),
    },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
    { key: 'orderId', label: 'الطلب المرتبط', render: (val) => `${val}` },
    { key: 'customer', label: 'العميل' },
    { key: 'store', label: 'المتجر' },
    { key: 'date', label: 'التاريخ', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => <Badge text={val} variant={STATUS_VARIANT[val] || 'default'} />,
    },
  ];

  return (
    <div className={`${styles.page} page-enter`}>
      <div>
        <h1 className={styles.pageTitle}>الإدارة المالية</h1>
        <p className={styles.pageSubtitle}>مراقبة الإيرادات والمدفوعات والتسويات المالية بين المتاجر والمنصة</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard icon={DollarSign} label="إجمالي الإيرادات" value={formatCurrency(summary.total_revenue)} color="green" subtitle="هذا الشهر" />
        <StatCard icon={CreditCard} label="المعاملات المكتملة" value={toArabicNum(summary.completed_transactions)} color="blue" subtitle="هذا الشهر" />
        <StatCard icon={RefreshCcw} label="المستردات" value={formatCurrency(summary.refunds_total)} color="red" subtitle="إجمالي المستردات" />
        <StatCard icon={BarChart2} label="متوسط قيمة الطلب" value={formatCurrency(summary.average_order_value)} color="gold" />
      </div>

      <div className={styles.card}>
        <BarChartWrapper
          data={paymentByStore}
          xKey="name"
          yKey="value"
          color={COLORS.blue}
          title="الإيرادات حسب المتجر"
          height={260}
          formatValue={(value) => `${Math.round(value)}`}
        />
      </div>

      <div className={styles.card}>
        <PieChartWrapper
          data={byType}
          title="توزيع أنواع المعاملات"
          height={240}
          donut
        />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>المعاملات المالية</h3>
        </div>

        <FilterBar
          filters={[
            {
              type: 'search',
              placeholder: 'بحث برقم المعاملة أو اسم العميل...',
              value: search,
              onChange: (value) => {
                setSearch(value);
                setPage(1);
              },
            },
            {
              type: 'select',
              label: 'النوع',
              placeholder: 'الكل',
              value: typeFilter,
              onChange: (value) => {
                setType(value);
                setPage(1);
              },
              options: [
                { value: 'payment', label: 'دفعات' },
                { value: 'refund', label: 'استردادات' },
              ],
            },
            {
              type: 'select',
              label: 'المتجر',
              placeholder: 'الكل',
              value: storeFilter,
              onChange: (value) => {
                setStore(value);
                setPage(1);
              },
              options: storeOptions,
            },
          ]}
          onReset={resetFilters}
          activeCount={[search, typeFilter, storeFilter].filter(Boolean).length}
        />

        <div className={styles.tableCard}>
          <DataTable
            headers={headers}
            rows={pagedRows}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: (value) => setPage(value),
              onPageSizeChange: (value) => {
                setPageSize(value);
                setPage(1);
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
