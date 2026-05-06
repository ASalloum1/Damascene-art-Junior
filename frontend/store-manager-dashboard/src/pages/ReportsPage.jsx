// ReportsPage — Store-Manager Reports & Statistics surface.
//
// Mirrors the Admin Analytics page (KPIs + 4 charts + 3 tabbed tables +
// PDF export) but scopes everything to the auth'd manager's store. The
// store filter is intentionally absent — the backend derives the store id
// from the bearer token (spec §4 backend), and the client never sends one.
//
// All recharts wrappers and the @react-pdf/renderer document are
// dynamically imported so the initial KPI band can paint without waiting
// on either heavy bundle.

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Download, RefreshCw, Sparkles } from 'lucide-react';

import StatCard from '../components/StatCard.jsx';
import Button from '../components/ui/Button.jsx';
import DateRangePicker from '../components/ui/DateRangePicker.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import { getReports, isMockMode } from '../api/reportsApi.js';
import {
  toArabicNum,
  formatCurrency,
  formatDate,
} from '../utils/formatters.js';
import { COLORS } from '../constants/colors.js';

import styles from './ReportsPage.module.css';

// ── Lazy chunks ───────────────────────────────────────────────────────
// Charts and PDF live in separate bundles so the KPI band paints first.
const LineChartWrapper = lazy(() =>
  import('../components/charts/LineChartWrapper.jsx'),
);
const PieChartWrapper = lazy(() =>
  import('../components/charts/PieChartWrapper.jsx'),
);
const BarChartWrapper = lazy(() =>
  import('../components/charts/BarChartWrapper.jsx'),
);
const AreaChartWrapper = lazy(() =>
  import('../components/charts/AreaChartWrapper.jsx'),
);

// ── Tab definitions ───────────────────────────────────────────────────
const REPORT_TABS = [
  { id: 'products', label: 'تقرير المنتجات' },
  { id: 'customers', label: 'تقرير العملاء' },
  { id: 'orders', label: 'تقرير الطلبات' },
];

// ── Module-scope render helpers (no inline components) ───────────────
function renderCategoryCell(value) {
  return <Badge text={value} variant="default" />;
}

function renderRatingCell(value) {
  if (value === null || value === undefined) return '—';
  return `${toArabicNum(Number(value).toFixed(1))} / ٥`;
}

function renderArabicNumberCell(value) {
  return value === null || value === undefined ? '—' : toArabicNum(value);
}

function renderCurrencyCell(value) {
  return formatCurrency(value);
}

function renderDateCell(value) {
  return formatDate(value);
}

function statusVariant(status) {
  switch (status) {
    case 'مكتمل':
    case 'تم الشحن':
      return 'success';
    case 'قيد التجهيز':
    case 'جديد':
      return 'info';
    case 'ملغي':
      return 'danger';
    case 'مرتجع':
      return 'warning';
    default:
      return 'default';
  }
}

function renderStatusCell(value) {
  return <Badge text={value} variant={statusVariant(value)} />;
}

const PRODUCT_HEADERS = [
  { key: 'name', label: 'المنتج' },
  { key: 'category', label: 'التصنيف', render: renderCategoryCell },
  { key: 'sold', label: 'المبيعات', render: renderArabicNumberCell },
  { key: 'revenue', label: 'الإيرادات', render: renderCurrencyCell },
  { key: 'rating', label: 'التقييم', render: renderRatingCell },
];

const CUSTOMER_HEADERS = [
  { key: 'fullName', label: 'العميل' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'ordersCount', label: 'عدد الطلبات', render: renderArabicNumberCell },
  { key: 'totalSpend', label: 'إجمالي الإنفاق', render: renderCurrencyCell },
  { key: 'ltv', label: 'القيمة الدائمة', render: renderCurrencyCell },
];

