import { useState, useMemo } from 'react';
import {
  Eye,
  XCircle,
} from 'lucide-react';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import FilterBar from '../components/ui/FilterBar.jsx';
import ActionMenu from '../components/ui/ActionMenu.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { mockOrders, mockStores, mockProducts } from '../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../utils/formatters.js';
import styles from './OrdersPage.module.css';

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

// Generate sample order items from products
function getOrderItems(orderId) {
  const sampleItems = [
    { productId: 'p1', productName: 'طاولة موزاييك دمشقية', quantity: 1, price: 12500 },
    { productId: 'p2', productName: 'صندوق خشب مطعّم بالصدف', quantity: 2, price: 4800 },
    { productId: 'p3', productName: 'مرآة زجاج منفوخ', quantity: 1, price: 3200 },
  ];

  if (orderId === 'o1') return sampleItems.slice(0, 2);
  if (orderId === 'o2') return sampleItems.slice(1, 2);
  if (orderId === 'o3') return sampleItems.slice(2, 3);

  return sampleItems.slice(0, 1);
}

export default function OrdersPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab]       = useState(() => 'الكل');
  const [search, setSearch]             = useState(() => '');
  const [storeFilter, setStore]         = useState(() => '');
  const [paymentFilter, setPayment]     = useState(() => '');
  const [page, setPage]                 = useState(() => 1);
  const [pageSize, setPageSize]         = useState(() => PAGE_SIZE);
  const [viewOpen, setViewOpen]         = useState(false);
  const [viewOrder, setViewOrder]       = useState(null);

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

  const handleViewOrder = (order) => {
    setViewOrder(order);
    setViewOpen(true);
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
              onClick: () => handleViewOrder(row)
            },
            {
              label: 'إلغاء',
              icon: XCircle,
              danger: true,
              onClick: () => showToast({ message: `تم إلغاء الطلب ${row.orderNumber}`, type: 'warning' })
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

      {/* View Order Details Modal */}
      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={`تفاصيل الطلب: ${viewOrder?.orderNumber}`}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setViewOpen(false)}>إغلاق</Button>
          </div>
        }
      >
        <div className={styles.orderDetailsContent}>
          {/* Order Information */}
          <div className={styles.orderInfoSection}>
            <h3 className={styles.sectionTitle}>معلومات الطلب</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>رقم الطلب</label>
                <p>{viewOrder?.orderNumber}</p>
              </div>
              <div className={styles.infoItem}>
                <label>العميل</label>
                <p>{viewOrder?.customer}</p>
              </div>
              <div className={styles.infoItem}>
                <label>البريد الإلكتروني</label>
                <p>{viewOrder?.email}</p>
              </div>
              <div className={styles.infoItem}>
                <label>المتجر</label>
                <p>{viewOrder?.store}</p>
              </div>
              <div className={styles.infoItem}>
                <label>تاريخ الطلب</label>
                <p>{formatDate(viewOrder?.date)}</p>
              </div>
              <div className={styles.infoItem}>
                <label>طريقة الدفع</label>
                <p>{viewOrder?.paymentMethod}</p>
              </div>
              <div className={styles.infoItem}>
                <label>الحالة</label>
                <p>
                  <Badge
                    text={viewOrder?.status}
                    variant={STATUS_VARIANT[viewOrder?.status] || 'default'}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummarySection}>
            <h3 className={styles.sectionTitle}>ملخص الطلب</h3>
            <div className={styles.itemsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>المنتج</span>
                <span className={styles.colQuantity}>الكمية</span>
                <span className={styles.colPrice}>السعر</span>
                <span className={styles.colTotal}>الإجمالي</span>
              </div>
              {getOrderItems(viewOrder?.id).map((item, idx) => (
                <div key={idx} className={styles.tableRow}>
                  <span className={styles.colProduct}>{item.productName}</span>
                  <span className={styles.colQuantity}>{toArabicNum(item.quantity)}</span>
                  <span className={styles.colPrice}>{formatCurrency(item.price)}</span>
                  <span className={styles.colTotal}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className={styles.totalRow}>
                <span>الإجمالي الكلي:</span>
                <span>{formatCurrency(viewOrder?.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
