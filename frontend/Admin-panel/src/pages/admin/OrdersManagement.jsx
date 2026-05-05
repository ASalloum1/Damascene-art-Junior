import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getPaymentMethodLabel, getStatusLabel } from '../../utils/adminApi.js';
import styles from './OrdersManagement.module.css';

const STATUS_VARIANT = {
  مكتمل: 'success',
  'قيد التجهيز': 'info',
  'تم الشحن': 'purple',
  جديد: 'warning',
  ملغي: 'danger',
  مرتجع: 'default',
};

const PAGE_SIZE = 10;
const EMPTY_SELECTION = [];
const NOOP = () => {};

function normalizeOrder(order) {
  return {
    id: order.id,
    orderNumber: order.order_number || `#${order.id}`,
    store: order.store || order.store_name || '—',
    customer: order.customer || order.customer_name || order.shipping?.recipient_name || '—',
    email: order.email || '—',
    productsCount: Number(order.products_count || order.items_count || order.product_carts?.length || 0),
    amount: Number(order.amount || order.order_total || order.total_price || 0),
    paymentMethod: order.payment_method_label || getPaymentMethodLabel(order.payment_method),
    status: order.status_label || getStatusLabel(order.status),
    statusKey: order.status,
    date: order.created_at || order.updated_at,
    items: order.items || order.product_carts || [],
  };
}

function countByStatus(orders, status) {
  if (status === 'الكل') return orders.length;
  return orders.filter((order) => order.status === status).length;
}

