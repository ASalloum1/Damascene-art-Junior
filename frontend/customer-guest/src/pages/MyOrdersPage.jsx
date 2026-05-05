import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import styles from './MyOrdersPage.module.css';

const AR_LOCALE = 'ar-EG';

function toArabicDigits(value) {
  if (value === null || value === undefined) return '';
  try {
    return Number(value).toLocaleString(AR_LOCALE);
  } catch {
    return String(value);
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(AR_LOCALE, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTotal(total) {
  const n = Number(total);
  if (Number.isNaN(n)) return toArabicDigits(0);
  return n.toLocaleString(AR_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_MAP = {
  pending:   { variant: 'warning', label: 'قيد المراجعة' },
  paid:      { variant: 'neutral', label: 'مدفوع' },
  shipped:   { variant: 'neutral', label: 'قيد الشحن' },
  delivered: { variant: 'success', label: 'تم التسليم' },
  cancelled: { variant: 'error',   label: 'ملغي' },
};

function mapStatus(status) {
  return STATUS_MAP[status] ?? { variant: 'neutral', label: status || 'الحالة غير معروفة' };
}

export function MyOrdersPage({ onNavigate }) {
  const { baseUrl, bearerToken } = useApi();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/api/customers/orders`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${bearerToken}`,
          },
        });
        if (!res.ok) {
          // Graceful: any 4xx/5xx ⇒ empty state, no error banner.
          if (!cancelled) setOrders([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.data) ? data.data : [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.created_at ?? b.date ?? 0).getTime() -
            new Date(a.created_at ?? a.date ?? 0).getTime()
        );
        if (!cancelled) setOrders(sorted);
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!cancelled) setError('تعذّر الاتصال بالخادم. حاول مرة أخرى.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [baseUrl, bearerToken]);

  return (
    <div className={styles.page}>
      <SectionHeader title="طلباتي" subtitle="تتبّع حالة طلباتك السابقة" />

      <div className={styles.card}>
        <h3 className={styles.cardHeading}>
          <Package size={18} />
          سجل الطلبات
        </h3>

        {isLoading ? (
          <p className={styles.stateMsg}>جاري تحميل طلباتك...</p>
        ) : error ? (
          <p className={styles.errorMsg}>{error}</p>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>لم تقم بأي طلب بعد</p>
            <p className={styles.emptyDesc}>اكتشف مجموعتنا وابدأ تجربتك الأولى.</p>
            <Button variant="primary" onClick={() => onNavigate?.('shop')}>
              تصفّح المتجر
            </Button>
          </div>
        ) : (
          <ul className={styles.list}>
            {orders.map((order) => {
              const { variant, label } = mapStatus(order.status);
              return (
                <li key={order.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemHeader}>
                      <span className={styles.orderNumber}>{order.order_number}</span>
                      <Badge text={label} variant={variant} />
                    </div>
                    <div className={styles.itemMeta}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>التاريخ:</span>
                        <span className={styles.metaValue}>{formatDate(order.created_at ?? order.date)}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>الإجمالي:</span>
                        <span className={styles.metaTotal}>{formatTotal(order.total)} ل.س</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: navigate to order details once backend lands
                      console.log('View order details for', order.id);
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
