import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Star,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Button from '../../components/ui/Button.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import PieChartWrapper from '../../components/charts/PieChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getStatusLabel } from '../../utils/adminApi.js';
import styles from './Analytics.module.css';

const REPORT_TABS = [
  { id: 'products', label: 'أفضل المنتجات' },
  { id: 'activities', label: 'آخر النشاطات' },
];

function normalizeRevenue(items = []) {
  return items.map((item, index) => ({
    name: item.name || item.label || item.month || `${index + 1}`,
    value: Number(item.value || item.total || 0),
  }));
}

function normalizeStatuses(items = []) {
  return items.map((item) => ({
    name: item.name || item.label || getStatusLabel(item.status),
    value: Number(item.value || item.count || 0),
    color: item.color,
  }));
}

function normalizeProducts(items = []) {
  return items.map((item) => ({
    id: item.id,
    name: item.name || item.product || 'منتج',
    store: item.store?.name || item.store || '—',
    category: item.category?.name || item.category || '—',
    sold: Number(item.sold || item.orders_count || item.count || 0),
    revenue: Number(item.revenue || item.total_sales || 0),
    rating: Number(item.rating || item.average_rate || 0),
  }));
}

function normalizeActivities(items = []) {
  return items.map((item, index) => ({
    id: item.id || index,
    actor: item.user || item.actor || item.actor_name || 'النظام',
    action: item.action || item.type || 'update',
    details: item.details || item.description || item.title || 'تم تسجيل نشاط جديد',
    createdAt: item.created_at || item.timestamp,
  }));
}

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [reportTab, setReportTab] = useState('products');
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.analytics);
      const payload = data?.data || {};
      setMonthlyRevenue(normalizeRevenue(payload.monthly_revenue || []));
      setOrdersByStatus(normalizeStatuses(payload.orders_by_status || []));
      setTopProducts(normalizeProducts(payload.top_products || []));
      setRecentActivities(normalizeActivities(payload.recent_activities || []));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل التحليلات', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalRevenue = useMemo(
    () => monthlyRevenue.reduce((sum, item) => sum + item.value, 0),
    [monthlyRevenue]
  );
  const totalOrders = useMemo(
    () => ordersByStatus.reduce((sum, item) => sum + item.value, 0),
    [ordersByStatus]
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const averageRating = topProducts.length > 0
    ? topProducts.reduce((sum, product) => sum + product.rating, 0) / topProducts.length
    : 0;

  const productHeaders = [
    { key: 'name', label: 'المنتج' },
    { key: 'store', label: 'المتجر' },
    { key: 'category', label: 'التصنيف' },
    { key: 'sold', label: 'المبيعات', render: (val) => toArabicNum(val) },
    { key: 'revenue', label: 'الإيرادات', render: (val) => formatCurrency(val) },
    { key: 'rating', label: 'التقييم', render: (val) => `${toArabicNum(val.toFixed(1))} / ٥` },
  ];

  const activityHeaders = [
    { key: 'actor', label: 'الفاعل' },
    { key: 'action', label: 'الإجراء' },
    { key: 'details', label: 'التفاصيل' },
    { key: 'createdAt', label: 'التاريخ', render: (val) => formatDate(val) },
  ];

  return (
    <div className={`${styles.page} page-enter`} role="main" aria-label="تحليلات النظام">
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>التقارير والتحليلات</h1>
          <p className={styles.pageSubtitle}>استعراض مؤشرات الأداء والإحصائيات لاتخاذ قرارات مبنية على البيانات</p>
        </div>
        <div className={styles.topBarControls}>
          <Button onClick={loadAnalytics}>تحديث البيانات</Button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <StatCard icon={DollarSign} label="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} color="green" trend="حي" />
        <StatCard icon={TrendingUp} label="عدد الطلبات" value={toArabicNum(totalOrders)} color="blue" />
        <StatCard icon={ShoppingBag} label="متوسط قيمة الطلب" value={formatCurrency(averageOrderValue)} color="gold" />
        <StatCard icon={Star} label="متوسط تقييم المنتجات" value={`${toArabicNum(averageRating.toFixed(1))} / ٥`} color="orange" />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <BarChartWrapper
            data={monthlyRevenue}
            xKey="name"
            yKey="value"
            color={COLORS.gold}
            title="الإيرادات الشهرية"
            height={260}
            formatValue={(value) => `${Math.round(value)}`}
          />
        </div>

        <div className={styles.chartCard}>
          <PieChartWrapper
            data={ordersByStatus}
            title="توزيع الطلبات حسب الحالة"
            height={260}
            donut
          />
        </div>
      </div>

      <div className={styles.tablesSection}>
        <Tabs
          tabs={REPORT_TABS}
          activeTab={reportTab}
          onChange={setReportTab}
          variant="underline"
        />

        <div className={styles.tableCard}>
          {reportTab === 'products' ? (
            <DataTable headers={productHeaders} rows={topProducts} />
          ) : null}
          {reportTab === 'activities' ? (
            <DataTable headers={activityHeaders} rows={recentActivities} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
