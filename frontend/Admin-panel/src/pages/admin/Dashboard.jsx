import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Award,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import MiniBar from '../../components/ui/MiniBar.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import PieChartWrapper from '../../components/charts/PieChartWrapper.jsx';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getStatusLabel } from '../../utils/adminApi.js';
import styles from './Dashboard.module.css';

const ORDER_STATUS_VARIANT = {
  'مكتمل': 'success',
  'قيد التجهيز': 'info',
  'تم الشحن': 'purple',
  'جديد': 'warning',
  'ملغي': 'danger',
  'مرتجع': 'default',
};

const ACTIVITY_ACTION_VARIANT = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  login: 'default',
  approve: 'success',
  reject: 'danger',
};

const recentOrderHeaders = [
  { key: 'orderNumber', label: 'معرف الطلبية' },
  { key: 'store', label: 'رواق المتجر' },
  { key: 'customer', label: 'المقتني' },
  {
    key: 'productsCount',
    label: 'المقتنيات',
    render: (val) => `${toArabicNum(val)} مقتنى`,
  },
  {
    key: 'amount',
    label: 'القيمة الإجمالية',
    render: (val) => formatCurrency(val),
  },
  {
    key: 'status',
    label: 'مسار الطلب',
    render: (val) => (
      <Badge text={val} variant={ORDER_STATUS_VARIANT[val] || 'default'} />
    ),
  },
  {
    key: 'date',
    label: 'تاريخ الاقتناء',
    render: (val) => formatDate(val),
  },
];

const EMPTY_SUMMARY = {
  total_sales: 0,
  new_orders_today: 0,
  active_products: 0,
  new_customers: 0,
};

const NOOP = () => {};

function normalizeDailySales(items = []) {
  return items.map((item, index) => ({
    name: item.name || item.label || item.day || item.date || `يوم ${index + 1}`,
    value: Number(item.value || item.sales || item.total || 0),
  }));
}

function normalizeTopProducts(items = []) {
  const maxSold = Math.max(...items.map((item) => Number(item.sold || item.orders_count || item.count || 0)), 1);

  return items.map((item) => {
    const sold = Number(item.sold || item.orders_count || item.count || 0);
    return {
      id: item.id,
      name: item.name || item.product || 'منتج',
      sold,
      total: maxSold,
    };
  });
}

function normalizeOrders(items = []) {
  return items.map((order) => ({
    id: order.id,
    orderNumber: order.order_number || `#${order.id}`,
    store: order.store || order.store_name || order.shipping?.store || '—',
    customer: order.customer || order.customer_name || order.shipping?.recipient_name || '—',
    productsCount: order.products_count || order.items_count || order.items?.length || 0,
    amount: Number(order.order_total || order.amount || order.total_price || 0),
    status: order.status_label || getStatusLabel(order.status),
    date: order.created_at || order.updated_at,
  }));
}

