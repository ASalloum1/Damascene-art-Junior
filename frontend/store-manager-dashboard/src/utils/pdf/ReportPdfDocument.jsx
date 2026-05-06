// ReportPdfDocument — renders a manager's store report as a printable PDF.
//
// Layout: header band, KPI strip, three sectioned tables (products,
// customers, orders), fixed footer with page numbers. Charts are NOT
// rendered in v1 (raster export not worth the bundle weight).
//
// Numbers use Eastern Arabic digits via toArabicNum/formatCurrency. The
// Tajawal font is registered for both digit sets (Latin + Arabic-Indic).

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { registerPdfFonts } from './fonts.js';
import { pdfStyles } from './styles.js';
import {
  toArabicNum,
  formatCurrency,
  formatDate,
} from '../formatters.js';

// Side-effect registration: must run before any PDF render.
registerPdfFonts();

// ── Header ───────────────────────────────────────────────────────
function Header({ storeName, fromLabel, toLabel, generatedLabel }) {
  return (
    <View style={pdfStyles.header} fixed>
      <View style={pdfStyles.headerLeft}>
        <View style={pdfStyles.headerMark}>
          <Text style={pdfStyles.headerMarkText}>د</Text>
        </View>
        <View style={pdfStyles.headerTitleBlock}>
          <Text style={pdfStyles.headerBrand}>الفن الدمشقي</Text>
          <Text style={pdfStyles.headerTitle}>
            تقرير متجر — {storeName || '—'}
          </Text>
        </View>
      </View>
      <View style={pdfStyles.headerMeta}>
        <Text style={pdfStyles.headerMetaLabel}>الفترة</Text>
        <Text style={pdfStyles.headerMetaValue}>
          من {fromLabel} إلى {toLabel}
        </Text>
        <Text style={[pdfStyles.headerMetaLabel, { marginTop: 4 }]}>
          صدر بتاريخ {generatedLabel}
        </Text>
      </View>
    </View>
  );
}

// ── KPI strip ────────────────────────────────────────────────────
function KpiStrip({ kpis }) {
  const cells = [
    { label: 'إيرادات الفترة', value: formatCurrency(kpis.revenue) },
    { label: 'عدد الطلبات', value: toArabicNum(kpis.ordersCount) },
    {
      label: 'متوسط قيمة الطلب',
      value: formatCurrency(kpis.avgOrderValue),
    },
    {
      label: 'متوسط التقييم',
      value: `${toArabicNum(Number(kpis.avgRating).toFixed(1))} / ٥`,
    },
  ];
  return (
    <View style={pdfStyles.kpiRow}>
      {cells.map((c) => (
        <View key={c.label} style={pdfStyles.kpiCell}>
          <Text style={pdfStyles.kpiLabel}>{c.label}</Text>
          <Text style={pdfStyles.kpiValue}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Generic table ────────────────────────────────────────────────
function PdfTable({ columns, rows, emptyText = 'لا توجد بيانات' }) {
  if (!rows || rows.length === 0) {
    return (
      <View style={pdfStyles.table}>
        <Text style={pdfStyles.tableEmpty}>{emptyText}</Text>
      </View>
    );
  }
  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHead} fixed>
        {columns.map((c) => (
          <Text
            key={c.key}
            style={[
              pdfStyles.tableHeadCell,
              c.flex ? { flex: c.flex } : null,
            ]}
          >
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View
          key={row.id || i}
          style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : null]}
          wrap={false}
        >
          {columns.map((c) => (
            <Text
              key={c.key}
              style={[
                pdfStyles.tableCell,
                c.flex ? { flex: c.flex } : null,
              ]}
            >
              {c.render ? c.render(row) : (row[c.key] ?? '—')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Section ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={pdfStyles.section} wrap={true}>
      <View style={pdfStyles.sectionTitleRow}>
        <View style={pdfStyles.sectionDot} />
        <Text style={pdfStyles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function PdfFooter() {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>© ٢٠٢٦ الفن الدمشقي</Text>
      <Text
        style={pdfStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `صفحة ${toArabicNum(pageNumber)} من ${toArabicNum(totalPages)}`
        }
      />
    </View>
  );
}

// ── Column definitions ──────────────────────────────────────────
const PRODUCT_COLS = [
  { key: 'name', label: 'المنتج', flex: 2 },
  { key: 'category', label: 'التصنيف', flex: 1.2 },
  { key: 'sold', label: 'المبيعات', render: (r) => toArabicNum(r.sold) },
  {
    key: 'revenue',
    label: 'الإيرادات',
    render: (r) => formatCurrency(r.revenue),
    flex: 1.3,
  },
  {
    key: 'rating',
    label: 'التقييم',
    render: (r) => `${toArabicNum(Number(r.rating).toFixed(1))} / ٥`,
  },
];

const CUSTOMER_COLS = [
  { key: 'fullName', label: 'العميل', flex: 1.4 },
  { key: 'email', label: 'البريد الإلكتروني', flex: 2 },
  {
    key: 'ordersCount',
    label: 'عدد الطلبات',
    render: (r) => toArabicNum(r.ordersCount),
  },
  {
    key: 'totalSpend',
    label: 'إجمالي الإنفاق',
    render: (r) => formatCurrency(r.totalSpend),
    flex: 1.3,
  },
  {
    key: 'ltv',
    label: 'القيمة الدائمة',
    render: (r) => formatCurrency(r.ltv),
    flex: 1.3,
  },
];

const ORDER_COLS = [
  { key: 'orderNumber', label: 'رقم الطلب', flex: 1.4 },
  { key: 'customer', label: 'العميل', flex: 1.4 },
  {
    key: 'amount',
    label: 'المبلغ',
    render: (r) => formatCurrency(r.amount),
    flex: 1.2,
  },
  { key: 'paymentMethod', label: 'طريقة الدفع', flex: 1.4 },
  { key: 'status', label: 'الحالة' },
  { key: 'date', label: 'التاريخ', render: (r) => formatDate(r.date) },
];

// ── Document ─────────────────────────────────────────────────────
export default function ReportPdfDocument({
  storeName,
  from,
  to,
  generatedAt,
  kpis,
  products,
  customers,
  orders,
}) {
  const fromLabel = formatDate(from);
  const toLabel = formatDate(to);
  const generatedLabel = formatDate(generatedAt || new Date().toISOString());

  return (
    <Document
      title={`تقرير ${storeName || ''}`}
      author="الفن الدمشقي"
      creator="الفن الدمشقي"
      producer="الفن الدمشقي"
    >
      <Page size="A4" style={pdfStyles.page} wrap>
        <Header
          storeName={storeName}
          fromLabel={fromLabel}
          toLabel={toLabel}
          generatedLabel={generatedLabel}
        />
        <KpiStrip kpis={kpis} />

        <Section title="تقرير المنتجات">
          <PdfTable columns={PRODUCT_COLS} rows={products} />
        </Section>

        <Section title="تقرير العملاء">
          <PdfTable columns={CUSTOMER_COLS} rows={customers} />
        </Section>

        <Section title="تقرير الطلبات">
          <PdfTable columns={ORDER_COLS} rows={orders} />
        </Section>

        <PdfFooter />
      </Page>
    </Document>
  );
}
