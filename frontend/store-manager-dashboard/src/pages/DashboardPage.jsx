import { useEffect, useMemo, useState } from 'react';
import styles from './pages.module.css';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import MiniBar from '../components/MiniBar';
import { API_CONFIG } from '../config/api.config.js';
import { apiRequest, getStatusLabel } from '../utils/storeApi.js';
import { formatCurrency, formatDate, toArabicNum } from '../utils/formatters.js';

function buildWeekRows(items = []) {
  return items.map((item, index) => ({
    label: item.name || item.label || item.day || item.date || `يوم ${index + 1}`,
    value: Number(item.value || item.sales || item.total || 0),
  }));
}

function buildTopProducts(items = []) {
  const maxSold = Math.max(...items.map((item) => Number(item.sold || item.orders_count || item.count || 0)), 1);

  return items.map((item) => ({
    id: item.id,
    name: item.name || item.product || 'منتج',
    sold: Number(item.sold || item.orders_count || item.count || 0),
    pct: Math.round((Number(item.sold || item.orders_count || item.count || 0) / maxSold) * 100),
  }));
}

function buildRecentOrders(items = []) {
  return items.slice(0, 5).map((order) => [
    order.order_number || `#${order.id}`,
    order.customer || order.customer_name || order.shipping?.recipient_name || '—',
    `${toArabicNum(order.items_count || order.products_count || order.product_carts?.length || 0)} عنصر`,
    formatCurrency(order.order_total || order.amount || order.total_price || 0),
    <Badge
      key={`status-${order.id}`}
      text={order.status_label || getStatusLabel(order.status)}
      variant="info"
    />,
    formatDate(order.created_at || order.updated_at),
  ]);
}

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total_sales: 0,
    new_orders_today: 0,
    active_products: 0,
    new_customers: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const data = await apiRequest(API_CONFIG.ENDPOINTS.dashboard);
        const payload = data?.data || {};

        if (!mounted) {
          return;
        }

        setSummary({
          total_sales: Number(payload.summary?.total_sales || 0),
          new_orders_today: Number(payload.summary?.new_orders_today || 0),
          active_products: Number(payload.summary?.active_products || 0),
          new_customers: Number(payload.summary?.new_customers || 0),
        });
        setTopProducts(buildTopProducts(payload.top_products || []));
        setRecentOrders(buildRecentOrders(payload.recent_orders || []));
        setWeekData(buildWeekRows(payload.sales_last_7_days || []));
      } catch (error) {
        console.error('Store dashboard load failed:', error);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const maxWeekValue = useMemo(
    () => Math.max(...weekData.map((item) => item.value), 1),
    [weekData]
  );

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="dollar" label="إجمالي المبيعات" value={formatCurrency(summary.total_sales)} accentVariant="success" sub="هذا الشهر" /></div>
        <div className="stagger-2"><StatCard icon="orders" label="طلبات جديدة" value={toArabicNum(summary.new_orders_today)} accentVariant="info" sub="اليوم" /></div>
        <div className="stagger-3"><StatCard icon="products" label="منتجات نشطة" value={toArabicNum(summary.active_products)} accentVariant="primary" sub="إجمالي" /></div>
        <div className="stagger-4"><StatCard icon="users" label="عملاء جدد" value={toArabicNum(summary.new_customers)} accentVariant="warning" sub="هذا الأسبوع" /></div>
      </div>

      <div className={styles.grid2}>
        <section className={`${styles.chartCard} stagger-2`}>
          <h3 className={styles.cardTitle}>المبيعات الأخيرة (آخر ٧ أيام)</h3>
          <div className={styles.barChart}>
            {weekData.map((item, index) => (
              <div key={index} className={styles.barCol}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${Math.max(18, Math.round((item.value / maxWeekValue) * 100))}%`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
                <span className={styles.barLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.productListCard} stagger-3`}>
          <h3 className={styles.cardTitle}>المنتجات الأكثر مبيعاً</h3>
          <div className={styles.productList}>
            {topProducts.map((product, index) => (
              <div key={product.id || index} className={styles.productRow} style={{ animationDelay: `${index * 0.1}s` }}>
                <span className={styles.rank} style={{ color: '#c5a059', fontWeight: 'bold', minWidth: '20px' }}>{index + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>{product.name}</div>
                  <MiniBar pct={product.pct} variant="primary" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>{toArabicNum(product.sold)} قطعة</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={`${styles.tableCard} stagger-4`}>
        <h3 className={styles.cardTitle}>أحدث الطلبيات</h3>
        <Table
          headers={['رقم الطلب', 'العميل', 'المنتجات', 'المبلغ', 'الحالة', 'التاريخ']}
          rows={recentOrders}
        />
      </section>
    </div>
  );
}
