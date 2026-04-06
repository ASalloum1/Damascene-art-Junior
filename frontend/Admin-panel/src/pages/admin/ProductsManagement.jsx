import { useState, useMemo } from 'react';
import {
  Eye,
  Pencil,
  EyeOff,
  Trash2,
  Star,
  Package,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockProducts, mockStores } from '../../data/mockData.js';
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import styles from './ProductsManagement.module.css';

const STATUS_VARIANT = {
  'نشط':           'success',
  'مخفي':          'default',
  'نفد المخزون':   'danger',
};

const CATEGORY_VARIANT = {
  'فسيفساء':    'info',
  'خشب مطعّم':  'gold',
  'زجاج منفوخ': 'purple',
  'بروكار':     'warning',
  'نحاسيات':    'default',
  'فخار':       'danger',
};

const PAGE_SIZE = 10;
const EMPTY_SELECTION = [];
const NOOP = () => {};

export default function ProductsManagementPage() {
  const { showToast } = useToast();

  const [search, setSearch]           = useState('');
  const [storeFilter, setStore]       = useState('');
  const [categoryFilter, setCategory] = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [priceFilter, setPrice]       = useState('');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(PAGE_SIZE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetProduct, setTarget]    = useState(null);

  const storeOptions = mockStores.map((s) => ({ value: s.name, label: s.name }));

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchSearch   = !search || p.name.includes(search);
      const matchStore    = !storeFilter || p.store === storeFilter;
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchStatus   = !statusFilter || p.status === statusFilter;
      const matchPrice    = !priceFilter || (() => {
        if (priceFilter === 'lt100')       return p.price < 100;
        if (priceFilter === '100-500')     return p.price >= 100 && p.price <= 500;
        if (priceFilter === '500-1000')    return p.price >= 500 && p.price <= 1000;
        if (priceFilter === 'gt1000')      return p.price > 1000;
        return true;
      })();
      return matchSearch && matchStore && matchCategory && matchStatus && matchPrice;
    });
  }, [search, storeFilter, categoryFilter, statusFilter, priceFilter]);

  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setSearch(''); setStore(''); setCategory(''); setStatus(''); setPrice('');
    setPage(1);
  }

  function openDelete(product) {
    setTarget(product);
    setConfirmOpen(true);
  }

  function handleDelete() {
    setConfirmOpen(false);
    showToast({ message: `تم حذف المنتج: ${targetProduct?.name}`, type: 'success' });
    setTarget(null);
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    return (
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={12}
            strokeWidth={1.5}
            className={i < full ? styles.starFilled : styles.starEmpty}
          />
        ))}
        <span className={styles.ratingVal}>{toArabicNum(rating.toFixed(1))}</span>
      </div>
    );
  }

  const headers = [
    {
      key: 'image',
      label: 'الصورة',
      render: (_, row) => (
        <div className={styles.imagePlaceholder}>
          <Package size={18} strokeWidth={1.5} />
        </div>
      ),
    },
    { key: 'name', label: 'اسم المنتج', sortable: true },
    { key: 'store', label: 'المتجر' },
    {
      key: 'category',
      label: 'التصنيف',
      render: (val) => <Badge text={val} variant={CATEGORY_VARIANT[val] || 'default'} />,
    },
    {
      key: 'price',
      label: 'السعر',
      sortable: true,
      render: (val) => formatCurrency(val),
    },
    {
      key: 'stock',
      label: 'المخزون',
      sortable: true,
      render: (val) => (
        <span className={val < 5 ? styles.lowStock : ''}>{toArabicNum(val)}</span>
      ),
    },
    {
      key: 'rating',
      label: 'التقييم',
      sortable: true,
      render: (val) => renderStars(val),
    },
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
            { label: 'عرض', icon: Eye, onClick: () => showToast({ message: `عرض ${row.name}`, type: 'info' }) },
            { label: 'تعديل', icon: Pencil, onClick: () => showToast({ message: 'تعديل المنتج', type: 'info' }) },
            {
              label: row.status === 'مخفي' ? 'إظهار' : 'إخفاء',
              icon: EyeOff,
              onClick: () => showToast({ message: `تم ${row.status === 'مخفي' ? 'إظهار' : 'إخفاء'} المنتج`, type: 'warning' }),
            },
            { label: 'حذف', icon: Trash2, danger: true, onClick: () => openDelete(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>إدارة المنتجات (شامل)</h1>
          <p className={styles.pageSubtitle}>عرض كل المنتجات عبر جميع المتاجر</p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'بحث عن منتج...',
            value: search,
            onChange: setSearch,
          },
          {
            type: 'select',
            label: 'المتجر',
            placeholder: 'الكل',
            value: storeFilter,
            onChange: setStore,
            options: storeOptions,
          },
          {
            type: 'select',
            label: 'التصنيف',
            placeholder: 'الكل',
            value: categoryFilter,
            onChange: setCategory,
            options: [
              { value: 'فسيفساء',    label: 'فسيفساء' },
              { value: 'خشب مطعّم',  label: 'خشب مطعّم' },
              { value: 'زجاج منفوخ', label: 'زجاج منفوخ' },
              { value: 'بروكار',     label: 'بروكار' },
              { value: 'نحاسيات',    label: 'نحاسيات' },
              { value: 'فخار',       label: 'فخار' },
            ],
          },
          {
            type: 'select',
            label: 'الحالة',
            placeholder: 'الكل',
            value: statusFilter,
            onChange: setStatus,
            options: [
              { value: 'نشط',         label: 'نشط' },
              { value: 'مخفي',        label: 'مخفي' },
              { value: 'نفد المخزون', label: 'نفد المخزون' },
            ],
          },
          {
            type: 'select',
            label: 'السعر',
            placeholder: 'الكل',
            value: priceFilter,
            onChange: setPrice,
            options: [
              { value: 'lt100',    label: 'أقل من ١٠٠ $' },
              { value: '100-500',  label: '١٠٠ - ٥٠٠ $' },
              { value: '500-1000', label: '٥٠٠ - ١٠٠٠ $' },
              { value: 'gt1000',   label: 'أكثر من ١٠٠٠ $' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, storeFilter, categoryFilter, statusFilter, priceFilter].filter(Boolean).length}
      />

      {/* Table */}
      <div className={styles.tableCard}>
        <DataTable
          headers={headers}
          rows={pagedRows}
          selectable
          selected={EMPTY_SELECTION}
          onSelectChange={NOOP}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
            onPageChange: setPage,
            onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
          }}
        />
      </div>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المنتج "${targetProduct?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        danger
      />
    </div>
  );
}
