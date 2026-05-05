import { useCallback, useEffect, useMemo, useState } from 'react';
import { TicketPercent, Plus, Pencil, Trash2, Users } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest } from '../../utils/adminApi.js';
import styles from './CouponsManagement.module.css';

const COUPON_TYPE_OPTIONS = [
  { value: 'fixed', label: 'قيمة ثابتة (Fixed)' },
  { value: 'percentage', label: 'نسبة مئوية (Percentage)' },
];

const AUDIENCE_OPTIONS = [
  { value: 'public', label: 'عام — لجميع العملاء' },
  { value: 'vip', label: 'خاص — لعملاء VIP محددين' },
];

const INITIAL_FORM = {
  name: '',
  code: '',
  type: 'fixed',
  value: '',
  audience: 'public',
  customerIds: [],
};

function normalizeCoupon(coupon) {
  return {
    id: coupon.id,
    audience: coupon.audience || coupon.resource_type || 'public',
    name: coupon.name,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    customerIds: coupon.customer_ids || [],
  };
}

function normalizeCustomer(user) {
  return {
    id: user.id,
    name: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' '),
    email: user.email,
  };
}

export default function CouponsManagementPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [vipCustomers, setVipCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const loadCoupons = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.coupons);
      setCoupons((data?.data?.coupons || []).map(normalizeCoupon));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل الكوبونات', type: 'error' });
    }
  }, [showToast]);

  const loadVipCustomers = useCallback(async () => {
    try {
      const data = await apiRequest(`${API_CONFIG.ENDPOINTS.users}?role=customers`);
      setVipCustomers((data?.data?.users || []).map(normalizeCustomer));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل العملاء', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadCoupons();
    loadVipCustomers();
  }, [loadCoupons, loadVipCustomers]);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((coupon) => {
    setEditingId(coupon.id);
    setForm({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      audience: coupon.audience,
      customerIds: coupon.customerIds || [],
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleCustomer = useCallback((customerId) => {
    setForm((prev) => {
      const set = new Set(prev.customerIds || []);
      if (set.has(customerId)) set.delete(customerId);
      else set.add(customerId);
      return { ...prev, customerIds: Array.from(set) };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const payload = {
      name: form.name,
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      audience: form.audience,
      customer_ids: form.audience === 'vip' ? form.customerIds : [],
      is_active: true,
    };

    try {
      if (editingId) {
        const coupon = coupons.find((item) => item.id === editingId);
        await apiRequest(API_CONFIG.ENDPOINTS.couponDetails(coupon.audience, coupon.id), {
          method: 'PUT',
          body: payload,
        });
        showToast({ message: `تم تحديث الكوبون "${payload.code}" بنجاح`, type: 'success' });
      } else {
        await apiRequest(API_CONFIG.ENDPOINTS.coupons, {
          method: 'POST',
          body: payload,
        });
        showToast({ message: `تم إنشاء الكوبون "${payload.code}" بنجاح`, type: 'success' });
      }

      closeModal();
      await loadCoupons();
    } catch (error) {
      showToast({ message: error.message || 'تعذر حفظ الكوبون', type: 'error' });
    }
  }, [closeModal, coupons, editingId, form, loadCoupons, showToast]);

  const handleDelete = useCallback(async (coupon) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.couponDetails(coupon.audience, coupon.id), {
        method: 'DELETE',
      });
      showToast({ message: `تم حذف الكوبون "${coupon.code}"`, type: 'success' });
      await loadCoupons();
    } catch (error) {
      showToast({ message: error.message || 'تعذر حذف الكوبون', type: 'error' });
    }
  }, [loadCoupons, showToast]);

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
          {row.type === 'percentage' ? `${toArabicNum(val)}٪` : `${toArabicNum(val)} $`}
        </span>
      ),
    },
    {
      key: 'audience',
      label: 'العملاء',
      render: (_, row) => {
        if (row.audience === 'vip') {
          return (
            <span className={styles.cellCustomers}>
              <Users size={14} strokeWidth={1.8} aria-hidden="true" />
              {`VIP — ${toArabicNum(row.customerIds?.length || 0)} عميل`}
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
            { label: 'حذف', icon: Trash2, danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ], [handleDelete, openEdit]);

  return (
    <div className={`${styles.page} page-enter`}>
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

      {coupons.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <TicketPercent size={40} strokeWidth={1.6} />
          </div>
          <h3 className={styles.emptyTitle}>لا توجد كوبونات بعد</h3>
          <p className={styles.emptyHint}>ابدأ بإضافة أول كوبون خصم لتقديم عروض مميزة لعملائك.</p>
          <Button variant="outline" icon={Plus} onClick={openAdd}>
            إضافة كوبون جديد
          </Button>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <DataTable headers={headers} rows={coupons} />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
        size="md"
        footer={(
          <>
            <Button variant="ghost" onClick={closeModal}>إلغاء</Button>
            <Button icon={editingId ? Pencil : Plus} onClick={handleSubmit}>
              {editingId ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
            </Button>
          </>
        )}
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}>
            <InputField
              label="اسم الكوبون"
              placeholder="مثال: خصم العيد"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>
          <div className={styles.formFull}>
            <InputField
              label="رمز الكوبون"
              placeholder="مثال: EID2026"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              required
            />
          </div>
          <SelectField
            label="نوع الخصم"
            value={form.type}
            onChange={(e) => updateField('type', e.target.value)}
            options={COUPON_TYPE_OPTIONS}
          />
          <InputField
            label={form.type === 'percentage' ? 'النسبة المئوية' : 'قيمة الخصم ($)'}
            type="number"
            placeholder={form.type === 'percentage' ? 'مثال: 15' : 'مثال: 50'}
            value={form.value}
            onChange={(e) => updateField('value', e.target.value)}
            required
          />

          <div className={styles.formFull}>
            <SelectField
              label="نوع الجمهور"
              value={form.audience}
              onChange={(e) => updateField('audience', e.target.value)}
              options={AUDIENCE_OPTIONS}
              required
            />
          </div>

          {form.audience === 'vip' ? (
            <div className={styles.formFull}>
              <label className={styles.vipListLabel}>
                اختر عملاء VIP
                <span className={styles.vipListMeta}>
                  {toArabicNum(form.customerIds.length)} / {toArabicNum(vipCustomers.length)} مختار
                </span>
              </label>

              {vipCustomers.length === 0 ? (
                <p className={styles.vipEmpty}>لا يوجد عملاء متاحون حالياً.</p>
              ) : (
                <div className={styles.vipList} role="group" aria-label="قائمة عملاء VIP">
                  {vipCustomers.map((customer) => {
                    const checked = form.customerIds.includes(customer.id);
                    return (
                      <label
                        key={customer.id}
                        className={[styles.vipItem, checked ? styles.vipItemChecked : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <input
                          type="checkbox"
                          className={styles.vipCheckbox}
                          checked={checked}
                          onChange={() => toggleCustomer(customer.id)}
                        />
                        <span className={styles.vipName}>{customer.name}</span>
                        <span className={styles.vipEmail}>{customer.email}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
