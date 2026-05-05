import { useCallback, useMemo, useState } from 'react';
import {
  Eye,
  Pencil,
  EyeOff,
  Trash2,
  Star,
  Package,
  ArrowRight,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import ProductImagesManager from '../../components/products/ProductImagesManager.jsx';
import * as productImagesApi from '../../api';
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

const INITIAL_PRODUCT_FORM = {
  name: '',
  store: '',
  price: '',
  quantity: '',
  images: [],
};

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'grid'
  const [isLoading, setIsLoading]     = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ ...INITIAL_PRODUCT_FORM });
  const [editingProductId, setEditingProductId] = useState(null);
  const [initialImages, setInitialImages] = useState(undefined);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const storeOptions = useMemo(() =>
    mockStores.map((s) => ({ value: s.name, label: s.name })),
    []
  );

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
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
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

  function handleAddProductClick() {
    setEditingProductId(null);
    setInitialImages([]);
    setProductForm({ ...INITIAL_PRODUCT_FORM });
    setIsAddingProduct(true);
  }

  function handleCancelAddProduct() {
    setIsAddingProduct(false);
    setEditingProductId(null);
    setInitialImages([]);
    setProductForm({ ...INITIAL_PRODUCT_FORM });
  }

  const handleImagesChange = useCallback((images) => {
    setProductForm((f) => ({ ...f, images }));
  }, []);

  async function handleSaveProduct() {
    if (!productForm.name || !productForm.store || !productForm.price || !productForm.quantity) {
      showToast({ message: 'يرجى ملء جميع الحقول', type: 'error' });
      return;
    }
    setIsSubmittingProduct(true);
    try {
      if (editingProductId === null) {
        // CREATE MODE — text fields would be POSTed first, then images uploaded
        // against the returned productId. No real product CRUD backend exists
        // yet, so we synthesize an id with Date.now().
        // TODO: replace with real productsApi.create() when backend lands
        const productId = Date.now();
        if (productForm.images.length > 0) {
          try {
            await productImagesApi.upload(productId, productForm.images);
          } catch (uploadErr) {
            // Recovery: the product "exists" but images failed. Pivot to
            // edit mode in place so the user can retry without re-typing
            // any fields. Their work is preserved.
            console.error('Image upload failed after product creation', uploadErr);
            setEditingProductId(productId);
            setInitialImages([]);
            showToast({
              message: 'تم إنشاء المنتج، لكن فشل رفع الصور — يمكنك إعادة المحاولة',
              type: 'warning',
            });
            return;
          }
        }
        showToast({
          message: `تم إضافة المنتج "${productForm.name}" بنجاح`,
          type: 'success',
        });
        handleCancelAddProduct();
      } else {
        // EDIT MODE — image mutations are committed live by ProductImagesManager
        // through the dedicated API endpoints. Only text fields would be
        // PATCHed here.
        // TODO: replace with real productsApi.update(editingProductId, fields) when backend lands
        showToast({
          message: `تم تحديث المنتج "${productForm.name}" بنجاح`,
          type: 'success',
        });
        handleCancelAddProduct();
      }
    } catch (err) {
      showToast({
        message: err?.message || 'حدث خطأ غير متوقع',
        type: 'error',
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  function handleViewProduct(product) {
    setViewProduct(product);
    setViewOpen(true);
  }

  function handleEditProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      store: product.store,
      price: product.price,
      quantity: product.stock, // mockData calls this field "stock"
      images: [],
    });
    // No real product GET endpoint exists yet; render the empty grid + a
    // functional drop zone immediately rather than spin a never-resolving
    // skeleton.
    // TODO: replace with productsApi.get(product.id) when backend lands.
    setInitialImages([]);
    setIsAddingProduct(true);
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
        <div
          className={`${styles.imagePlaceholder} skeleton-shimmer`}
          role="img"
          aria-label={`صورة المنتج ${row.name}`}
        >
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
            { label: 'عرض', icon: Eye, onClick: () => handleViewProduct(row) },
            { label: 'تعديل', icon: Pencil, onClick: () => handleEditProduct(row) },
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

  if (isAddingProduct) {
    const isEditMode = editingProductId !== null;
    const pageTitle = isEditMode
      ? `تعديل المنتج: ${productForm.name}`
      : 'إضافة منتج جديد';
    const pageSubtitle = isEditMode
      ? 'حدّث بيانات المنتج وصوره'
      : 'أدخل بيانات المنتج الكاملة';
    const submitLabel = isEditMode ? 'حفظ التغييرات' : 'إضافة المنتج';

    return (
      <div className={`${styles.page} page-enter`}>
        {/* Add / Edit Product Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerTitleGroup}>
            <button
              className={styles.backButton}
              onClick={handleCancelAddProduct}
              aria-label="رجوع"
            >
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
              <p className={styles.pageSubtitle}>{pageSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Add / Edit Product Form */}
        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            {/* Image Manager (drop zone + grid) */}
            <ProductImagesManager
              productId={editingProductId}
              initialImages={initialImages}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />

            {/* Form Fields */}
            <div className={styles.formFields}>
              <InputField
                label="اسم المنتج"
                placeholder="أدخل اسم المنتج"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <SelectField
                label="اسم المتجر"
                placeholder="اختر المتجر"
                value={productForm.store}
                onChange={(e) => setProductForm((f) => ({ ...f, store: e.target.value }))}
                options={storeOptions}
                required
              />
              <InputField
                label="السعر"
                type="number"
                placeholder="أدخل سعر المنتج"
                value={productForm.price}
                onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
              <InputField
                label="الكمية"
                type="number"
                placeholder="أدخل كمية المنتج"
                value={productForm.quantity}
                onChange={(e) => setProductForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className={styles.formActions}>
              <Button
                variant="ghost"
                onClick={handleCancelAddProduct}
                disabled={isSubmittingProduct}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveProduct}
                loading={isSubmittingProduct}
                disabled={isSubmittingProduct}
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>إدارة المنتجات</h1>
          <p className={styles.pageSubtitle}>عرض وتتبع كل المنتجات عبر جميع المتاجر</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button
              className={viewMode === 'table' ? styles.activeView : ''}
              onClick={() => setViewMode('table')}
              aria-label="عرض الجدول"
            >
              <Package size={18} />
            </button>
            <button
              className={viewMode === 'grid' ? styles.activeView : ''}
              onClick={() => setViewMode('grid')}
              aria-label="عرض الشبكة"
            >
              <Star size={18} />
            </button>
          </div>
          <button
            className={styles.addBtn}
            onClick={handleAddProductClick}
          >
            إضافة منتج
          </button>
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

      {/* Table / Grid */}
      <div className={styles.tableCard}>
        {viewMode === 'table' ? (
          <DataTable
            headers={headers}
            rows={pagedRows}
            selectable
            selected={selectedIds}
            onSelectChange={setSelectedIds}
            loading={isLoading}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: (p) => setPage(p),
              onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
            }}
          />
        ) : (
          <div className={styles.productGrid}>
            {pagedRows.map((p) => (
              <div key={p.id} className={styles.productCard}>
                <div className={`${styles.cardImage} skeleton-shimmer`}>
                  <Package size={32} strokeWidth={1} />
                  <Badge
                    text={p.status}
                    variant={STATUS_VARIANT[p.status] || 'default'}
                    className={styles.cardBadge}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{p.name}</h3>
                  <div className={styles.cardMeta}>
                    <Badge text={p.category} variant={CATEGORY_VARIANT[p.category] || 'default'} />
                    <span className={styles.cardPrice}>{formatCurrency(p.price)}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardStock}>
                      المخزون: <span className={p.stock < 5 ? styles.lowStock : ''}>{toArabicNum(p.stock)}</span>
                    </span>
                    {renderStars(p.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Product Modal */}
      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={`عرض المنتج: ${viewProduct?.name}`}
        size="sm"
      >
        <div className={styles.viewProductContent}>
          <div className={styles.viewField}>
            <label>اسم المنتج</label>
            <p>{viewProduct?.name}</p>
          </div>
          <div className={styles.viewField}>
            <label>المتجر</label>
            <p>{viewProduct?.store}</p>
          </div>
          <div className={styles.viewField}>
            <label>التصنيف</label>
            <p>
              <Badge text={viewProduct?.category} variant={CATEGORY_VARIANT[viewProduct?.category] || 'default'} />
            </p>
          </div>
          <div className={styles.viewField}>
            <label>السعر</label>
            <p>{formatCurrency(viewProduct?.price)}</p>
          </div>
          <div className={styles.viewField}>
            <label>المخزون</label>
            <p>{toArabicNum(viewProduct?.stock)}</p>
          </div>
          <div className={styles.viewField}>
            <label>التقييم</label>
            <p>{toArabicNum(viewProduct?.rating?.toFixed(1))}</p>
          </div>
          <div className={styles.viewField}>
            <label>الحالة</label>
            <p>
              <Badge text={viewProduct?.status} variant={STATUS_VARIANT[viewProduct?.status] || 'default'} />
            </p>
          </div>
        </div>
      </Modal>

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
