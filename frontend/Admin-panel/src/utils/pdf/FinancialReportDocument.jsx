// Full-report financial PDF.
//
// One <Document> with a single A4 page that wraps. Composition top-to-bottom:
//   1. Brand header + meta strip (date + active filters)
//   2. KPI grid (4 cards, navy label, gold value)
//   3. Stores table — pre-filtered if `filters.store` is set
//   4. Transactions table — uses the caller's already-filtered transactions
//   5. Fixed footer (copyright + page X of Y)

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { formatCurrency, formatDate, toArabicNum } from '../formatters.js';
import { styles } from './theme.js';
import {
  ReportFooter,
  ReportHeader,
  SectionHeader,
  StatusPill,
} from './_shared.jsx';
import './fonts.js';

// ── Status / type colour mapping (mirrors UI badges) ───────────────────────
const STATUS_INTENT = {
  مكتملة: 'success',
  معلقة: 'warning',
  فاشلة: 'danger',
  نشط: 'success',
  "معطّل": 'danger',
};

const TYPE_INTENT = {
  دفعة: 'success',
  استرداد: 'danger',
};

// Column width tuples must sum to 1 (or close enough) — `flexBasis` percentages
// keep tables responsive to A4 width changes.
const STORES_COLS = [
  { key: 'name', label: 'اسم المتجر', flex: '22%' },
  { key: 'manager', label: 'المدير', flex: '18%' },
  { key: 'phone', label: 'الهاتف', flex: '20%' },
  { key: 'productsCount', label: 'عدد المنتجات', flex: '12%' },
  { key: 'monthlyRevenue', label: 'الإيرادات الشهرية', flex: '18%' },
  { key: 'status', label: 'الحالة', flex: '10%' },
];

const TX_COLS = [
  { key: 'transactionNumber', label: 'رقم المعاملة', flex: '17%' },
  { key: 'type', label: 'النوع', flex: '9%' },
  { key: 'amount', label: 'المبلغ', flex: '12%' },
  { key: 'paymentMethod', label: 'طريقة الدفع', flex: '13%' },
  { key: 'customer', label: 'العميل', flex: '14%' },
  { key: 'store', label: 'المتجر', flex: '14%' },
  { key: 'status', label: 'الحالة', flex: '10%' },
  { key: 'date', label: 'التاريخ', flex: '11%' },
];

function TableHeader({ cols }) {
  return (
    <View style={styles.tableHeader} fixed>
      {cols.map((c) => (
        <Text
          key={c.key}
          style={[styles.tableHeaderCell, { width: c.flex }]}
        >
          {c.label}
        </Text>
      ))}
    </View>
  );
}

