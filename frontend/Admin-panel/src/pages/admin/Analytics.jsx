import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Star,
  Download,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Button from '../../components/ui/Button.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import DateRangePicker from '../../components/ui/DateRangePicker.jsx';
import LineChartWrapper from '../../components/charts/LineChartWrapper.jsx';
import PieChartWrapper from '../../components/charts/PieChartWrapper.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import AreaChartWrapper from '../../components/charts/AreaChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  mockProducts,
  mockUsers,
  mockStores,
  monthlyRevenue,
} from '../../data/mockData.js';
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import { ensureFontsRegistered } from '../../utils/pdf/fonts.js';
import styles from './Analytics.module.css';

// ── Static chart data ────────────────────────────────────────────────

const salesTrendData = monthlyRevenue.map((item) => ({
  name: item.name,
  sales: item.value,
}));

const salesByCategoryData = [
  { name: 'فسيفساء',    value: 35, color: COLORS.blue },
  { name: 'خشب مطعّم',  value: 25, color: COLORS.gold },
  { name: 'زجاج منفوخ', value: 18, color: COLORS.purple },
  { name: 'بروكار',     value: 12, color: COLORS.orange },
  { name: 'نحاسيات',    value: 10, color: COLORS.red },
];

const geographicData = [
  { name: 'دمشق',      value: 48 },
  { name: 'حلب',       value: 27 },
  { name: 'اللاذقية',  value: 12 },
  { name: 'حمص',       value: 8 },
  { name: 'دير الزور', value: 5 },
];

const customerAcquisitionData = [
  { name: 'يناير',   new: 45,  returning: 120 },
  { name: 'فبراير',  new: 52,  returning: 135 },
  { name: 'مارس',   new: 61,  returning: 142 },
  { name: 'أبريل',  new: 58,  returning: 155 },
  { name: 'مايو',   new: 70,  returning: 168 },
  { name: 'يونيو',  new: 85,  returning: 175 },
  { name: 'يوليو',  new: 78,  returning: 180 },
  { name: 'أغسطس',  new: 92,  returning: 195 },
  { name: 'سبتمبر', new: 88,  returning: 210 },
  { name: 'أكتوبر', new: 95,  returning: 218 },
  { name: 'نوفمبر', new: 110, returning: 230 },
  { name: 'ديسمبر', new: 132, returning: 260 },
];

// Arabic month name → 0-indexed month — used to filter monthly series by date range.
const MONTH_INDEX = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  أبريل: 3,
  مايو: 4,
  يونيو: 5,
  يوليو: 6,
  أغسطس: 7,
  سبتمبر: 8,
  أكتوبر: 9,
  نوفمبر: 10,
  ديسمبر: 11,
};

// Single source of truth for KPI cards — read by the page header AND the PDF
// document so the two never drift out of sync.
const KPI_DATA = [
  {
    label: 'إيرادات الشهر',
    value: '١٢٥,٤٣٠ $',
    trend: '+١٢% عن الشهر السابق',
    icon: DollarSign,
    color: 'green',
    trendUp: true,
  },
  {
    label: 'معدل التحويل',
    value: '٣.٨%',
    trend: '+٠.٥%',
    icon: TrendingUp,
    color: 'blue',
    trendUp: true,
  },
  {
    label: 'متوسط قيمة الطلب',
    value: '٢٥٨ $',
    trend: '-٣%',
    icon: ShoppingBag,
    color: 'gold',
    trendUp: false,
  },
  {
    label: 'رضا العملاء',
    value: '٤.٧ / ٥',
    trend: '+٠.٢',
    icon: Star,
    color: 'orange',
    trendUp: true,
  },
];

// ── Product report data ──────────────────────────────────────────────
const productReportHeaders = [
  { key: 'name',        label: 'المنتج' },
  { key: 'store',       label: 'المتجر' },
  { key: 'category',    label: 'التصنيف', render: (val) => <Badge text={val} variant="default" /> },
  { key: 'reviewCount', label: 'المبيعات', render: (val) => toArabicNum(val) },
  { key: 'price',       label: 'الإيرادات', render: (val, row) => formatCurrency(val * row.reviewCount) },
  { key: 'rating',      label: 'التقييم', render: (val) => `${toArabicNum(val.toFixed(1))} / ٥` },
];

