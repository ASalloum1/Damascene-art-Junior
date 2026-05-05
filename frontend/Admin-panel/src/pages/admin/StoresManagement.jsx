import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusCircle,
  Package,
  ShoppingCart,
  Users,
  Pencil,
  PowerOff,
  Store,
  DollarSign,
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getStatusLabel } from '../../utils/adminApi.js';
import styles from './StoresManagement.module.css';

const STATUS_VARIANT = {
  نشط: 'success',
  'معطّل': 'danger',
};

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  manager: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
};

function normalizeStore(store) {
  return {
    id: store.id,
    name: store.name || '—',
    description: store.description || '',
    manager: store.manager?.name || store.manager_name || '—',
    managerId: store.manager?.id || store.manager_id || '',
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    status: store.status_label || getStatusLabel(store.status),
    statusKey: store.status || 'active',
    productsCount: Number(store.products_count || 0),
    ordersCount: Number(store.orders_count || 0),
    monthlyRevenue: Number(store.monthly_revenue || 0),
    employeesCount: Number(store.employees_count || 0),
  };
}

function normalizeManager(user) {
  return {
    value: user.id,
    label: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
  };
}

export default function StoresManagementPage() {
  const { showToast } = useToast();
  const [stores, setStores] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStore, setTargetStore] = useState(null);
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM_STATE }));
  const [editForm, setEditForm] = useState(() => ({ ...INITIAL_FORM_STATE }));

  const loadStores = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.stores);
      setStores((data?.data?.stores || []).map(normalizeStore));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المتاجر', type: 'error' });
    }
  }, [showToast]);

  const loadManagers = useCallback(async () => {
    try {
      const data = await apiRequest(`${API_CONFIG.ENDPOINTS.users}?role=store-manager`);
      setManagerOptions((data?.data?.users || []).map(normalizeManager));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل مدراء المتاجر', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadStores();
    loadManagers();
  }, [loadManagers, loadStores]);

  const handleAddStore = useCallback(async () => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.stores, {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description,
          manager_id: form.manager || null,
          email: form.email,
          phone: form.phone,
          address: form.address,
          status: form.status,
        },
      });
      setAddOpen(false);
      showToast({ message: 'تم إضافة المتجر بنجاح', type: 'success' });
      setForm({ ...INITIAL_FORM_STATE });
      await loadStores();
    } catch (error) {
      showToast({ message: error.message || 'تعذر إضافة المتجر', type: 'error' });
    }
  }, [form, loadStores, showToast]);

  const handleToggleStatus = useCallback((store) => {
    setTargetStore(store);
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!targetStore) {
      return;
    }

    const nextStatus = targetStore.statusKey === 'active' ? 'disabled' : 'active';

    try {
      await apiRequest(API_CONFIG.ENDPOINTS.storeStatus(targetStore.id), {
        method: 'POST',
        body: {
          status: nextStatus,
        },
      });
      setConfirmOpen(false);
      showToast({
        message: `تم ${nextStatus === 'disabled' ? 'تعطيل' : 'تفعيل'} المتجر ${targetStore.name}`,
        type: 'warning',
      });
      setTargetStore(null);
      await loadStores();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث حالة المتجر', type: 'error' });
    }
  }, [loadStores, showToast, targetStore]);

  const handleEditStore = useCallback((store) => {
    setTargetStore(store);
    setEditForm({
      name: store.name,
      description: store.description,
      manager: store.managerId,
      email: store.email,
      phone: store.phone,
      address: store.address,
      status: store.statusKey,
    });
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!targetStore) {
      return;
    }

    try {
      await apiRequest(API_CONFIG.ENDPOINTS.storeDetails(targetStore.id), {
        method: 'PUT',
        body: {
          name: editForm.name,
          description: editForm.description,
          manager_id: editForm.manager || null,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          status: editForm.status,
        },
      });
      setEditOpen(false);
      showToast({
        message: `تم تحديث بيانات المتجر "${editForm.name}" بنجاح`,
        type: 'success',
      });
      setTargetStore(null);
      setEditForm({ ...INITIAL_FORM_STATE });
      await loadStores();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث بيانات المتجر', type: 'error' });
    }
  }, [editForm, loadStores, showToast, targetStore]);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>إدارة المتاجر</h1>
          <p className={styles.pageSubtitle}>إدارة ومراقبة أداء المتاجر المسجلة في المنصة</p>
        </div>
        <Button icon={PlusCircle} onClick={() => setAddOpen(true)}>
          إضافة متجر جديد
        </Button>
      </div>

      <div className={styles.storesGrid}>
        {stores.map((store) => (
          <div key={store.id} className={styles.storeCard}>
            <div className={styles.storeCardHeader}>
              <div className={styles.storeIconWrapper}>
                <Store size={22} strokeWidth={1.5} className={styles.storeIcon} />
              </div>
              <div className={styles.storeInfo}>
                <h3 className={styles.storeName}>{store.name}</h3>
                <span className={styles.storeManager}>المدير: {store.manager}</span>
              </div>
              <div className={styles.headerActions}>
                <Badge text={store.status} variant={STATUS_VARIANT[store.status] || 'default'} />
                <ActionMenu
                  actions={[
                    {
                      label: 'تعديل البيانات',
                      icon: Pencil,
                      onClick: () => handleEditStore(store),
                    },
                    {
                      label: store.statusKey === 'active' ? 'تعطيل المتجر' : 'تفعيل المتجر',
                      icon: PowerOff,
                      danger: store.statusKey === 'active',
                      onClick: () => handleToggleStatus(store),
                    },
                  ]}
                />
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.storeStats}>
              <div className={styles.statItem}>
                <Package size={14} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>المنتجات</span>
                <span className={styles.statValue}>{toArabicNum(store.productsCount)}</span>
              </div>
              <div className={styles.statItem}>
                <ShoppingCart size={14} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>الطلبات</span>
                <span className={styles.statValue}>{toArabicNum(store.ordersCount)}</span>
              </div>
              <div className={styles.statItem}>
                <Users size={14} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>الموظفين</span>
                <span className={styles.statValue}>{toArabicNum(store.employeesCount)}</span>
              </div>
            </div>

            <div className={styles.revenueRow}>
              <div className={styles.revenueLabelGroup}>
                <DollarSign size={14} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>إيرادات الشهر:</span>
              </div>
              <span className={styles.revenueValue}>{formatCurrency(store.monthlyRevenue)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة متجر جديد"
        size="md"
        footer={(
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddStore}>إنشاء المتجر</Button>
          </div>
        )}
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="اسم المتجر"
              placeholder="أدخل اسم المتجر الكامل"
              value={form.name}
              onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formFull}>
            <TextArea
              label="وصف المتجر"
              placeholder="أدخل وصفاً تفصيلياً للمتجر ونشاطه..."
              value={form.description}
              onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))}
              rows={3}
            />
          </div>
          <SelectField
            label="مدير المتجر"
            placeholder="اختر المدير المسؤول"
            value={form.manager}
            onChange={(e) => setForm((value) => ({ ...value, manager: e.target.value }))}
            options={managerOptions}
          />
          <InputField
            label="البريد الإلكتروني"
            type="email"
            placeholder="store@example.com"
            value={form.email}
            onChange={(e) => setForm((value) => ({ ...value, email: e.target.value }))}
          />
          <InputField
            label="رقم الهاتف"
            placeholder="+963 ..."
            value={form.phone}
            onChange={(e) => setForm((value) => ({ ...value, phone: e.target.value }))}
          />
          <SelectField
            label="الحالة الأولية"
            value={form.status}
            onChange={(e) => setForm((value) => ({ ...value, status: e.target.value }))}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'disabled', label: 'معطّل' },
            ]}
          />
          <div className={styles.formFull}>
            <InputField
              label="العنوان الجغرافي"
              placeholder="المدينة، الشارع، رقم البناء أو علامة مميزة"
              value={form.address}
              onChange={(e) => setForm((value) => ({ ...value, address: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`تعديل بيانات "${targetStore?.name}"`}
        size="sm"
        footer={(
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveEdit}>حفظ التغييرات</Button>
          </div>
        )}
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="تعديل الاسم"
              placeholder="أدخل اسم المتجر"
              value={editForm.name}
              onChange={(e) => setEditForm((value) => ({ ...value, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formFull}>
            <TextArea
              label="الوصف"
              placeholder="أدخل وصف المتجر"
              value={editForm.description}
              onChange={(e) => setEditForm((value) => ({ ...value, description: e.target.value }))}
              rows={3}
            />
          </div>
          <SelectField
            label="الحالة"
            value={editForm.status}
            onChange={(e) => setEditForm((value) => ({ ...value, status: e.target.value }))}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'disabled', label: 'معطّل' },
            ]}
          />
          <SelectField
            label="مدير المتجر"
            placeholder="اختر المدير"
            value={editForm.manager}
            onChange={(e) => setEditForm((value) => ({ ...value, manager: e.target.value }))}
            options={managerOptions}
          />
          <InputField
            label="البريد الإلكتروني"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((value) => ({ ...value, email: e.target.value }))}
          />
          <InputField
            label="رقم الهاتف"
            value={editForm.phone}
            onChange={(e) => setEditForm((value) => ({ ...value, phone: e.target.value }))}
          />
          <div className={styles.formFull}>
            <InputField
              label="العنوان"
              value={editForm.address}
              onChange={(e) => setEditForm((value) => ({ ...value, address: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetStore?.statusKey === 'active' ? 'تعطيل المتجر' : 'تفعيل المتجر'}
        message={`هل أنت متأكد من ${targetStore?.statusKey === 'active' ? 'تعطيل' : 'تفعيل'} متجر "${targetStore?.name}"؟ سيؤثر هذا على إمكانية وصول العملاء للمنتجات.`}
        confirmLabel={targetStore?.statusKey === 'active' ? 'تعطيل' : 'تفعيل'}
        danger={targetStore?.statusKey === 'active'}
      />
    </div>
  );
}
