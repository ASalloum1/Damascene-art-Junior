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

  const storeOptions = useMemo(() => 
    mockStores.map((s) => ({ value: s.name, label: s.name })),
    []
  );

  function handleExport() {
    showToast({ message: 'جاري تصدير التقرير...', type: 'info' });
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
          <Button 
            icon={Download} 
            onClick={handleExport}
            aria-label="تصدير تقرير التحليلات"
          >
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={DollarSign}
          label="إيرادات الشهر"
          value="١٢٥,٤٣٠ $"
          color="green"
          trend="+١٢% عن الشهر السابق"
          trendUp
        />
        <StatCard
          icon={TrendingUp}
          label="معدل التحويل"
          value="٣.٨%"
          color="blue"
          trend="+٠.٥%"
          trendUp
        />
        <StatCard
          icon={ShoppingBag}
          label="متوسط قيمة الطلب"
          value="٢٥٨ $"
          color="gold"
          trend="-٣%"
          trendUp={false}
        />
        <StatCard
          icon={Star}
          label="رضا العملاء"
          value="٤.٧ / ٥"
          color="orange"
          trend="+٠.٢"
          trendUp
        />
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
              rows={mockProducts}
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
              rows={mockStores}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