// ── Customer report data ─────────────────────────────────────────────
const customerReportData = mockUsers.filter((u) => u.role === 'عميل').map((u, i) => ({
  ...u,
  id: u.id,
  fullName: `${u.firstName} ${u.lastName}`,
  ordersCount: [3, 1, 5, 2][i % 4],
  totalSpend: [15800, 4800, 34200, 7000][i % 4],
  ltv: [25000, 5000, 60000, 12000][i % 4],
}));

const customerReportHeaders = [
  { key: 'fullName',    label: 'العميل' },
  { key: 'email',       label: 'البريد الإلكتروني' },
  { key: 'ordersCount', label: 'عدد الطلبات', render: (val) => toArabicNum(val) },
  { key: 'totalSpend',  label: 'إجمالي الإنفاق', render: (val) => formatCurrency(val) },
  { key: 'ltv',         label: 'القيمة الدائمة (LTV)', render: (val) => formatCurrency(val) },
];

// ── Store report data ────────────────────────────────────────────────
const storeReportHeaders = [
  { key: 'name',           label: 'المتجر' },
  { key: 'monthlyRevenue', label: 'الإيرادات', render: (val) => formatCurrency(val) },
  { key: 'ordersCount',    label: 'الطلبات', render: (val) => toArabicNum(val) },
  { key: 'productsCount',  label: 'المنتجات', render: (val) => toArabicNum(val) },
  { key: 'employeesCount', label: 'الموظفين', render: (val) => toArabicNum(val) },
  {
    key: 'status',
    label: 'الحالة',
    render: (val) => <Badge text={val} variant={val === 'نشط' ? 'success' : 'danger'} />,
  },
];

const REPORT_TABS = [
  { id: 'products',   label: 'تقرير المنتجات' },
  { id: 'customers',  label: 'تقرير العملاء' },
  { id: 'stores',     label: 'تقرير المتاجر' },
];

