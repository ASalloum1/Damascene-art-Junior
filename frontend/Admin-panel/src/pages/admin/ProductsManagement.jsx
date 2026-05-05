import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getStatusLabel } from '../../utils/adminApi.js';
import styles from './ProductsManagement.module.css';

const STATUS_VARIANT = {
  نشط: 'success',
  مخفي: 'default',
  'نفد المخزون': 'danger',
};

const PAGE_SIZE = 10;

const INITIAL_PRODUCT_FORM = {
  name: '',
  storeId: '',
  category: '',
  price: '',
  quantity: '',
  status: 'active',
  images: [],
};

function normalizeProduct(product) {
  const price = Number(product.price || product.new_price || product.old_price || 0);
  const stock = Number(product.stock || product.quantity || product.amount || 0);
  return {
    id: product.id,
    name: product.name || '—',
    store: product.store?.name || product.store || '—',
    storeId: product.store?.id || product.store_id || '',
    category: product.category?.name || product.category_name || 'غير مصنف',
    price,
    stock,
    rating: Number(product.rating || product.average_rate || 0),
    status: product.status_label || getStatusLabel(product.status),
    statusKey: product.status || 'active',
    image: product.image || '',
  };
}

export default function ProductsManagementPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [storeFilter, setStore] = useState('');
  const [categoryFilter, setCategory] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [priceFilter, setPrice] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetProduct, setTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ ...INITIAL_PRODUCT_FORM });
<<<<<<< HEAD
  const [editingProductId, setEditingProductId] = useState(null);
  const [initialImages, setInitialImages] = useState(undefined);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const storeOptions = useMemo(() =>
    mockStores.map((s) => ({ value: s.name, label: s.name })),
    []
=======
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.products);
      setProducts((data?.data?.products || []).map(normalizeProduct));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المنتجات', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadStores = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.stores);
      setStores(data?.data?.stores || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المتاجر', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
    loadStores();
  }, [loadProducts, loadStores]);

  const storeOptions = useMemo(
    () => stores.map((store) => ({ value: store.id, label: store.name })),
    [stores]
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category)))
        .filter(Boolean)
        .map((category) => ({ value: category, label: category })),
    [products]
