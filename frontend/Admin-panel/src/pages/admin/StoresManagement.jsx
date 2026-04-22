import { useState, useCallback, useMemo } from 'react';
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
import { mockStores, mockUsers } from '../../data/mockData.js';
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import styles from './StoresManagement.module.css';

const STATUS_VARIANT = {
  'نشط':   'success',
  'معطّل': 'danger',
};

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  manager: '',
  email: '',
  phone: '',
  address: '',
  status: 'نشط',
};

const INITIAL_EDIT_STATE = {
  name: '',
  status: 'نشط',
  manager: '',
};

export default function StoresManagementPage() {
  const { showToast } = useToast();

  const [addOpen, setAddOpen]         = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStore, setTargetStore] = useState(null);

  const [form, setForm] = useState(() => ({ ...INITIAL_FORM_STATE }));
  const [editForm, setEditForm] = useState(() => ({ ...INITIAL_EDIT_STATE }));

  const managers = useMemo(() => (
    mockUsers
      .filter((u) => u.role === 'مدير متجر')
      .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))
  ), []);

  const handleAddStore = useCallback(() => {
    setAddOpen(false);
    showToast({ message: 'تم إضافة المتجر بنجاح', type: 'success' });
    setForm(() => ({ ...INITIAL_FORM_STATE }));
  }, [showToast]);

  const handleToggleStatus = useCallback((store) => {
    setTargetStore(() => store);
    setConfirmOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(() => {
    setConfirmOpen(false);
    const newStatus = targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل';
    showToast({ message: `تم ${newStatus} المتجر ${targetStore?.name}`, type: 'warning' });
    setTargetStore(() => null);
  }, [targetStore, showToast]);

  const handleEditStore = useCallback((store) => {
    setTargetStore(() => store);
    setEditForm(() => ({
      name: store.name,
      status: store.status,
      manager: store.manager,
    }));
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setEditOpen(false);
    showToast({
      message: `تم تحديث بيانات المتجر "${editForm.name}" بنجاح`,
      type: 'success',
    });
    setTargetStore(() => null);
    setEditForm(() => ({ ...INITIAL_EDIT_STATE }));
  }, [editForm, showToast]);

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>إدارة المتاجر</h1>
          <p className={styles.pageSubtitle}>إدارة ومراقبة أداء المتاجر المسجلة في المنصة</p>
        </div>
        <Button icon={PlusCircle} onClick={() => setAddOpen(true)}>
          إضافة متجر جديد
        </Button>
      </div>

      {/* Stores Grid */}
      <div className={styles.storesGrid}>
        {mockStores.map((store) => (
          <div key={store.id} className={styles.storeCard}>
            {/* Card Header */}
            <div className={styles.storeCardHeader}>
              <div className={styles.storeIconWrapper}>
                <Store size={22} strokeWidth={1.5} className={styles.storeIcon} />
              </div>
              <div className={styles.storeInfo}>
                <h3 className={styles.storeName}>{store.name}</h3>
                <span className={styles.storeManager}>المدير: {store.manager}</span>
              </div>
              <div className={styles.headerActions}>
                <Badge
                  text={store.status}
                  variant={STATUS_VARIANT[store.status] || 'default'}
                />
                <ActionMenu
                  actions={[
                    {
                      label: 'تعديل البيانات',
                      icon: Pencil,
                      onClick: () => handleEditStore(store),
                    },
                    {
                      label: store.status === 'نشط' ? 'تعطيل المتجر' : 'تفعيل المتجر',
                      icon: PowerOff,
                      danger: store.status === 'نشط',
                      onClick: () => handleToggleStatus(store),
                    },
                  ]}
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* Stats Grid */}
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

      {/* Add Store Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة متجر جديد"
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddStore}>إنشاء المتجر</Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="اسم المتجر"
              placeholder="أدخل اسم المتجر الكامل"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formFull}>
            <TextArea
              label="وصف المتجر"
              placeholder="أدخل وصفاً تفصيلياً للمتجر ونشاطه..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <SelectField
            label="مدير المتجر"
            placeholder="اختر المدير المسؤول"
            value={form.manager}
            onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
            options={managers}
          />
          <InputField
            label="البريد الإلكتروني"
            type="email"
            placeholder="store@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <InputField
            label="رقم الهاتف"
            placeholder="+963 ..."
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <SelectField
            label="الحالة الأولية"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'نشط', label: 'نشط' },
              { value: 'معطّل', label: 'معطّل' },
            ]}
          />
          <div className={styles.formFull}>
            <InputField
              label="العنوان الجغرافي"
              placeholder="المدينة، الشارع، رقم البناء أو علامة مميزة"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Store Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`تعديل بيانات "${targetStore?.name}"`}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveEdit}>حفظ التغييرات</Button>
          </div>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="تعديل الاسم"
              placeholder="أدخل اسم المتجر"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <SelectField
            label="الحالة"
            value={editForm.status}
            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'نشط', label: 'نشط' },
              { value: 'معطّل', label: 'معطّل' },
            ]}
          />
          <SelectField
            label="مدير المتجر"
            placeholder="اختر المدير"
            value={editForm.manager}
            onChange={(e) => setEditForm((f) => ({ ...f, manager: e.target.value }))}
            options={managers}
          />
        </div>
      </Modal>

      {/* Confirm Toggle Status */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetStore?.status === 'نشط' ? 'تعطيل المتجر' : 'تفعيل المتجر'}
        message={`هل أنت متأكد من ${targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل'} متجر "${targetStore?.name}"؟ سيؤثر هذا على إمكانية وصول العملاء للمنتجات.`}
        confirmLabel={targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل'}
        danger={targetStore?.status === 'نشط'}
      />
    </div>
  );
}