export default function AnalyticsPage() {
  const { showToast } = useToast();

  const [reportTab, setReportTab] = useState(() => 'products');
  const [storeFilter, setStore]   = useState(() => '');
  const [dateRange, setDateRange] = useState(() => ({ startDate: '', endDate: '' }));
  const [exporting, setExporting] = useState(false);

  const storeOptions = useMemo(() =>
    mockStores.map((s) => ({ value: s.name, label: s.name })),
    []
  );

  // Single derivation pass — produces the snapshot consumed by the PDF export
  // and (once we wire it through the chart components) the on-screen tables.
  // Currently the live page still renders the raw datasets; the report applies
  // both the store and date-range narrowings so the file matches user intent.
  const reportData = useMemo(() => {
    const selectedStoreLabel = storeFilter || 'كل المتاجر';

    // Month filter: keep only series entries whose Arabic month falls in the
    // [start, end] window. If no range is set, pass through. We compare the
    // calendar month from the date input against `MONTH_INDEX` so we can
    // ignore calendar year (the mock data isn't year-tagged).
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    const startMonth = start && !isNaN(start) ? start.getMonth() : null;
    const endMonth = end && !isNaN(end) ? end.getMonth() : null;

    const inRange = (monthName) => {
      const m = MONTH_INDEX[monthName];
      if (m === undefined) return true;
      if (startMonth === null && endMonth === null) return true;
      if (startMonth !== null && m < startMonth) return false;
      if (endMonth !== null && m > endMonth) return false;
      return true;
    };

    const salesTrendFiltered = salesTrendData.filter((row) => inRange(row.name));
    const customerAcquisitionFiltered = customerAcquisitionData.filter((row) =>
      inRange(row.name)
    );

    const productReportRows = storeFilter
      ? mockProducts.filter((row) => row.store === storeFilter)
      : mockProducts;
    const storeReportRows = storeFilter
      ? mockStores.filter((row) => row.name === storeFilter)
      : mockStores;

    return {
      selectedStoreLabel,
      salesTrendFiltered,
      customerAcquisitionFiltered,
      productReportRows,
      storeReportRows,
    };
  }, [storeFilter, dateRange.startDate, dateRange.endDate]);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    let url;
    try {
      await ensureFontsRegistered();
      // Lazy-load only the document module — `@react-pdf/renderer` itself is
      // already bundled in T1's split chunk via FinancialManagement, so a
      // dynamic import here would just defer code that's likely cached.
      const [{ pdf }, { default: AnalyticsReportPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./pdf/AnalyticsReportPdf.jsx'),
      ]);

      const blob = await pdf(
        <AnalyticsReportPdf
          kpis={KPI_DATA}
          storeLabel={reportData.selectedStoreLabel}
          dateRange={dateRange}
          salesTrend={reportData.salesTrendFiltered}
          salesByCategory={salesByCategoryData}
          geographic={geographicData}
          customerAcquisition={reportData.customerAcquisitionFiltered}
          generatedAt={new Date().toISOString()}
        />
      ).toBlob();

      const slug = (storeFilter || 'all').replace(/\s+/g, '-');
      const datePart = new Date().toISOString().slice(0, 10);
      const filename = `damascene-analytics-${slug}-${datePart}.pdf`;

      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      showToast({ message: 'تم تصدير التقرير بنجاح', type: 'success' });
    } catch (err) {
      // Surfacing a console trace keeps debugging tractable without leaking
      // anything sensitive — the toast is the user-facing channel.
      console.error('PDF export failed', err);
      showToast({
        message: 'فشل تصدير التقرير، يرجى المحاولة مرة أخرى',
        type: 'error',
      });
    } finally {
      if (url) URL.revokeObjectURL(url);
      setExporting(false);
    }
  }

  return (
    <div className={`${styles.page} page-enter`} role="main" aria-label="تحليلات النظام">
      {/* Top Filter Bar */}
      <div className={styles.topBar}>
        <div>
        <h1 className={styles.pageTitle}>التقارير والتحليلات</h1>
            <p className={styles.pageSubtitle}>استعراض مؤشرات الأداء والإحصائيات لاتخاذ قرارات مبنية على البيانات</p>
        </div>
        <div className={styles.topBarControls}>
          <SelectField
            label="المتجر"
            placeholder="جميع المتاجر"
            value={storeFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStore(() => val);
            }}
            options={storeOptions}
          />
          <DateRangePicker
            label="الفترة الزمنية"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <Button
            icon={Download}
            onClick={handleExport}
            loading={exporting}
            aria-label="تصدير تقرير التحليلات"
          >
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.statsRow}>
        {KPI_DATA.map((kpi) => (
          <StatCard
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            color={kpi.color}
            trend={kpi.trend}
            trendUp={kpi.trendUp}
          />
        ))}
      </div>

      {/* Charts Grid 2x2 */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <LineChartWrapper
            data={salesTrendData}
            lines={[{ key: 'sales', color: COLORS.gold, label: 'المبيعات' }]}
            title="اتجاه المبيعات"
            height={260}
            showDots={false}
            formatValue={(v) => `${Math.round(v / 1000)}k`}
          />
        </div>

        <div className={styles.chartCard}>
          <PieChartWrapper
            data={salesByCategoryData}
            title="المبيعات حسب التصنيف"
            height={260}
            donut
          />
        </div>

        <div className={styles.chartCard}>
          <BarChartWrapper
            data={geographicData}
            xKey="name"
            yKey="value"
            color={COLORS.navy}
            title="التوزيع الجغرافي"
            height={260}
            formatValue={(v) => `${toArabicNum(v)}%`}
          />
        </div>

        <div className={styles.chartCard}>
          <AreaChartWrapper
            data={customerAcquisitionData}
            areas={[
              { key: 'new',       color: COLORS.blue,  label: 'عملاء جدد' },
              { key: 'returning', color: COLORS.green, label: 'عملاء عائدون' },
            ]}
            title="اكتساب العملاء"
            height={260}
          />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className={styles.tablesSection}>
        <Tabs
          tabs={REPORT_TABS}
          activeTab={reportTab}
          onChange={(id) => setReportTab(() => id)}
          variant="underline"
        />

        <div className={styles.tableCard} role="region" aria-label="بيانات التقارير التفصيلية">
          {reportTab === 'products' ? (
            <DataTable
              headers={productReportHeaders}
              rows={reportData.productReportRows}
            />
          ) : null}
          {reportTab === 'customers' ? (
            <DataTable
              headers={customerReportHeaders}
              rows={customerReportData}
            />
          ) : null}
          {reportTab === 'stores' ? (
            <DataTable
              headers={storeReportHeaders}
              rows={reportData.storeReportRows}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