export default function OrdersManagementPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('الكل');
  const [search, setSearch] = useState('');
  const [storeFilter, setStore] = useState('');
  const [paymentFilter, setPayment] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.orders);
      setOrders((data?.data?.orders || []).map(normalizeOrder));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل الطلبات', type: 'error' });
    }
  }, [showToast]);

  const loadStores = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.stores);
      setStores(data?.data?.stores || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المتاجر', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
    loadStores();
  }, [loadOrders, loadStores]);

  const storeOptions = useMemo(
    () => stores.map((store) => ({ value: store.name, label: store.name })),
    [stores]
  );

  const tabs = useMemo(() => [
    { id: 'الكل', label: 'الكل', count: countByStatus(orders, 'الكل') },
    { id: 'جديد', label: 'جديد', count: countByStatus(orders, 'جديد') },
    { id: 'قيد التجهيز', label: 'قيد التجهيز', count: countByStatus(orders, 'قيد التجهيز') },
    { id: 'تم الشحن', label: 'تم الشحن', count: countByStatus(orders, 'تم الشحن') },
    { id: 'مكتمل', label: 'مكتمل', count: countByStatus(orders, 'مكتمل') },
    { id: 'ملغي', label: 'ملغي', count: countByStatus(orders, 'ملغي') },
    { id: 'مرتجع', label: 'مرتجع', count: countByStatus(orders, 'مرتجع') },
  ], [orders]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchTab = activeTab === 'الكل' || order.status === activeTab;
      const matchSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());
      const matchStore = !storeFilter || order.store === storeFilter;
      const matchPayment = !paymentFilter || order.paymentMethod === paymentFilter;
      return matchTab && matchSearch && matchStore && matchPayment;
    });
  }, [orders, activeTab, search, storeFilter, paymentFilter]);

  const pagedRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  function resetFilters() {
    setSearch('');
    setStore('');
    setPayment('');
    setPage(1);
  }

  function handleViewOrder(order) {
    setViewOrder(order);
    setViewOpen(true);
  }

  async function updateOrderStatus(order, status) {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.orderStatus(order.id), {
        method: 'POST',
        body: { status },
      });
      showToast({ message: 'تم تحديث حالة الطلب', type: 'success' });
      await loadOrders();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث حالة الطلب', type: 'error' });
    }
  }

  const headers = [
    { key: 'orderNumber', label: 'رقم الطلب' },
    { key: 'store', label: 'المتجر' },
    {
      key: 'customer',
      label: 'العميل',
      render: (val, row) => (
        <div className={styles.customerCell}>
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
      render: (val) => <Badge text={val} variant={STATUS_VARIANT[val] || 'default'} />,
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
            { label: 'عرض التفاصيل', icon: Eye, onClick: () => handleViewOrder(row) },
            { label: 'تم الشحن', icon: Truck, onClick: () => updateOrderStatus(row, 'shipped') },
            { label: 'مكتمل', icon: CheckCircle2, onClick: () => updateOrderStatus(row, 'completed') },
          ]}
        />
      ),
    },
  ];

  return (
    <div className={`${styles.page} page-enter`} role="main" aria-labelledby="page-title">
      <div className={styles.pageHeader}>
        <h1 id="page-title" className={styles.pageTitle}>إدارة الطلبات</h1>
        <p className={styles.pageSubtitle}>متابعة حالات الطلبات ومعالجتها من الاستلام حتى التسليم</p>
      </div>

      <div className={styles.tabsContainer} role="navigation" aria-label="تصفية حسب الحالة">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            setPage(1);
          }}
          variant="pills"
        />
      </div>

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
              { value: 'بطاقة ائتمان', label: 'بطاقة ائتمان' },
              { value: 'دفع عند التسليم', label: 'دفع عند التسليم' },
              { value: 'تحويل بنكي', label: 'تحويل بنكي' },
              { value: 'PayPal', label: 'PayPal' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, storeFilter, paymentFilter].filter(Boolean).length}
      />

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
            onPageChange: (value) => setPage(value),
            onPageSizeChange: (value) => {
              setPageSize(value);
              setPage(1);
            },
          }}
        />
      </div>

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={`تفاصيل الطلب: ${viewOrder?.orderNumber}`}
        size="md"
        footer={(
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setViewOpen(false)}>إغلاق</Button>
          </div>
        )}
      >
        <div className={styles.orderDetailsContent}>
          <div className={styles.orderInfoSection}>
            <h3 className={styles.sectionTitle}>معلومات الطلب</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><label>رقم الطلب</label><p>{viewOrder?.orderNumber}</p></div>
              <div className={styles.infoItem}><label>العميل</label><p>{viewOrder?.customer}</p></div>
              <div className={styles.infoItem}><label>البريد الإلكتروني</label><p>{viewOrder?.email}</p></div>
              <div className={styles.infoItem}><label>المتجر</label><p>{viewOrder?.store}</p></div>
              <div className={styles.infoItem}><label>تاريخ الطلب</label><p>{formatDate(viewOrder?.date)}</p></div>
              <div className={styles.infoItem}><label>طريقة الدفع</label><p>{viewOrder?.paymentMethod}</p></div>
              <div className={styles.infoItem}><label>الحالة</label><p><Badge text={viewOrder?.status} variant={STATUS_VARIANT[viewOrder?.status] || 'default'} /></p></div>
            </div>
          </div>

          <div className={styles.orderSummarySection}>
            <h3 className={styles.sectionTitle}>ملخص الطلب</h3>
            <div className={styles.itemsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>المنتج</span>
                <span className={styles.colQuantity}>الكمية</span>
                <span className={styles.colPrice}>السعر</span>
                <span className={styles.colTotal}>الإجمالي</span>
              </div>
              {(viewOrder?.items || []).map((item, index) => (
                <div key={index} className={styles.tableRow}>
                  <span className={styles.colProduct}>{item.product?.name || item.product_name || '—'}</span>
                  <span className={styles.colQuantity}>{toArabicNum(item.count || item.quantity || 0)}</span>
                  <span className={styles.colPrice}>{formatCurrency(item.product?.new_price || item.price || 0)}</span>
                  <span className={styles.colTotal}>{formatCurrency(item.sum_price || (item.product?.new_price || item.price || 0) * (item.count || item.quantity || 0))}</span>
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