>>>>>>> bd465d6 (Integrate frontend panels with backend APIs)
  );

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = !search || product.name.includes(search);
      const matchStore = !storeFilter || String(product.storeId) === String(storeFilter);
      const matchCategory = !categoryFilter || product.category === categoryFilter;
      const matchStatus = !statusFilter || product.status === statusFilter;
      const matchPrice =
        !priceFilter ||
        (() => {
          if (priceFilter === 'lt100') return product.price < 100;
          if (priceFilter === '100-500') return product.price >= 100 && product.price <= 500;
          if (priceFilter === '500-1000') return product.price >= 500 && product.price <= 1000;
          if (priceFilter === 'gt1000') return product.price > 1000;
          return true;
        })();
      return matchSearch && matchStore && matchCategory && matchStatus && matchPrice;
    });
  }, [products, search, storeFilter, categoryFilter, statusFilter, priceFilter]);

  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setSearch('');
    setStore('');
    setCategory('');
    setStatus('');
    setPrice('');
    setPage(1);
  }

  function openDelete(product) {
    setTarget(product);
    setConfirmOpen(true);
  }

  async function handleDelete() {
    if (!targetProduct) return;
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.productDetails(targetProduct.id), { method: 'DELETE' });
      setConfirmOpen(false);
      showToast({ message: `تم حذف المنتج: ${targetProduct.name}`, type: 'success' });
      setTarget(null);
      await loadProducts();
    } catch (error) {
      showToast({ message: error.message || 'تعذر حذف المنتج', type: 'error' });
    }
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
    if (!productForm.name || !productForm.storeId || !productForm.category || !productForm.price || !productForm.quantity) {
      showToast({ message: 'يرجى ملء جميع الحقول', type: 'error' });
      return;
    }
    setIsSubmittingProduct(true);
    try {
      if (editingProductId === null) {
        // CREATE MODE — POST product first, then upload images
        const createResponse = await apiRequest(API_CONFIG.ENDPOINTS.products, {
          method: 'POST',
          body: {
            name: productForm.name,
            store_id: Number(productForm.storeId),
            category_name: productForm.category,
            price: Number(productForm.price),
            old_price: Number(productForm.price),
            new_price: Number(productForm.price),
            quantity: Number(productForm.quantity),
            status: productForm.status,
            average_rate: 0,
          },
        });
        
        const productId = createResponse?.data?.product?.id || Date.now();
        
        if (productForm.images.length > 0) {
          try {
            await productImagesApi.upload(productId, productForm.images);
          } catch (uploadErr) {
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
        // EDIT MODE — update product via API
        await apiRequest(API_CONFIG.ENDPOINTS.productDetails(editingProductId), {
          method: 'PUT',
          body: {
            name: productForm.name,
            store_id: Number(productForm.storeId),
            category_name: productForm.category,
            price: Number(productForm.price),
            old_price: Number(productForm.price),
            new_price: Number(productForm.price),
            quantity: Number(productForm.quantity),
            status: productForm.status,
          },
        });
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
      storeId: product.storeId,
      category: product.category,
      price: product.price,
      quantity: product.stock,
      status: product.statusKey,
      images: [],
    });
    setInitialImages([]);
    setIsAddingProduct(true);
  }

  async function handleToggleStatus(product) {
    const nextStatus = product.statusKey === 'hidden' ? 'active' : 'hidden';
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.productStatus(product.id), {
        method: 'POST',
        body: { status: nextStatus },
      });
      showToast({ message: `تم ${nextStatus === 'hidden' ? 'إخفاء' : 'إظهار'} المنتج`, type: 'warning' });
      await loadProducts();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث حالة المنتج', type: 'error' });
    }
  }

  function renderStars(rating) {
    const full = Math.floor(Number(rating || 0));
    return (
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={12}
            strokeWidth={1.5}
            className={index < full ? styles.starFilled : styles.starEmpty}
          />
        ))}
        <span className={styles.ratingVal}>{toArabicNum(Number(rating || 0).toFixed(1))}</span>
      </div>
    );
  }

  const headers = [
    {
      key: 'image',
      label: 'الصورة',
      render: (_, row) => (
<<<<<<< HEAD
        <div
          className={`${styles.imagePlaceholder} skeleton-shimmer`}
          role="img"
          aria-label={`صورة المنتج ${row.name}`}
        >
=======
        <div className={`${styles.imagePlaceholder} skeleton-shimmer`} role="img" aria-label={`صورة المنتج ${row.name}`}>

          <Package size={18} strokeWidth={1.5} />
        </div>
      ),
    },
    { key: 'name', label: 'اسم المنتج', sortable: true },
    { key: 'store', label: 'المتجر' },
    {
      key: 'category',
      label: 'التصنيف',
      render: (val) => <Badge text={val} variant="info" />,
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
      render: (val) => <span className={val < 5 ? styles.lowStock : ''}>{toArabicNum(val)}</span>,
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
            { label: row.statusKey === 'hidden' ? 'إظهار' : 'إخفاء', icon: EyeOff, onClick: () => handleToggleStatus(row) },
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
        <div className={styles.pageHeader}>
          <div className={styles.headerTitleGroup}>
            <button className={styles.backButton} onClick={handleCancelAddProduct} aria-label="رجوع">
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
              <p className={styles.pageSubtitle}>{pageSubtitle}</p>
            </div>
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            {/* Image Manager (drop zone + grid) */}
            <ProductImagesManager
              productId={editingProductId}
              initialImages={initialImages}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />

            <div className={styles.formFields}>
              <InputField
                label="اسم المنتج"
                placeholder="أدخل اسم المنتج"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <SelectField
                label="المتجر"
                placeholder="اختر المتجر"
                value={productForm.storeId}
                onChange={(e) => setProductForm((f) => ({ ...f, storeId: e.target.value }))}
                options={storeOptions}
                required
              />
              <SelectField
                label="التصنيف"
                placeholder="اختر التصنيف"
                value={productForm.category}
                onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                options={categoryOptions}
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
              <SelectField
                label="الحالة"
                value={productForm.status}
                onChange={(e) => setProductForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  { value: 'active', label: 'نشط' },
                  { value: 'hidden', label: 'مخفي' },
                  { value: 'out_of_stock', label: 'نفد المخزون' },
                ]}
              />
            </div>

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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>إدارة المنتجات</h1>
          <p className={styles.pageSubtitle}>عرض وتتبع كل المنتجات عبر جميع المتاجر</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button className={viewMode === 'table' ? styles.activeView : ''} onClick={() => setViewMode('table')} aria-label="عرض الجدول">
              <Package size={18} />
            </button>
            <button className={viewMode === 'grid' ? styles.activeView : ''} onClick={() => setViewMode('grid')} aria-label="عرض الشبكة">
              <Star size={18} />
            </button>
          </div>
          <button className={styles.addBtn} onClick={handleAddProductClick}>إضافة منتج</button>
        </div>
      </div>

      <FilterBar
        filters={[
          { type: 'search', placeholder: 'بحث عن منتج...', value: search, onChange: setSearch },
          { type: 'select', label: 'المتجر', placeholder: 'الكل', value: storeFilter, onChange: setStore, options: storeOptions },
          { type: 'select', label: 'التصنيف', placeholder: 'الكل', value: categoryFilter, onChange: setCategory, options: categoryOptions },
          {
            type: 'select',
            label: 'الحالة',
            placeholder: 'الكل',
            value: statusFilter,
            onChange: setStatus,
            options: [
              { value: 'نشط', label: 'نشط' },
              { value: 'مخفي', label: 'مخفي' },
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
              { value: 'lt100', label: 'أقل من ١٠٠ $' },
              { value: '100-500', label: '١٠٠ - ٥٠٠ $' },
              { value: '500-1000', label: '٥٠٠ - ١٠٠٠ $' },
              { value: 'gt1000', label: 'أكثر من ١٠٠٠ $' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, storeFilter, categoryFilter, statusFilter, priceFilter].filter(Boolean).length}
      />

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
              onPageChange: (value) => setPage(value),
              onPageSizeChange: (value) => {
                setPageSize(value);
                setPage(1);
              },
            }}
          />
        ) : (
          <div className={styles.productGrid}>
            {pagedRows.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={`${styles.cardImage} skeleton-shimmer`}>
                  <Package size={32} strokeWidth={1} />
                  <Badge text={product.status} variant={STATUS_VARIANT[product.status] || 'default'} className={styles.cardBadge} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{product.name}</h3>
                  <div className={styles.cardMeta}>
                    <Badge text={product.category} variant="info" />
                    <span className={styles.cardPrice}>{formatCurrency(product.price)}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardStock}>المخزون: <span className={product.stock < 5 ? styles.lowStock : ''}>{toArabicNum(product.stock)}</span></span>
                    {renderStars(product.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={`عرض المنتج: ${viewProduct?.name}`} size="sm">
        <div className={styles.viewProductContent}>
          <div className={styles.viewField}><label>اسم المنتج</label><p>{viewProduct?.name}</p></div>
          <div className={styles.viewField}><label>المتجر</label><p>{viewProduct?.store}</p></div>
          <div className={styles.viewField}><label>التصنيف</label><p><Badge text={viewProduct?.category} variant="info" /></p></div>
          <div className={styles.viewField}><label>السعر</label><p>{formatCurrency(viewProduct?.price)}</p></div>
          <div className={styles.viewField}><label>المخزون</label><p>{toArabicNum(viewProduct?.stock)}</p></div>
          <div className={styles.viewField}><label>التقييم</label><p>{toArabicNum(Number(viewProduct?.rating || 0).toFixed(1))}</p></div>
          <div className={styles.viewField}><label>الحالة</label><p><Badge text={viewProduct?.status} variant={STATUS_VARIANT[viewProduct?.status] || 'default'} /></p></div>
        </div>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`تعديل المنتج: ${editProduct?.name}`}
        size="sm"
        footer={(
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveEdit}>حفظ التغييرات</Button>
          </div>
        )}
      >
        <div className={styles.editProductForm}>
          <InputField label="اسم المنتج" value={editForm?.name || ''} onChange={(e) => setEditForm((form) => ({ ...form, name: e.target.value }))} required />
          <SelectField label="المتجر" placeholder="اختر المتجر" value={editForm?.storeId || ''} onChange={(e) => setEditForm((form) => ({ ...form, storeId: e.target.value }))} options={storeOptions} />
          <SelectField label="التصنيف" placeholder="اختر التصنيف" value={editForm?.category || ''} onChange={(e) => setEditForm((form) => ({ ...form, category: e.target.value }))} options={categoryOptions} />
          <InputField label="السعر" type="number" value={editForm?.price || ''} onChange={(e) => setEditForm((form) => ({ ...form, price: parseFloat(e.target.value) }))} required />
          <InputField label="المخزون" type="number" value={editForm?.stock || ''} onChange={(e) => setEditForm((form) => ({ ...form, stock: parseInt(e.target.value, 10) }))} required />
          <SelectField
            label="الحالة"
            value={editForm?.status || 'active'}
            onChange={(e) => setEditForm((form) => ({ ...form, status: e.target.value }))}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'hidden', label: 'مخفي' },
              { value: 'out_of_stock', label: 'نفد المخزون' },
            ]}
          />
        </div>
      </Modal>

>>>>>>> bd465d6 (Integrate frontend panels with backend APIs)
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
