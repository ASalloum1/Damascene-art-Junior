import { useState, useMemo } from 'react';
import {
  Eye,
  RefreshCw,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockOrders, mockStores } from '../../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import styles from './OrdersManagement.module.css';

const STATUS_VARIANT = {
  'مكتمل':       'success',
  'قيد التجهيز': 'info',
  'تم الشحن':    'purple',
  'جديد':        'warning',
  'ملغي':        'danger',
  'مرتجع':       'default',
};

const PAGE_SIZE = 10;
const EMPTY_SELECTION = [];
const NOOP = () => {};

// Compute counts per status
function countByStatus(orders, status) {
  if (status === 'الكل') return orders.length;
  return orders.filter((o) => o.status === status).length;
}

export default function OrdersManagementPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab]       = useState(() => 'الكل');
  const [search, setSearch]             = useState(() => '');
  const [storeFilter, setStore]         = useState(() => '');
  const [paymentFilter, setPayment]     = useState(() => '');
  const [page, setPage]                 = useState(() => 1);
  const [pageSize, setPageSize]         = useState(() => PAGE_SIZE);

  const storeOptions = useMemo(() => 
    mockStores.map((s) => ({ value: s.name, label: s.name })),
    []
  );

  const TABS = useMemo(() => [
    { id: 'الكل',          label: 'الكل',          count: countByStatus(mockOrders, 'الكل') },
    { id: 'جديد',          label: 'جديد',          count: countByStatus(mockOrders, 'جديد') },
    { id: 'قيد التجهيز',   label: 'قيد التجهيز',   count: countByStatus(mockOrders, 'قيد التجهيز') },
    { id: 'تم الشحن',      label: 'تم الشحن',      count: countByStatus(mockOrders, 'تم الشحن') },
    { id: 'مكتمل',         label: 'مكتمل',         count: countByStatus(mockOrders, 'مكتمل') },
    { id: 'ملغي',          label: 'ملغي',          count: countByStatus(mockOrders, 'ملغي') },
    { id: 'مرتجع',         label: 'مرتجع',         count: countByStatus(mockOrders, 'مرتجع') },
  ], []);

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchTab     = activeTab === 'الكل' || o.status === activeTab;
      const matchSearch  = !search || 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
        o.customer.toLowerCase().includes(search.toLowerCase());
      const matchStore   = !storeFilter || o.store === storeFilter;
      const matchPayment = !paymentFilter || o.paymentMethod === paymentFilter;
      return matchTab && matchSearch && matchStore && matchPayment;
    });
  }, [activeTab, search, storeFilter, paymentFilter]);

  const pagedRows = useMemo(() => 
    filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const resetFilters = () => {
    setSearch('');
    setStore('');
    setPayment('');
    setPage(1);
  };

  const headers = useMemo(() => [
    { key: 'orderNumber', label: 'رقم الطلب' },
    { key: 'store',       label: 'المتجر' },
    {
      key: 'customer',
      label: 'العميل',
      render: (val, row) => (
        <div className={styles.customerCell} aria-label={`العميل: ${val}`}>
          <span className={styles.customerName}>{val}</span>
          <span className={styles.customerEmail}>{row.email}</span>
        </div>
      ),
    },
    {
      key: 'productsCount',
      label: 'المنتجات',
      render: (val) => `${toArabicNum(val)} منتج`,
    },
    {
      key: 'amount',
      label: 'المبلغ',
      sortable: true,
      render: (val) => formatCurrency(val),
    },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => (
        <Badge 
          text={val} 
          variant={STATUS_VARIANT[val] || 'default'} 
          aria-label={`حالة الطلب: ${val}`}
        />
      ),
    },
    {
      key: 'date',
      label: 'تاريخ الطلب',
      sortable: true,
      render: (val) => formatDate(val),
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
              onClick: () => showToast({ message: `عرض ${row.orderNumber}`, type: 'info' }) 
            },
            { 
              label: 'تحديث الحالة', 
              icon: RefreshCw, 
              onClick: () => showToast({ message: 'تحديث حالة الطلب', type: 'info' }) 
            },
            { 
              label: 'إلغاء', 
              icon: XCircle, 
              danger: true, 
              onClick: () => showToast({ message: `تم إلغاء ${row.orderNumber}`, type: 'warning' }) 
            },
            { 
              label: 'استرداد', 
              icon: RotateCcw, 
              onClick: () => showToast({ message: `تم طلب استرداد ${row.orderNumber}`, type: 'info' }) 
            },
          ]}
        />
      ),
    },
  ], [showToast]);

  return (
    <div className={`${styles.page} page-enter`} role="main" aria-labelledby="page-title">
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 id="page-title" className={styles.pageTitle}>إدارة الطلبات</h1>
                <p className={styles.pageSubtitle}>متابعة حالات الطلبات ومعالجتها من الاستلام حتى التسليم</p>

      </div>

      {/* Status Tabs */}
      <div className={styles.tabsContainer} role="navigation" aria-label="تصفية حسب الحالة">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(id) => { 
            setActiveTab(id); 
            setPage(1); 
          }}
          variant="pills"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'بحث برقم الطلب أو اسم العميل...',
            value: search,
            onChange: (val) => {
              setSearch(val);
              setPage(1);
            },
          },
          {
            type: 'select',
            label: 'المتجر',
            placeholder: 'الكل',
            value: storeFilter,
            onChange: (val) => {
              setStore(val);
              setPage(1);
            },
            options: storeOptions,
          },
          {
            type: 'select',
            label: 'طريقة الدفع',
            placeholder: 'الكل',
            value: paymentFilter,
            onChange: (val) => {
              setPayment(val);
              setPage(1);
            },
            options: [
              { value: 'بطاقة ائتمان',   label: 'بطاقة ائتمان' },
              { value: 'دفع عند التسليم', label: 'دفع عند التسليم' },
              { value: 'تحويل بنكي',     label: 'تحويل بنكي' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, storeFilter, paymentFilter].filter(Boolean).length}
      />

      {/* Table */}
      <div className={styles.tableCard}>
        <DataTable
          headers={headers}
          rows={pagedRows}
          selectable
          selected={EMPTY_SELECTION}
          onSelectChange={NOOP}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
            onPageChange: (p) => setPage(p),
            onPageSizeChange: (s) => { 
              setPageSize(s); 
              setPage(1); 
            },
          }}
          ariaLabel="جدول الطلبات"
        />
      </div>
    </div>
  );
}