const ORDER_HEADERS = [
  { key: 'orderNumber', label: 'رقم الطلب' },
  { key: 'customer', label: 'العميل' },
  { key: 'amount', label: 'المبلغ', render: renderCurrencyCell },
  { key: 'paymentMethod', label: 'طريقة الدفع' },
  { key: 'status', label: 'الحالة', render: renderStatusCell },
  { key: 'date', label: 'التاريخ', render: renderDateCell },
];

// ── Helpers ──────────────────────────────────────────────────────────
function isoDay(date) {
  // Format as YYYY-MM-DD in local time (matches what date inputs return).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultDateRange() {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 30);
  return { startDate: isoDay(past), endDate: isoDay(today) };
}

function slugify(name) {
  if (!name) return 'store';
  // Keep Arabic letters and word characters; collapse whitespace and other
  // punctuation to single hyphens.
  return String(name)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/[\s.,;:!?()[\]{}]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// ── Chart skeletons / inline error ───────────────────────────────────
function ChartSkeleton() {
  return (
    <div className={styles.chartSkeleton} aria-hidden="true">
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonChart} />
    </div>
  );
}

function ChartError({ onRetry }) {
  return (
    <div className={styles.chartErrorWrap} role="alert">
      <h4 className={styles.chartErrorTitle}>تعذّر تحميل الرسم</h4>
      <p className={styles.chartErrorMsg}>
        حدث خلل أثناء جلب البيانات. حاول مجددًا.
      </p>
      <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
        إعادة المحاولة
      </Button>
    </div>
  );
}

// ── KPI band (paints first, no Suspense gate) ────────────────────────
function KpiBand({ kpis, isLoading }) {
  // Show pleasant placeholders while the first request resolves.
  const placeholder = isLoading || !kpis;
  const revenue = placeholder ? '—' : formatCurrency(kpis.revenue);
  const orders = placeholder ? '—' : toArabicNum(kpis.ordersCount);
  const aov = placeholder ? '—' : formatCurrency(kpis.avgOrderValue);
  const rating = placeholder
    ? '—'
    : `${toArabicNum(Number(kpis.avgRating).toFixed(1))} / ٥`;

  return (
    <div className={styles.statsRow}>
      <StatCard
        icon="dollar"
        label="إيرادات الفترة"
        value={revenue}
        accentVariant="success"
      />
      <StatCard
        icon="orders"
        label="عدد الطلبات"
        value={orders}
        accentVariant="info"
      />
      <StatCard
        icon="trendUp"
        label="متوسط قيمة الطلب"
        value={aov}
        accentVariant="primary"
      />
      <StatCard
        icon="reviews"
        label="متوسط التقييم"
        value={rating}
        accentVariant="warning"
      />
    </div>
  );
}

