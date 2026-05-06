// Reports & Analytics PDF document.
//
// One <Document> with a single A4 page that wraps. Composition top-to-bottom:
//   1. Brand header + meta strip (date + selected store + active date range)
//   2. KPI grid (4 navy/gold cards, derived from the same KPI_DATA the page renders)
//   3. Sales-trend table (filtered by date range when set)
//   4. Sales-by-category table (percentage breakdown)
//   5. Geographic-distribution table
//   6. Customer-acquisition table (filtered by date range when set) — wraps onto
//      a fresh page when needed via `break`
//   7. Fixed footer (copyright + page X of Y)
//
// Design notes:
//   - No charts are rendered: rasterizing Recharts SVGs into @react-pdf is
//     fragile (font-shaping + viewBox quirks) and would balloon the PDF.
//     The tables carry the same numeric truth as the on-screen charts.
//   - Lucide icons cannot render here — KPI accents come from the shared
//     `kpiCardInner` top-bar style instead.
//   - All numbers go through `formatCurrency` / `toArabicNum` so digits are
//     Eastern Arabic everywhere.

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { formatCurrency, formatDate, toArabicNum } from '../../../utils/formatters.js';
import { styles, PDF_COLORS } from '../../../utils/pdf/theme.js';
import {
  ReportFooter,
  ReportHeader,
  SectionHeader,
} from '../../../utils/pdf/_shared.jsx';
import '../../../utils/pdf/fonts.js';

// ── Column definitions ───────────────────────────────────────────────────────
const TREND_COLS = [
  { key: 'name', label: 'الشهر', flex: '60%' },
  { key: 'sales', label: 'المبيعات', flex: '40%' },
];

const CATEGORY_COLS = [
  { key: 'name', label: 'التصنيف', flex: '60%' },
  { key: 'value', label: 'النسبة', flex: '40%' },
];

const GEO_COLS = [
  { key: 'name', label: 'المحافظة', flex: '60%' },
  { key: 'value', label: 'النسبة', flex: '40%' },
];

const ACQ_COLS = [
  { key: 'name', label: 'الشهر', flex: '40%' },
  { key: 'new', label: 'عملاء جدد', flex: '30%' },
  { key: 'returning', label: 'عملاء عائدون', flex: '30%' },
];

