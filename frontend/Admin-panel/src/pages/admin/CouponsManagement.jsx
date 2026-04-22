import { useState, useCallback, useMemo } from 'react';
import { TicketPercent, Plus, Pencil, Trash2, Users } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useCoupons, validateCouponForm } from '../../hooks/useCoupons.js';
import { mockUsers } from '../../data/mockData.js';
import { toArabicNum } from '../../utils/formatters.js';
import styles from './CouponsManagement.module.css';

const COUPON_TYPE_OPTIONS = [
  { value: 'fixed',      label: 'قيمة ثابتة (Fixed)' },
  { value: 'percentage', label: 'نسبة مئوية (Percentage)' },
];

const AUDIENCE_OPTIONS = [
  { value: 'public', label: 'عام — لجميع العملاء' },
  { value: 'vip',    label: 'خاص — لعملاء VIP محددين' },
];

const VIP_CUSTOMERS = mockUsers.filter((u) => u.role === 'عميل');

const INITIAL_FORM = {
  name:        '',
  code:        '',
  type:        'fixed',
  value:       '',
  audience:    'public',
  customerIds: [],
};

export default function CouponsManagementPage() {
  const { showToast } = useToast();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCoupons();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((coupon) => {
    setEditingId(coupon.id);
    setForm({
      name:        coupon.name,
      code:        coupon.code,
      type:        coupon.type,
      value:       String(coupon.value),
      audience:    coupon.audience ?? 'public',
      customerIds: coupon.customerIds ?? [],
    });
    setErrors({});
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const toggleCustomer = useCallback((customerId) => {
    setForm((prev) => {
      const set = new Set(prev.customerIds ?? []);
      if (set.has(customerId)) set.delete(customerId);
      else set.add(customerId);
      return { ...prev, customerIds: Array.from(set) };
    });
    setErrors((prev) => {
      if (!prev.customerIds) return prev;
      const next = { ...prev };
      delete next.customerIds;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const existingCodes = coupons
      .filter((c) => c.id !== editingId)
      .map((c) => c.code);
    const validationErrors = validateCouponForm(form, existingCodes);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast({ message: 'يرجى تصحيح الأخطاء في النموذج', type: 'warning' });
      return;
    }

    const code = form.code.trim().toUpperCase();

    if (editingId) {
      updateCoupon(editingId, form);
      showToast({ message: `تم تحديث الكوبون "${code}" بنجاح`, type: 'success' });
    } else {
      addCoupon(form);
      showToast({ message: `تم إنشاء الكوبون "${code}" بنجاح`, type: 'success' });
    }

    closeModal();
  }, [form, coupons, editingId, addCoupon, updateCoupon, showToast, closeModal]);

  const handleDelete = useCallback((coupon) => {
    const ok = window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`);
    if (!ok) return;
    deleteCoupon(coupon.id);
    showToast({ message: `تم حذف الكوبون "${coupon.code}"`, type: 'success' });
  }, [deleteCoupon, showToast]);

  const headers = useMemo(() => [
    {
      key: 'name',
      label: 'الاسم',
      render: (val) => <span className={styles.cellName}>{val}</span>,
    },
    {
      key: 'code',
      label: 'الرمز',
      render: (val) => <code className={styles.cellCode}>{val}</code>,
    },
    {
      key: 'type',
      label: 'النوع',
      render: (val) => (
        <Badge
          text={val === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
          variant={val === 'percentage' ? 'info' : 'warning'}
        />
      ),
    },
    {
      key: 'value',
      label: 'القيمة',
      render: (val, row) => (
        <span className={styles.cellValue}>
          {row.type === 'percentage'
            ? `${toArabicNum(val)}٪`
            : `${toArabicNum(val)} $`}
        </span>
      ),
    },
    {
      key: 'audience',
      label: 'العملاء',
      render: (_, row) => {
        if (row.audience === 'vip') {
          const count = row.customerIds?.length ?? 0;
          return (
            <span className={styles.cellCustomers}>
              <Users size={14} strokeWidth={1.8} aria-hidden="true" />
              {`VIP — ${toArabicNum(count)} عميل`}
            </span>
          );
        }
        return (
          <span className={styles.cellCustomers}>
            <Users size={14} strokeWidth={1.8} aria-hidden="true" />
            كل العملاء
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_, row) => (
        <ActionMenu
          actions={[
            { label: 'تعديل', icon: Pencil, onClick: () => openEdit(row) },
            { label: 'حذف',  icon: Trash2, danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ], [openEdit, handleDelete]);

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1 className={styles.pageTitle}>إدارة الكوبونات</h1>
          <p className={styles.pageSubtitle}>
            أنشئ وأدر كوبونات الخصم الثابتة أو النسبية، عامة لجميع العملاء أو خاصة بعملاء VIP.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          إضافة كوبون جديد
        </Button>
      </div>

      {/* Coupons Table */}
      {coupons.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <TicketPercent size={40} strokeWidth={1.6} />
          </div>
          <h3 className={styles.emptyTitle}>لا توجد كوبونات بعد</h3>
          <p className={styles.emptyHint}>
            ابدأ بإضافة أول كوبون خصم لتقديم عروض مميزة لعملائك.
          </p>
          <Button variant="outline" icon={Plus} onClick={openAdd}>
            إضافة كوبون جديد
          </Button>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <DataTable headers={headers} rows={coupons} />
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>إلغاء</Button>
            <Button
              icon={editingId ? Pencil : Plus}
              onClick={handleSubmit}
            >
              {editingId ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
            </Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="اسم الكوبون"
              placeholder="مثال: خصم العيد"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              required
            />
          </div>
          <div className={styles.formFull}>
            <InputField
              label="رمز الكوبون"
              placeholder="مثال: EID2026"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              error={errors.code}
              hint="أحرف إنجليزية كبيرة وأرقام فقط (3-20 حرف)"
              required
            />
          </div>
          <SelectField
            label="نوع الخصم"
            value={form.type}
            onChange={(e) => updateField('type', e.target.value)}
            options={COUPON_TYPE_OPTIONS}
            error={errors.type}
            required
          />
          <InputField
            label={form.type === 'percentage' ? 'النسبة المئوية' : 'قيمة الخصم ($)'}
            type="number"
            placeholder={form.type === 'percentage' ? 'مثال: 15' : 'مثال: 50'}
            value={form.value}
            onChange={(e) => updateField('value', e.target.value)}
            error={errors.value}
            required
            min="0"
            step={form.type === 'percentage' ? '1' : '0.01'}
          />

          <div className={styles.formFull}>
            <SelectField
              label="نوع الجمهور"
              value={form.audience}
              onChange={(e) => updateField('audience', e.target.value)}
              options={AUDIENCE_OPTIONS}
              error={errors.audience}
              hint="حدد ما إذا كان هذا الكوبون متاحاً للجميع أم لعملاء VIP فقط"
              required
            />
          </div>

          {form.audience === 'vip' ? (
            <div className={styles.formFull}>
              <label className={styles.vipListLabel}>
                اختر عملاء VIP
                <span className={styles.vipListMeta}>
                  {toArabicNum(form.customerIds.length)} / {toArabicNum(VIP_CUSTOMERS.length)} مختار
                </span>
              </label>

              {VIP_CUSTOMERS.length === 0 ? (
                <p className={styles.vipEmpty}>لا يوجد عملاء متاحون حالياً.</p>
              ) : (
                <div
                  className={[styles.vipList, errors.customerIds ? styles.vipListError : '']
                    .filter(Boolean)
                    .join(' ')}
                  role="group"
                  aria-label="قائمة عملاء VIP"
                >
                  {VIP_CUSTOMERS.map((u) => {
                    const checked = form.customerIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={[styles.vipItem, checked ? styles.vipItemChecked : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <input
                          type="checkbox"
                          className={styles.vipCheckbox}
                          checked={checked}
                          onChange={() => toggleCustomer(u.id)}
                        />
                        <span className={styles.vipName}>
                          {u.firstName} {u.lastName}
                        </span>
                        <span className={styles.vipEmail}>{u.email}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {errors.customerIds ? (
                <p className={styles.vipErrorText}>{errors.customerIds}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