// ── Single chart card wrapper ────────────────────────────────────────
function ChartCard({ children, isLoading, isEmpty, error, onRetry }) {
  if (error) {
    return <div className={styles.chartCard}><ChartError onRetry={onRetry} /></div>;
  }
  if (isLoading) {
    return <div className={styles.chartCard}><ChartSkeleton /></div>;
  }
  if (isEmpty) {
    return (
      <div className={styles.chartCard}>
        <EmptyState
          icon={Sparkles}
          title="لا توجد بيانات لهذه الفترة"
          description="جرّب توسيع نطاق التاريخ أو العودة لاحقًا."
        />
      </div>
    );
  }
  return (
    <div className={styles.chartCard}>
      <Suspense fallback={<ChartSkeleton />}>{children}</Suspense>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { showToast } = useToast();
  const { token, storeId, storeName, isLoading: authLoading } = useAuth();

  // Date range — lazy init so it computes once.
  const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange);

  // Split per-section state per Vercel rules (rerender-split-combined-hooks).
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state (lazy init, primitive).
  const [reportTab, setReportTab] = useState(() => 'products');

  // Track latest fetch so a stale resolution can't overwrite a newer one.
  const fetchIdRef = useRef(0);

  const loadReports = useCallback(() => {
    const id = ++fetchIdRef.current;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getReports({
      from: startDate,
      to: endDate,
      storeId,
      token,
      signal: controller.signal,
    })
      .then((result) => {
        if (id !== fetchIdRef.current) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (id !== fetchIdRef.current) return;
        if (err && err.name === 'AbortError') return;
        setError(err.message || 'تعذّر تحميل التقارير');
        setLoading(false);
        showToast({
          message: 'تعذّر تحميل التقارير. حاول مجددًا.',
          type: 'error',
        });
      });

    return () => controller.abort();
  }, [startDate, endDate, storeId, token, showToast]);

  useEffect(() => {
    if (authLoading) return;
    const cancel = loadReports();
    return cancel;
  }, [authLoading, loadReports]);

  // ── Memoized chart configs (primitive deps) ────────────────────────
  const salesByCategoryColored = useMemo(() => {
    if (!data || !Array.isArray(data.salesByCategory)) return [];
    const palette = [
      COLORS.gold,
      COLORS.blue,
      COLORS.green,
      COLORS.orange,
      COLORS.purple,
      COLORS.red,
    ];
    return data.salesByCategory.map((entry, i) => ({
      ...entry,
      color: entry.color || palette[i % palette.length],
    }));
  }, [data]);

  // ── PDF export ─────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!data) {
      showToast({
        message: 'لا توجد بيانات للتصدير بعد، انتظر قليلًا.',
        type: 'warning',
      });
      return;
    }
    setExporting(true);
    showToast({ message: 'جاري تجهيز التقرير…', type: 'info' });

    try {
      // Lazy import keeps @react-pdf/renderer (~700KB) out of the main bundle.
      const [{ pdf }, { default: ReportPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../utils/pdf/ReportPdfDocument.jsx'),
      ]);

      const generatedAt = new Date().toISOString();
      const document = (
        <ReportPdfDocument
          storeName={storeName}
          from={startDate}
          to={endDate}
          generatedAt={generatedAt}
          kpis={data.kpis}
          products={data.products}
          customers={data.customers}
          orders={data.orders}
        />
      );

      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `report-${slugify(storeName)}-${endDate}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      // Defer revoke so the browser has a tick to start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast({ message: 'تم تصدير التقرير', type: 'success' });
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast({ message: 'تعذّر تصدير التقرير', type: 'error' });
    } finally {
      setExporting(false);
    }
  }, [data, storeName, startDate, endDate, showToast]);

  // ── Derived counts for tab badge ───────────────────────────────────
  const productsCount = data && data.products ? data.products.length : 0;
  const customersCount = data && data.customers ? data.customers.length : 0;
  const ordersCount = data && data.orders ? data.orders.length : 0;

  const tabs = useMemo(
    () => [
      { id: 'products', label: 'تقرير المنتجات', count: productsCount },
      { id: 'customers', label: 'تقرير العملاء', count: customersCount },
      { id: 'orders', label: 'تقرير الطلبات', count: ordersCount },
    ],
    [productsCount, customersCount, ordersCount],
  );

  // Active tab's row source.
  const activeRows =
    reportTab === 'products'
      ? data?.products || []
      : reportTab === 'customers'
      ? data?.customers || []
      : data?.orders || [];

  const activeHeaders =
    reportTab === 'products'
      ? PRODUCT_HEADERS
      : reportTab === 'customers'
      ? CUSTOMER_HEADERS
      : ORDER_HEADERS;

  const activeSubtitle =
    reportTab === 'products'
      ? 'أداء المنتجات في متجرك خلال الفترة المحددة'
      : reportTab === 'customers'
      ? 'العملاء الذين تعاملوا معك خلال الفترة المحددة'
      : 'الطلبات المسجّلة خلال الفترة المحددة';

  return (
    <div className={`${styles.page} page-enter`} role="main" aria-label="تقارير المتجر">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.topBarHead}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>التقارير والتحليلات</h1>
            <span className={styles.storePill} aria-label={`متجر ${storeName}`}>
              <span className={styles.storePillDot} aria-hidden="true" />
              تقرير متجر: {storeName || '—'}
            </span>
            {isMockMode ? (
              <span className={styles.modeBadge} title="بيانات تجريبية">
                وضع المعاينة
              </span>
            ) : null}
          </div>
          <p className={styles.pageSubtitle}>
            استعراض مؤشرات الأداء والمبيعات والعملاء الخاصة بمتجرك خلال الفترة
            المحددة. صدّر تقريرًا كاملًا بصيغة PDF بضغطة واحدة.
          </p>
        </div>
        <div className={styles.topBarControls}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: s, endDate: e }) =>
              setDateRange({ startDate: s, endDate: e })
            }
          />
          <Button
            icon={Download}
            onClick={handleExport}
            loading={exporting}
            aria-label="تصدير تقرير المتجر بصيغة PDF"
          >
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* ── KPI Row (paints first) ──────────────────────────────────── */}
      <KpiBand kpis={data?.kpis} isLoading={loading || authLoading} />

      {/* ── Charts Grid ─────────────────────────────────────────────── */}
      <div className={styles.chartsGrid}>
        <ChartCard
          isLoading={loading}
          isEmpty={data && data.salesTrend.length === 0}
          error={error}
          onRetry={loadReports}
        >
          <LineChartWrapper
            data={data ? data.salesTrend : []}
            lines={[{ key: 'sales', color: COLORS.gold, label: 'المبيعات' }]}
            title="اتجاه المبيعات"
            height={260}
            showDots={false}
            formatValue={(v) => `${Math.round(v / 1000)}k`}
          />
        </ChartCard>

        <ChartCard
          isLoading={loading}
          isEmpty={data && salesByCategoryColored.length === 0}
          error={error}
          onRetry={loadReports}
        >
          <PieChartWrapper
            data={salesByCategoryColored}
            title="المبيعات حسب التصنيف"
            height={260}
            donut
          />
        </ChartCard>

        <ChartCard
          isLoading={loading}
          isEmpty={data && data.geographic.length === 0}
          error={error}
          onRetry={loadReports}
        >
          <BarChartWrapper
            data={data ? data.geographic : []}
            xKey="name"
            yKey="value"
            color={COLORS.navy}
            title="التوزيع الجغرافي"
            height={260}
            formatValue={(v) => `${toArabicNum(v)}%`}
          />
        </ChartCard>

        <ChartCard
          isLoading={loading}
          isEmpty={data && data.customerAcquisition.length === 0}
          error={error}
          onRetry={loadReports}
        >
          <AreaChartWrapper
            data={data ? data.customerAcquisition : []}
            areas={[
              { key: 'new', color: COLORS.blue, label: 'عملاء جدد' },
              { key: 'returning', color: COLORS.green, label: 'عملاء عائدون' },
            ]}
            title="اكتساب العملاء"
            height={260}
          />
        </ChartCard>
      </div>

      {/* ── Detail Tables ───────────────────────────────────────────── */}
      <div className={styles.tablesSection}>
        <div className={styles.tablesHead}>
          <div className={styles.tablesTitleBlock}>
            <h2 className={styles.tablesTitle}>التقارير التفصيلية</h2>
            <p className={styles.tablesSubtitle}>{activeSubtitle}</p>
          </div>
          <span className={styles.tablesCount}>
            {toArabicNum(activeRows.length)} سجلًا
          </span>
        </div>
        <Tabs
          tabs={tabs}
          activeTab={reportTab}
          onChange={(id) => setReportTab(id)}
          variant="underline"
        />
        <div
          className={styles.tableCard}
          role="region"
          aria-label="بيانات التقارير التفصيلية"
        >
          <DataTable
            headers={activeHeaders}
            rows={activeRows}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
