import { useState, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  BarChart2,
  Eye,
  FileText,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import AreaChartWrapper from '../../components/charts/AreaChartWrapper.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockTransactions, monthlyRevenue, mockStores, mockProducts, mockUsers } from '../../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import styles from './FinancialManagement.module.css';

const STATUS_VARIANT = {
  'مكتملة': 'success',
  'معلقة':  'warning',
  'فاشلة':  'danger',
};

const TYPE_VARIANT = {
  'دفعة':    'success',
  'استرداد': 'danger',
};

const PAGE_SIZE = 10;

// Dual area data: revenue vs simulated expenses
const revenueExpenseData = monthlyRevenue.map((item) => ({
  name: item.name,
  revenue: item.value,
  expenses: Math.round(item.value * 0.65),
}));

// Revenue by store
const storeRevenueData = mockStores.map((s) => ({
  name: s.name,
  value: s.monthlyRevenue,
}));

export default function FinancialManagementPage() {
  const { showToast } = useToast();

  const [typeFilter, setType]        = useState('');
  const [storeFilter, setStore]      = useState('');
  const [search, setSearch]          = useState('');
  const [page, setPage]              = useState(1);
  const [pageSize, setPageSize]      = useState(() => PAGE_SIZE);
  const [pdfOpen, setPdfOpen]        = useState(false);
  const [excelOpen, setExcelOpen]    = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pdfTxOpen, setPdfTxOpen]    = useState(false);
  const [selectedTx, setSelectedTx]  = useState(null);

  const { totalRevenue, totalRefunds, avgOrderValue, refundCount } = useMemo(() => {
    const revenue = mockTransactions
      .filter((t) => t.type === 'دفعة' && t.status === 'مكتملة')
      .reduce((acc, t) => acc + t.amount, 0);

    const refunds = mockTransactions
      .filter((t) => t.type === 'استرداد')
      .reduce((acc, t) => acc + t.amount, 0);

    const payments = mockTransactions.filter((t) => t.type === 'دفعة');
    const avg = Math.round(
      payments.reduce((acc, t) => acc + t.amount, 0) / (payments.length || 1)
    );

    const rCount = mockTransactions.filter((t) => t.type === 'استرداد').length;

    return { totalRevenue: revenue, totalRefunds: refunds, avgOrderValue: avg, refundCount: rCount };
  }, []);

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchType   = !typeFilter || t.type === typeFilter;
      const matchStore  = !storeFilter || t.store === storeFilter;
      const matchSearch = !search ||
        t.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.customer.toLowerCase().includes(search.toLowerCase());
      return matchType && matchStore && matchSearch;
    });
  }, [typeFilter, storeFilter, search]);

  const pagedRows = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  function resetFilters() {
    setType('');
    setStore('');
    setSearch('');
    setPage(1);
  }

  const headers = useMemo(() => [
    { key: 'transactionNumber', label: 'رقم المعاملة' },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => <Badge text={val} variant={TYPE_VARIANT[val] || 'default'} />,
    },
    {
      key: 'amount',
      label: 'المبلغ',
      sortable: true,
      render: (val, row) => (
        <span className={row.type === 'استرداد' ? styles.refundAmount : styles.paymentAmount}>
          {row.type === 'استرداد' ? '-' : '+'}{formatCurrency(val)}
        </span>
      ),
    },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
    { key: 'orderId', label: 'الطلب المرتبط', render: (val) => `#${val}` },
    { key: 'customer',  label: 'العميل' },
    { key: 'store',     label: 'المتجر' },
    { key: 'date', label: 'التاريخ', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => <Badge text={val} variant={STATUS_VARIANT[val] || 'default'} />,
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_, row) => (
        <ActionMenu
          actions={[
            {
              label: 'عرض التفاصيل',
              icon: Eye,
              onClick: () => {
                setSelectedTx(row);
                setDetailsOpen(true);
              }
            },
            {
              label: 'تصدير PDF',
              icon: FileText,
              onClick: () => {
                setSelectedTx(row);
                setPdfTxOpen(true);
              }
            },
          ]}
        />
      ),
    },
  ], [showToast]);

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div>
      <h1 className={styles.pageTitle}>الإدارة المالية</h1>
          <p className={styles.pageSubtitle}>مراقبة الإيرادات والمدفوعات والتسويات المالية بين المتاجر والمنصة</p>
      </div>
      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={DollarSign}
          label="إجمالي الإيرادات"
          value={formatCurrency(totalRevenue)}
          color="green"
          subtitle="هذا الشهر"
          trend="+١٢%"
          trendUp={true}
        />
        <StatCard
          icon={CreditCard}
          label="المعاملات"
          value={toArabicNum(mockTransactions.length)}
          color="blue"
          subtitle="هذا الشهر"
        />
        <StatCard
          icon={RefreshCcw}
          label="المستردات"
          value={formatCurrency(totalRefunds)}
          color="red"
          subtitle={`${toArabicNum(refundCount)} عملية`}
        />
        <StatCard
          icon={BarChart2}
          label="متوسط قيمة الطلب"
          value={formatCurrency(avgOrderValue)}
          color="gold"
          trend="+٥%"
          trendUp={true}
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className={styles.card}>
        <AreaChartWrapper
          data={revenueExpenseData}
          areas={[
            { key: 'revenue',  color: COLORS.green,  label: 'الإيرادات' },
            { key: 'expenses', color: COLORS.orange, label: 'المصروفات' },
          ]}
          title="الإيرادات والمصروفات"
          height={300}
          formatValue={(v) => `${Math.round(v / 1000)}k`}
        />
      </div>

      {/* Revenue by Store */}
      <div className={styles.card}>
        <BarChartWrapper
          data={storeRevenueData}
          xKey="name"
          yKey="value"
          color={COLORS.blue}
          title="الإيرادات حسب المتجر"
          height={260}
          formatValue={(v) => `${Math.round(v / 1000)}k`}
        />
      </div>

      {/* Transactions Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle} id="transactions-table-title">المعاملات المالية</h3>
          <div className={styles.exportBtns}>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => setPdfOpen(true)}
              aria-label="تصدير المعاملات إلى ملف PDF"
            >
              <FileText size={14} strokeWidth={1.8} />
              تصدير PDF
            </button>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => setExcelOpen(true)}
              aria-label="تصدير المعاملات إلى ملف Excel"
            >
              <FileText size={14} strokeWidth={1.8} />
              تصدير Excel
            </button>
          </div>
        </div>

        <FilterBar
          filters={[
            {
              type: 'search',
              placeholder: 'بحث برقم المعاملة أو اسم العميل...',
              value: search,
              onChange: (val) => { setSearch(() => val); setPage(() => 1); },
            },
            {
              type: 'select',
              label: 'النوع',
              placeholder: 'الكل',
              value: typeFilter,
              onChange: (val) => { setType(() => val); setPage(() => 1); },
              options: [
                { value: 'دفعة',    label: 'دفعات' },
                { value: 'استرداد', label: 'استردادات' },
              ],
            },
            {
              type: 'select',
              label: 'المتجر',
              placeholder: 'الكل',
              value: storeFilter,
              onChange: (val) => { setStore(() => val); setPage(() => 1); },
              options: mockStores.map((s) => ({ value: s.name, label: s.name })),
            },
          ]}
          onReset={resetFilters}
          activeCount={[search, typeFilter, storeFilter].filter(Boolean).length}
        />

        <div className={styles.tableCard} role="region" aria-labelledby="transactions-table-title">
          <DataTable
            headers={headers}
            rows={pagedRows}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: (p) => setPage(() => p),
              onPageSizeChange: (s) => { 
                setPageSize(() => s); 
                setPage(() => 1); 
              },
            }}
          />
        </div>
      </div>

      {/* PDF Export Modal */}
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title="تقرير شامل - المعاملات والمنتجات والعملاء والمتاجر"
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="ghost"
              onClick={() => setPdfOpen(false)}
            >
              إغلاق
            </Button>
            <Button
              onClick={() => {
                window.print();
                showToast({ message: 'يرجى اختيار حفظ بصيغة PDF', type: 'info' });
              }}
            >
              طباعة / حفظ PDF
            </Button>
          </div>
        }
      >
        <div className={styles.pdfPreview}>
          <div className={styles.a4Page}>
            <div className={styles.a4Content}>
              <h2 className={styles.documentTitle}>التقرير الشامل</h2>
              <p className={styles.documentSubtitle}>الفن الدمشقي - لوحة التحكم الإدارية</p>

              <div className={styles.documentMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>تاريخ التقرير:</span>
                  <span className={styles.metaValue}>{formatDate(new Date().toISOString())}</span>
                </div>
                {storeFilter && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>المتجر المختار:</span>
                    <span className={styles.metaValue}>{storeFilter}</span>
                  </div>
                )}
              </div>

              {/* Stores Section */}
              <h3 style={{marginTop: '20px', marginBottom: '10px', borderBottom: '2px solid #C8A45A', paddingBottom: '5px'}}>المتاجر</h3>
              <table className={styles.documentTable}>
                <thead>
                  <tr>
                    <th>اسم المتجر</th>
                    <th>المدير</th>
                    <th>الهاتف</th>
                    <th>الحالة</th>
                    <th>عدد المنتجات</th>
                    <th>الإيرادات الشهرية</th>
                  </tr>
                </thead>
                <tbody>
                  {(storeFilter ? mockStores.filter(s => s.name === storeFilter) : mockStores).map((store) => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.manager}</td>
                      <td>{store.phone}</td>
                      <td>{store.status}</td>
                      <td>{store.productsCount}</td>
                      <td>{formatCurrency(store.monthlyRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Products Section */}
              <h3 style={{marginTop: '20px', marginBottom: '10px', borderBottom: '2px solid #C8A45A', paddingBottom: '5px'}}>المنتجات</h3>
              <table className={styles.documentTable}>
                <thead>
                  <tr>
                    <th>اسم المنتج</th>
                    <th>المتجر</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>التقييم</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(storeFilter ? mockProducts.filter(p => p.store === storeFilter) : mockProducts).map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.store}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>{product.rating}</td>
                      <td>{product.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Clients Section */}
              <h3 style={{marginTop: '20px', marginBottom: '10px', borderBottom: '2px solid #C8A45A', paddingBottom: '5px'}}>العملاء</h3>
              <table className={styles.documentTable}>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور</th>
                    <th>المتجر</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.store || '-'}</td>
                      <td>{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Transactions Section */}
              <h3 style={{marginTop: '20px', marginBottom: '10px', borderBottom: '2px solid #C8A45A', paddingBottom: '5px'}}>المعاملات المالية</h3>
              <table className={styles.documentTable}>
                <thead>
                  <tr>
                    <th>رقم المعاملة</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>العميل</th>
                    <th>المتجر</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.transactionNumber}</td>
                      <td>{row.type}</td>
                      <td>{formatCurrency(row.amount)}</td>
                      <td>{row.paymentMethod}</td>
                      <td>{row.customer}</td>
                      <td>{row.store}</td>
                      <td>{row.status}</td>
                      <td>{formatDate(row.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.documentFooter} style={{marginTop: '20px'}}>
                <p>© 2026 الفن الدمشقي - جميع الحقوق محفوظة</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Excel Export Modal */}
      <Modal
        isOpen={excelOpen}
        onClose={() => setExcelOpen(false)}
        title="عرض المعاملات المالية - Excel"
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="ghost"
              onClick={() => setExcelOpen(false)}
            >
              إغلاق
            </Button>
            <Button
              onClick={() => {
                const csvContent = generateCSV(pagedRows);
                downloadFile(csvContent, 'transactions.csv', 'text/csv');
                showToast({ message: 'تم تحميل الملف بنجاح', type: 'success' });
                setExcelOpen(false);
              }}
            >
              تحميل كـ Excel
            </Button>
          </div>
        }
      >
        <div className={styles.excelPreview}>
          <table className={styles.excelTable}>
            <thead>
              <tr>
                <th>رقم المعاملة</th>
                <th>النوع</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>الطلب المرتبط</th>
                <th>العميل</th>
                <th>المتجر</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.transactionNumber}</td>
                  <td>{row.type}</td>
                  <td>{formatCurrency(row.amount)}</td>
                  <td>{row.paymentMethod}</td>
                  <td>#{row.orderId}</td>
                  <td>{row.customer}</td>
                  <td>{row.store}</td>
                  <td>{row.status}</td>
                  <td>{formatDate(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={`تفاصيل المعاملة: ${selectedTx?.transactionNumber}`}
        size="sm"
      >
        <div className={styles.transactionDetails}>
          <div className={styles.detailsField}>
            <label>رقم المعاملة</label>
            <p>{selectedTx?.transactionNumber}</p>
          </div>
          <div className={styles.detailsField}>
            <label>النوع</label>
            <p>
              <Badge text={selectedTx?.type} variant={TYPE_VARIANT[selectedTx?.type] || 'default'} />
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>المبلغ</label>
            <p className={selectedTx?.type === 'استرداد' ? styles.refundAmount : styles.paymentAmount}>
              {selectedTx?.type === 'استرداد' ? '-' : '+'}{formatCurrency(selectedTx?.amount)}
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>طريقة الدفع</label>
            <p>{selectedTx?.paymentMethod}</p>
          </div>
          <div className={styles.detailsField}>
            <label>الطلب المرتبط</label>
            <p>#{selectedTx?.orderId}</p>
          </div>
          <div className={styles.detailsField}>
            <label>العميل</label>
            <p>{selectedTx?.customer}</p>
          </div>
          <div className={styles.detailsField}>
            <label>المتجر</label>
            <p>{selectedTx?.store}</p>
          </div>
          <div className={styles.detailsField}>
            <label>الحالة</label>
            <p>
              <Badge text={selectedTx?.status} variant={STATUS_VARIANT[selectedTx?.status] || 'default'} />
            </p>
          </div>
          <div className={styles.detailsField}>
            <label>التاريخ</label>
            <p>{formatDate(selectedTx?.date)}</p>
          </div>
        </div>
      </Modal>

      {/* Transaction PDF Export Modal */}
      <Modal
        isOpen={pdfTxOpen}
        onClose={() => setPdfTxOpen(false)}
        title={`تصدير المعاملة: ${selectedTx?.transactionNumber} - PDF`}
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="ghost"
              onClick={() => setPdfTxOpen(false)}
            >
              إغلاق
            </Button>
            <Button
              onClick={() => {
                window.print();
                showToast({ message: 'يرجى اختيار حفظ بصيغة PDF', type: 'info' });
              }}
            >
              طباعة / حفظ PDF
            </Button>
          </div>
        }
      >
        <div className={styles.pdfPreview}>
          <div className={styles.a4Page}>
            <div className={styles.a4Content}>
              <h2 className={styles.documentTitle}>تفاصيل المعاملة المالية</h2>
              <p className={styles.documentSubtitle}>الفن الدمشقي - لوحة التحكم الإدارية</p>

              <div className={styles.documentMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>رقم المعاملة:</span>
                  <span className={styles.metaValue}>{selectedTx?.transactionNumber}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>تاريخ التقرير:</span>
                  <span className={styles.metaValue}>{formatDate(new Date().toISOString())}</span>
                </div>
              </div>

              <table className={styles.documentTable}>
                <tbody>
                  <tr>
                    <td className={styles.labelCol}>النوع</td>
                    <td>{selectedTx?.type}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>المبلغ</td>
                    <td>
                      <span className={selectedTx?.type === 'استرداد' ? styles.refundAmount : styles.paymentAmount}>
                        {selectedTx?.type === 'استرداد' ? '-' : '+'}{formatCurrency(selectedTx?.amount)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>طريقة الدفع</td>
                    <td>{selectedTx?.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>الطلب المرتبط</td>
                    <td>#{selectedTx?.orderId}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>العميل</td>
                    <td>{selectedTx?.customer}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>المتجر</td>
                    <td>{selectedTx?.store}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>الحالة</td>
                    <td>{selectedTx?.status}</td>
                  </tr>
                  <tr>
                    <td className={styles.labelCol}>التاريخ</td>
                    <td>{formatDate(selectedTx?.date)}</td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.documentFooter}>
                <p>© 2026 الفن الدمشقي - جميع الحقوق محفوظة</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper function to generate CSV
function generateCSV(data) {
  const headers = ['رقم المعاملة', 'النوع', 'المبلغ', 'طريقة الدفع', 'الطلب', 'العميل', 'المتجر', 'الحالة', 'التاريخ'];
  const rows = data.map((row) => [
    row.transactionNumber,
    row.type,
    row.amount,
    row.paymentMethod,
    row.orderId,
    row.customer,
    row.store,
    row.status,
    row.date,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

// Helper function to download file
function downloadFile(content, filename, type) {
  const isCsv = type.startsWith('text/csv');
  const mime = isCsv ? 'text/csv;charset=utf-8' : type;
  // Prepend UTF-8 BOM so Excel detects the encoding correctly (otherwise Arabic shows as mojibake)
  const parts = isCsv ? ['﻿', content] : [content];
  const blob = new Blob(parts, { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
