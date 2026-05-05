import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/api.config.js';
import { apiRequest, getStatusLabel } from '../utils/storeApi.js';
import { formatDate, toArabicNum } from '../utils/formatters.js';

export function InventoryPage() {
  const [summary, setSummary] = useState({
    total_products: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadInventory() {
      try {
        const data = await apiRequest(API_CONFIG.ENDPOINTS.inventory);
        const payload = data?.data || {};

        if (!mounted) {
          return;
        }

        setSummary({
          total_products: Number(payload.summary?.total_products || 0),
          low_stock_count: Number(payload.summary?.low_stock_count || 0),
          out_of_stock_count: Number(payload.summary?.out_of_stock_count || 0),
        });
        setAlerts(payload.alerts || []);
        setMovements(payload.movements || []);
      } catch (error) {
        console.error('Inventory load failed:', error);
      }
    }

    loadInventory();

    return () => {
      mounted = false;
    };
  }, []);

  const alertRows = useMemo(
    () =>
      alerts.map((item) => [
        item.product_name || '—',
        item.category || '—',
        toArabicNum(item.current_quantity || 0),
        toArabicNum(item.minimum_quantity || 0),
        <Badge
          key={`alert-${item.product_id}`}
          text={item.status_label || getStatusLabel(item.status)}
          variant={item.status === 'out_of_stock' ? 'error' : 'warning'}
        />,
        '—',
      ]),
    [alerts]
  );

  const movementRows = useMemo(
    () =>
      movements.map((item) => [
        formatDate(item.date || item.created_at),
        item.product_name || item.product || '—',
        item.type || item.movement_type || '—',
        `${item.quantity > 0 ? '+' : ''}${toArabicNum(item.quantity || 0)}`,
        item.by || item.actor || item.actor_name || 'النظام',
      ]),
    [movements]
  );

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="إدارة المخزون" />
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="products" label="إجمالي المنتجات" value={toArabicNum(summary.total_products)} accentVariant="info" sub="في المخزن" /></div>
        <div className="stagger-2"><StatCard icon="warning" label="مخزون منخفض" value={toArabicNum(summary.low_stock_count)} accentVariant="warning" sub="يحتاج تعبئة" /></div>
        <div className="stagger-3"><StatCard icon="xCircle" label="نفد المخزون" value={toArabicNum(summary.out_of_stock_count)} accentVariant="error" sub="غير متوفر" /></div>
      </div>
      <div className="stagger-2">
        <PageCard>
          <h3 className={styles.cardTitle}>تنبيهات المخزون</h3>
          <Table
            headers={['المنتج', 'التصنيف', 'الكمية الحالية', 'الحد الأدنى', 'الحالة', 'إجراء']}
            rows={alertRows}
          />
        </PageCard>
      </div>
      <div className="stagger-3">
        <PageCard>
          <h3 className={styles.cardTitle}>سجل حركة المخزون</h3>
          <Table
            headers={['التاريخ', 'المنتج', 'النوع', 'الكمية', 'بواسطة']}
            rows={movementRows}
          />
        </PageCard>
      </div>
    </div>
  );
}

export default InventoryPage;
