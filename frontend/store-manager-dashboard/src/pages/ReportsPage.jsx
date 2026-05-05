import { useEffect, useMemo, useState } from 'react';
import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import MiniBar from '../components/MiniBar';
import { API_CONFIG } from '../config/api.config.js';
import { apiRequest } from '../utils/storeApi.js';
import { formatCurrency, toArabicNum } from '../utils/formatters.js';

export function ReportsPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [performance, setPerformance] = useState({
    monthly_revenue: 0,
    average_order_value: 0,
    return_rate: 0,
    customer_satisfaction: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        const data = await apiRequest(API_CONFIG.ENDPOINTS.reports);
        const payload = data?.data || {};

        if (!mounted) {
          return;
        }

        setMonthlyRevenue(payload.monthly_revenue || []);
        setCategorySales(payload.category_sales || []);
        setPerformance({
          monthly_revenue: Number(payload.performance?.monthly_revenue || 0),
          average_order_value: Number(payload.performance?.average_order_value || 0),
          return_rate: Number(payload.performance?.return_rate || 0),
          customer_satisfaction: Number(payload.performance?.customer_satisfaction || 0),
        });
      } catch (error) {
        console.error('Reports load failed:', error);
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedRevenue = useMemo(
    () =>
      monthlyRevenue.map((item, index) => ({
        label: item.name || item.label || item.month || `${index + 1}`,
        value: Number(item.value || item.total || 0),
      })),
    [monthlyRevenue]
  );

  const maxRevenue = useMemo(
    () => Math.max(...normalizedRevenue.map((item) => item.value), 1),
    [normalizedRevenue]
  );

  const normalizedCategories = useMemo(
    () =>
      categorySales.map((item) => ({
        cat: item.name || item.label || item.category || 'تصنيف',
        pct: Number(item.value || item.percent || item.percentage || 0),
      })),
    [categorySales]
  );

  const metrics = [
    { label: 'إيرادات الشهر', value: formatCurrency(performance.monthly_revenue), change: '', up: true },
    { label: 'متوسط قيمة الطلب', value: formatCurrency(performance.average_order_value), change: '', up: true },
    { label: 'معدل الإرجاع', value: `${toArabicNum(performance.return_rate)}%`, change: '', up: false },
    { label: 'رضا العملاء', value: `${toArabicNum(performance.customer_satisfaction)} / ٥`, change: '', up: true },
  ];

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="التقارير والإحصائيات" />
      <div className={styles.grid2}>
        <PageCard>
          <h3 className={styles.cardTitle}>تقرير المبيعات الشهرية</h3>
          <div className={styles.monthChart}>
            {normalizedRevenue.map((item, index) => (
              <div key={index} className={styles.monthCol}>
                <div
                  className={`${styles.monthBar} ${index === normalizedRevenue.length - 1 ? styles.current : styles.other}`}
                  style={{ height: Math.max(22, Math.round((item.value / maxRevenue) * 120)) }}
                  role="img"
                  aria-label={`${item.label}: ${item.value}`}
                />
                <span className={styles.monthLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </PageCard>
        <PageCard>
          <h3 className={styles.cardTitle}>المبيعات حسب التصنيف</h3>
          {normalizedCategories.map((category, index) => (
            <div key={index} className={styles.catRow}>
              <span className={styles.catName}>{category.cat}</span>
              <div style={{ flex: 1 }}>
                <MiniBar pct={Math.max(5, category.pct)} variant="primary" />
              </div>
              <span className={styles.catPct}>{toArabicNum(category.pct)}%</span>
            </div>
          ))}
        </PageCard>
      </div>
      <PageCard>
        <h3 className={styles.cardTitle}>ملخص الأداء</h3>
        <div className={styles.grid4}>
          {metrics.map((metric, index) => (
            <div key={index} className={styles.metricCard}>
              <div className={styles.metricLabel}>{metric.label}</div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={`${styles.metricChange} ${metric.up ? styles.up : styles.down}`}>{metric.change || '—'}</div>
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}

export default ReportsPage;
