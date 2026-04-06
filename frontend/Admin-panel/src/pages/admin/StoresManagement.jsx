import { useState } from 'react';
import {
  PlusCircle,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Pencil,
  BarChart2,
  PowerOff,
  Store,
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockStores, mockUsers } from '../../data/mockData.js';
import { formatCurrency, toArabicNum } from '../../utils/formatters.js';
import styles from './StoresManagement.module.css';

const STATUS_VARIANT = {
  'نشط':   'success',
  'معطّل': 'danger',
};

export default function StoresManagementPage() {
  const { showToast } = useToast();

  const [addOpen, setAddOpen]         = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStore, setTargetStore] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    manager: '',
    email: '',
    phone: '',
    address: '',
    status: 'نشط',
  });

  const managers = mockUsers
    .filter((u) => u.role === 'مدير متجر')
    .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));

  function handleAddStore() {
    setAddOpen(false);
    showToast({ message: 'تم إضافة المتجر بنجاح', type: 'success' });
    setForm({ name: '', description: '', manager: '', email: '', phone: '', address: '', status: 'نشط' });
  }

  function handleToggleStatus(store) {
    setTargetStore(store);
    setConfirmOpen(true);
  }

  function handleConfirmToggle() {
    setConfirmOpen(false);
    const newStatus = targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل';
    showToast({ message: `تم ${newStatus} المتجر ${targetStore?.name}`, type: 'warning' });
    setTargetStore(null);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة المتاجر</h1>
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
                <Store size={22} strokeWidth={1.8} className={styles.storeIcon} />
              </div>
              <div className={styles.storeInfo}>
                <h3 className={styles.storeName}>{store.name}</h3>
                <span className={styles.storeManager}>المدير: {store.manager}</span>
              </div>
              <Badge
                text={store.status}
                variant={STATUS_VARIANT[store.status] || 'default'}
              />
            </div>

            <div className={styles.divider} />

            {/* Stats Grid */}
            <div className={styles.storeStats}>
              <div className={styles.statItem}>
                <Package size={15} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>المنتجات</span>
                <span className={styles.statValue}>{toArabicNum(store.productsCount)}</span>
              </div>
              <div className={styles.statItem}>
                <ShoppingCart size={15} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>الطلبات</span>
                <span className={styles.statValue}>{toArabicNum(store.ordersCount)}</span>
              </div>
              <div className={styles.statItem}>
                <Users size={15} strokeWidth={1.8} className={styles.statIcon} />
                <span className={styles.statLabel}>الموظفين</span>
                <span className={styles.statValue}>{toArabicNum(store.employeesCount)}</span>
              </div>
            </div>

            <div className={styles.revenueRow}>
              <DollarSign size={15} strokeWidth={1.8} className={styles.statIcon} />
              <span className={styles.statLabel}>إيرادات الشهر:</span>
              <span className={styles.revenueValue}>{formatCurrency(store.monthlyRevenue)}</span>
            </div>

            <div className={styles.divider} />

            {/* Actions */}
            <div className={styles.storeActions}>
              <Button
                variant="outline"
                size="sm"
                icon={Pencil}
                onClick={() => showToast({ message: `تعديل ${store.name}`, type: 'info' })}
              >
                تعديل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={BarChart2}
                onClick={() => showToast({ message: `عرض تقرير ${store.name}`, type: 'info' })}
              >
                عرض التقرير
              </Button>
              <Button
                variant={store.status === 'نشط' ? 'danger' : 'success'}
                size="sm"
                icon={PowerOff}
                onClick={() => handleToggleStatus(store)}
              >
                {store.status === 'نشط' ? 'تعطيل' : 'تفعيل'}
              </Button>
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
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddStore}>إنشاء المتجر</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="اسم المتجر"
              placeholder="أدخل اسم المتجر"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formFull}>
            <InputField
              label="وصف المتجر"
              placeholder="وصف مختصر للمتجر"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <SelectField
            label="مدير المتجر"
            placeholder="اختر المدير"
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
          <div className={styles.formFull}>
            <InputField
              label="العنوان"
              placeholder="المدينة، الشارع، رقم البناء"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <SelectField
            label="الحالة"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'نشط', label: 'نشط' },
              { value: 'معطّل', label: 'معطّل' },
            ]}
          />
        </div>
      </Modal>

      {/* Confirm Toggle Status */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetStore?.status === 'نشط' ? 'تعطيل المتجر' : 'تفعيل المتجر'}
        message={`هل أنت متأكد من ${targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل'} متجر "${targetStore?.name}"؟`}
        confirmLabel={targetStore?.status === 'نشط' ? 'تعطيل' : 'تفعيل'}
        danger={targetStore?.status === 'نشط'}
      />
    </div>
  );
}