function StoresTable({ stores }) {
  if (!stores.length) {
    return <Text style={[styles.tableCell, { paddingVertical: 6 }]}>لا توجد متاجر مطابقة.</Text>;
  }

  return (
    <View style={styles.table}>
      <TableHeader cols={STORES_COLS} />
      {stores.map((store, idx) => {
        const isLast = idx === stores.length - 1;
        const rowStyle = [
          styles.tableRow,
          idx % 2 === 1 ? styles.tableRowAlt : null,
          isLast ? styles.tableRowLast : null,
        ];
        return (
          <View key={store.id} style={rowStyle} wrap={false}>
            <Text style={[styles.tableCell, { width: STORES_COLS[0].flex, fontWeight: 700, color: styles.h2.color }]}>
              {store.name}
            </Text>
            <Text style={[styles.tableCell, { width: STORES_COLS[1].flex }]}>
              {store.manager}
            </Text>
            <Text style={[styles.tableCell, { width: STORES_COLS[2].flex, textAlign: 'left' }]}>
              {toArabicNum(store.phone)}
            </Text>
            <Text style={[styles.tableCell, { width: STORES_COLS[3].flex }]}>
              {toArabicNum(store.productsCount)}
            </Text>
            <Text style={[styles.tableCell, { width: STORES_COLS[4].flex }]}>
              {formatCurrency(store.monthlyRevenue)}
            </Text>
            <View style={{ width: STORES_COLS[5].flex }}>
              <StatusPill text={store.status} intent={STATUS_INTENT[store.status] || 'neutral'} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TransactionsTable({ transactions }) {
  if (!transactions.length) {
    return (
      <View style={styles.table}>
        <TableHeader cols={TX_COLS} />
        <View style={[styles.tableRow, styles.tableRowLast]}>
          <Text style={[styles.tableCell, { width: '100%' }]}>
            لا توجد معاملات مطابقة للفلاتر الحالية.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      <TableHeader cols={TX_COLS} />
      {transactions.map((tx, idx) => {
        const isLast = idx === transactions.length - 1;
        const isRefund = tx.type === 'استرداد';
        const rowStyle = [
          styles.tableRow,
          idx % 2 === 1 ? styles.tableRowAlt : null,
          isLast ? styles.tableRowLast : null,
        ];
        return (
          <View key={tx.id} style={rowStyle} wrap={false}>
            <Text style={[styles.tableCell, { width: TX_COLS[0].flex, fontWeight: 700 }]}>
              {tx.transactionNumber}
            </Text>
            <View style={{ width: TX_COLS[1].flex }}>
              <StatusPill text={tx.type} intent={TYPE_INTENT[tx.type] || 'neutral'} />
            </View>
            <Text
              style={[
                styles.tableCell,
                { width: TX_COLS[2].flex },
                isRefund ? styles.amountNegative : styles.amountPositive,
              ]}
            >
              {isRefund ? '-' : '+'}
              {formatCurrency(tx.amount)}
            </Text>
            <Text style={[styles.tableCell, { width: TX_COLS[3].flex }]}>
              {tx.paymentMethod}
            </Text>
            <Text style={[styles.tableCell, { width: TX_COLS[4].flex }]}>
              {tx.customer}
            </Text>
            <Text style={[styles.tableCell, { width: TX_COLS[5].flex }]}>
              {tx.store}
            </Text>
            <View style={{ width: TX_COLS[6].flex }}>
              <StatusPill
                text={tx.status}
                intent={STATUS_INTENT[tx.status] || 'neutral'}
              />
            </View>
            <Text style={[styles.tableCell, { width: TX_COLS[7].flex }]}>
              {formatDate(tx.date)}
            </Text>
          </View>
        );
      })}
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
            {k.subtle ? <Text style={styles.kpiSubtle}>{k.subtle}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Props:
 *  - kpis: { totalRevenue, refundCount, totalRefunds, avgOrderValue, transactionsCount }
 *  - stores: full mockStores (we filter by `filters.store` internally)
 *  - transactions: already filtered list (caller passes `filtered`, not paged)
 *  - filters: { store?, type?, search? } — surfaced in the meta strip
 *  - generatedAt?: Date
 */
export default function FinancialReportDocument({
  kpis,
  stores = [],
  transactions = [],
  filters = {},
  generatedAt,
}) {
  const filteredStores = filters.store
    ? stores.filter((s) => s.name === filters.store)
    : stores;

  const metaFilters = {};
  if (filters.store) metaFilters['المتجر'] = filters.store;
  if (filters.type) metaFilters['النوع'] = filters.type;
  if (filters.search) metaFilters['بحث'] = filters.search;

  const kpiCards = [
    {
      label: 'إجمالي الإيرادات',
      value: formatCurrency(kpis.totalRevenue),
      subtle: 'دفعات مكتملة',
    },
    {
      label: 'عدد المعاملات',
      value: toArabicNum(kpis.transactionsCount),
      subtle: 'إجمالي السجلات',
    },
    {
      label: 'المستردات',
      value: formatCurrency(kpis.totalRefunds),
      subtle: `${toArabicNum(kpis.refundCount)} عملية`,
    },
    {
      label: 'متوسط قيمة الطلب',
      value: formatCurrency(kpis.avgOrderValue),
      subtle: 'لكل دفعة',
    },
  ];

  return (
    <Document
      title="تقرير مالي شامل - الفن الدمشقي"
      author="الفن الدمشقي"
      subject="تقرير مالي"
      language="ar"
    >
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader
          title="تقرير مالي شامل"
          subtitle="لوحة التحكم الإدارية"
          generatedAt={generatedAt}
          filters={metaFilters}
        />

        <KpiGrid kpis={kpiCards} />

        <SectionHeader>المتاجر</SectionHeader>
        <StoresTable stores={filteredStores} />

        <SectionHeader>المعاملات المالية</SectionHeader>
        <TransactionsTable transactions={transactions} />

        <ReportFooter />
      </Page>
    </Document>
  );
}