function normalizeStatusChart(items = [], fallbackOrders = []) {
  if (items.length > 0) {
    return items.map((item) => ({
      name: item.name || item.label || getStatusLabel(item.status),
      value: Number(item.value || item.count || 0),
      color: item.color,
    }));
  }

  const grouped = fallbackOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

function normalizeActivities(items = []) {
  return items.map((activity, index) => ({
    id: activity.id || index,
    action: activity.action || activity.type || 'update',
    user: activity.user || activity.actor || activity.actor_name || 'النظام',
    details: activity.details || activity.description || activity.title || 'تم تسجيل نشاط جديد',
  }));
}

export default function DashboardPage({ onNavigate = NOOP }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesLast7Days, setSalesLast7Days] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      try {
        const [dashboardData, analyticsData] = await Promise.all([
          apiRequest(API_CONFIG.ENDPOINTS.dashboard),
          apiRequest(API_CONFIG.ENDPOINTS.analytics),
        ]);

        if (!mounted) {
          return;
        }

        const dashboardPayload = dashboardData?.data || {};
        const analyticsPayload = analyticsData?.data || {};
        const normalizedOrders = normalizeOrders(dashboardPayload.recent_orders || []);

        setSummary({ ...EMPTY_SUMMARY, ...(dashboardPayload.summary || {}) });
        setRecentOrders(normalizedOrders);
        setTopProducts(normalizeTopProducts(dashboardPayload.top_products || []));
        setSalesLast7Days(normalizeDailySales(dashboardPayload.sales_last_7_days || []));
        setOrdersByStatus(
          normalizeStatusChart(analyticsPayload.orders_by_status || [], normalizedOrders)
        );
        setRecentActivities(normalizeActivities(analyticsPayload.recent_activities || []));
      } catch (error) {
        console.error('Admin dashboard load failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenAllOrders = () => onNavigate('orders');
  const handleOpenAllOrdersKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenAllOrders();
    }
  };

  const safeTopProducts = useMemo(() => topProducts.slice(0, 5), [topProducts]);

  return (
    <div className={`${styles.page} page-enter`}>
      <section className={styles.statsRow} aria-label="إحصائيات عامة">
        <div className="stagger-1">
          <StatCard
            icon={DollarSign}
            label="إجمالي العوائد الملكية"
            value={formatCurrency(summary.total_sales)}
            color="green"
            subtitle="خلال الشهر الحالي"
          />
        </div>
        <div className="stagger-2">
          <StatCard
            icon={ShoppingCart}
            label="مجموع الطلبيات"
            value={toArabicNum(summary.new_orders_today)}
            color="blue"
            subtitle="طلبات جديدة اليوم"
          />
        </div>
        <div className="stagger-3">
          <StatCard
            icon={Users}
            label="إجمالي رواد المنصة"
            value={toArabicNum(summary.new_customers)}
            color="gold"
            subtitle="عملاء جدد"
          />
        </div>
        <div className="stagger-4">
          <StatCard
            icon={Store}
            label="الأروقة النشطة"
            value={toArabicNum(summary.active_products)}
            color="orange"
            subtitle="منتج نشط"
          />
        </div>
      </section>

      <div className={styles.row2}>
        <section className={styles.chartCard} aria-label="بيان العوائد">
          <BarChartWrapper
            data={salesLast7Days}
            xKey="name"
            yKey="value"
            color={COLORS.gold}
            title="مبيعات آخر ٧ أيام"
            height={280}
            formatValue={(v) => `${Math.round(v)}`}
          />
        </section>

        <section className={styles.topProductsCard} aria-label="المقتنيات الأكثر تفضيلاً">
          <header className={styles.cardHeader}>
            <Award size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>المقتنيات الأكثر تفضيلاً</h3>
          </header>
          <div className={styles.productsList}>
            {safeTopProducts.map((product, index) => (
              <div key={product.id || index} className={styles.productItem}>
                <span className={styles.productRank}>{toArabicNum(index + 1)}</span>
                <div className={styles.productBarWrapper}>
                  <MiniBar
                    label={product.name}
                    value={`${toArabicNum(product.sold)} عملية اقتناء`}
                    percentage={Math.round((product.sold / product.total) * 100)}
                    color={COLORS.gold}
                    height={6}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.row3}>
        <section className={styles.pieCard} aria-label="توزع الطلبيات">
          <PieChartWrapper
            data={ordersByStatus}
            title="توزع الطلبيات حسب المسار"
            height={280}
            donut
          />
        </section>

        <section className={styles.activitiesCard} aria-label="سجل النشاطات">
          <header className={styles.cardHeader}>
            <Clock size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>سجل النشاطات الأخير</h3>
          </header>
          <div className={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityMeta}>
                  <Badge
                    text={activity.action}
                    variant={ACTIVITY_ACTION_VARIANT[activity.action] || 'default'}
                    size="sm"
                  />
                  <span className={styles.activityUser}>{activity.user}</span>
                </div>
                <p className={styles.activityDetails}>{activity.details}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.tableCard} aria-label="أحدث الطلبيات">
        <header className={styles.tableCardHeader}>
          <div className={styles.cardHeader}>
            <ShoppingCart size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>أحدث الطلبيات</h3>
          </div>
          <div
            className={styles.viewAllLink}
            role="button"
            tabIndex={0}
            onClick={handleOpenAllOrders}
            onKeyDown={handleOpenAllOrdersKeyDown}
          >
            <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>عرض كافة الطلبيات</span>
          </div>
        </header>
        <DataTable
          headers={recentOrderHeaders}
          rows={recentOrders.slice(0, 5)}
          loading={loading}
        />
      </section>
    </div>
  );
}