// ── Sub-components ───────────────────────────────────────────────────────────
function TableHeader({ cols }) {
  return (
    <View style={styles.tableHeader} fixed>
      {cols.map((c) => (
        <Text key={c.key} style={[styles.tableHeaderCell, { width: c.flex }]}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

function EmptyRow({ message, span }) {
  return (
    <View style={[styles.tableRow, styles.tableRowLast]}>
      <Text style={[styles.tableCell, { width: span }]}>{message}</Text>
    </View>
  );
}

function SalesTrendTable({ rows }) {
  return (
    <View style={styles.table}>
      <TableHeader cols={TREND_COLS} />
      {rows.length === 0 ? (
        <EmptyRow message="لا توجد بيانات للفترة المحددة." span="100%" />
      ) : (
        rows.map((r, idx) => {
          const isLast = idx === rows.length - 1;
          const rowStyle = [
            styles.tableRow,
            idx % 2 === 1 ? styles.tableRowAlt : null,
            isLast ? styles.tableRowLast : null,
          ];
          return (
            <View key={r.name} style={rowStyle} wrap={false}>
              <Text
                style={[
                  styles.tableCell,
                  { width: TREND_COLS[0].flex, fontWeight: 700, color: PDF_COLORS.navy },
                ]}
              >
                {r.name}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { width: TREND_COLS[1].flex, color: PDF_COLORS.goldDark, fontWeight: 700 },
                ]}
              >
                {formatCurrency(r.sales)}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function PercentageTable({ rows, cols, valueLabel = 'النسبة' }) {
  void valueLabel;
  return (
    <View style={styles.table}>
      <TableHeader cols={cols} />
      {rows.length === 0 ? (
        <EmptyRow message="لا توجد بيانات." span="100%" />
      ) : (
        rows.map((r, idx) => {
          const isLast = idx === rows.length - 1;
          const rowStyle = [
            styles.tableRow,
            idx % 2 === 1 ? styles.tableRowAlt : null,
            isLast ? styles.tableRowLast : null,
          ];
          return (
            <View key={r.name} style={rowStyle} wrap={false}>
              <Text
                style={[
                  styles.tableCell,
                  { width: cols[0].flex, fontWeight: 700, color: PDF_COLORS.navy },
                ]}
              >
                {r.name}
              </Text>
              <Text style={[styles.tableCell, { width: cols[1].flex }]}>
                {`${toArabicNum(r.value)}%`}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function AcquisitionTable({ rows }) {
  return (
    <View style={styles.table}>
      <TableHeader cols={ACQ_COLS} />
      {rows.length === 0 ? (
        <EmptyRow message="لا توجد بيانات للفترة المحددة." span="100%" />
      ) : (
        rows.map((r, idx) => {
          const isLast = idx === rows.length - 1;
          const rowStyle = [
            styles.tableRow,
            idx % 2 === 1 ? styles.tableRowAlt : null,
            isLast ? styles.tableRowLast : null,
          ];
          return (
            <View key={r.name} style={rowStyle} wrap={false}>
              <Text
                style={[
                  styles.tableCell,
                  { width: ACQ_COLS[0].flex, fontWeight: 700, color: PDF_COLORS.navy },
                ]}
              >
                {r.name}
              </Text>
              <Text style={[styles.tableCell, { width: ACQ_COLS[1].flex }]}>
                {toArabicNum(r.new)}
              </Text>
              <Text style={[styles.tableCell, { width: ACQ_COLS[2].flex }]}>
                {toArabicNum(r.returning)}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function KpiGrid({ kpis }) {
  return (
    <View style={styles.kpiGrid}>
      {kpis.map((k) => (
        <View key={k.label} style={styles.kpiCard}>
          <View style={styles.kpiCardInner}>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={styles.kpiValue}>{k.value}</Text>
            {k.trend ? <Text style={styles.kpiSubtle}>{k.trend}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main document ────────────────────────────────────────────────────────────
/**
 * Props:
 *  - kpis: Array<{ label, value, trend? }>
 *  - storeLabel: string                       — display name (المتجر المختار أو "كل المتاجر")
 *  - dateRange: { startDate, endDate }        — surfaced in the meta strip
 *  - salesTrend: Array<{ name, sales }>
 *  - salesByCategory: Array<{ name, value }>
 *  - geographic: Array<{ name, value }>
 *  - customerAcquisition: Array<{ name, new, returning }>
 *  - generatedAt?: Date | string
 */
export default function AnalyticsReportPdf({
  kpis = [],
  storeLabel = 'كل المتاجر',
  dateRange,
  salesTrend = [],
  salesByCategory = [],
  geographic = [],
  customerAcquisition = [],
  generatedAt,
}) {
  const metaFilters = { المتجر: storeLabel };
  if (dateRange?.startDate) metaFilters['من'] = formatDate(dateRange.startDate);
  if (dateRange?.endDate) metaFilters['إلى'] = formatDate(dateRange.endDate);

  return (
    <Document
      title="تقرير التحليلات والتقارير - الفن الدمشقي"
      author="الفن الدمشقي"
      subject="تقرير تحليلي"
      language="ar"
    >
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader
          title="تقرير التحليلات والتقارير"
          subtitle={`المتجر: ${storeLabel}`}
          generatedAt={generatedAt}
          filters={metaFilters}
        />

        <SectionHeader>مؤشرات الأداء</SectionHeader>
        <KpiGrid kpis={kpis} />

        <SectionHeader>اتجاه المبيعات</SectionHeader>
        <SalesTrendTable rows={salesTrend} />

        <SectionHeader>المبيعات حسب التصنيف</SectionHeader>
        <PercentageTable rows={salesByCategory} cols={CATEGORY_COLS} />

        <SectionHeader>التوزيع الجغرافي</SectionHeader>
        <PercentageTable rows={geographic} cols={GEO_COLS} />

        <View break>
          <SectionHeader>اكتساب العملاء</SectionHeader>
          <AcquisitionTable rows={customerAcquisition} />
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}
