import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  Store,
  ShoppingBag,
  Eye,
  Pencil,
  KeyRound,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import Modal from '../../components/ui/Modal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate, relativeTime, toArabicNum } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getRoleLabel, getStatusLabel } from '../../utils/adminApi.js';
import styles from './UserManagement.module.css';

const ROLE_VARIANT = {
  أدمن: 'danger',
  'مدير متجر': 'gold',
  عميل: 'success',
};

const STATUS_VARIANT = {
  نشط: 'success',
  'معطّل': 'danger',
};

const PAGE_SIZE = 10;

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'customers',
  storeId: '',
  phone: '',
  address: '',
  status: 'active',
};

function normalizeUser(user) {
  return {
    id: user.id,
    firstName: user.first_name || user.full_name?.split(' ')?.[0] || '',
    lastName: user.last_name || user.full_name?.split(' ')?.slice(1).join(' ') || '',
    email: user.email || '',
    role: user.role_label || getRoleLabel(user.role),
    roleKey: user.role || 'customers',
    store: user.store?.name || user.store || '',
    storeId: user.store?.id || user.store_id || '',
    status: user.status_label || getStatusLabel(user.status),
    statusKey: user.status || 'active',
    registeredAt: user.registered_at || user.created_at || null,
    lastActive: user.last_active || user.updated_at || null,
  };
}

export default function UserManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));

  const loadUsers = useCallback(async () => {
    try {
      const query = new URLSearchParams();

      if (search) query.set('search', search);
      if (roleFilter) query.set('role', roleFilter);
      if (statusFilter) query.set('status', statusFilter);

      const path = query.toString()
        ? `${API_CONFIG.ENDPOINTS.users}?${query.toString()}`
        : API_CONFIG.ENDPOINTS.users;
      const data = await apiRequest(path);
      setUsers((data?.data?.users || []).map(normalizeUser));
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المستخدمين', type: 'error' });
    }
  }, [roleFilter, search, showToast, statusFilter]);

  const loadStores = useCallback(async () => {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.stores);
      setStores(data?.data?.stores || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل المتاجر', type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.roleKey === 'admin').length,
    managers: users.filter((user) => user.roleKey === 'store-manager').length,
    customers: users.filter((user) => user.roleKey === 'customers').length,
  }), [users]);

  const pagedRows = useMemo(
    () => users.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, users]
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleAddUser = useCallback(async () => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.users, {
        method: 'POST',
        body: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          password_confirmation: form.password,
          phone: form.phone,
          address: form.address,
          role: form.role,
          status: form.status,
          store_id: form.role === 'store-manager' ? form.storeId || null : null,
        },
      });
      setAddOpen(false);
      showToast({ message: 'تم إضافة المستخدم بنجاح', type: 'success' });
      setForm({ ...INITIAL_FORM });
      await loadUsers();
    } catch (error) {
      showToast({ message: error.message || 'تعذر إضافة المستخدم', type: 'error' });
    }
  }, [form, loadUsers, showToast]);

  const openViewUserModal = useCallback((user) => {
    setViewUser(user);
    setViewOpen(true);
  }, []);

  const openEditUserModal = useCallback((user) => {
    setEditForm({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.roleKey,
      storeId: user.storeId || '',
      status: user.statusKey,
      phone: user.phone || '',
      address: user.address || '',
    });
    setEditOpen(true);
  }, []);

  const handleEditUser = useCallback(async () => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.userDetails(editForm.id), {
        method: 'PUT',
        body: {
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          email: editForm.email,
          role: editForm.role,
          status: editForm.status,
          store_id: editForm.role === 'store-manager' ? editForm.storeId || null : null,
          phone: editForm.phone,
          address: editForm.address,
        },
      });
      setEditOpen(false);
      showToast({ message: 'تم حفظ تعديلات المستخدم بنجاح', type: 'success' });
      await loadUsers();
    } catch (error) {
      showToast({ message: error.message || 'تعذر تعديل المستخدم', type: 'error' });
    }
  }, [editForm, loadUsers, showToast]);

  const openResetPasswordModal = useCallback((user) => {
    setResetUser(user);
    setResetForm({ newPassword: '', confirmPassword: '' });
    setResetOpen(true);
  }, []);

  const handleResetPassword = useCallback(async () => {
    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      showToast({ message: 'يرجى ملء جميع الحقول', type: 'warning' });
      return;
    }
    if (resetForm.newPassword.length < 8) {
      showToast({ message: 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل', type: 'error' });
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      showToast({ message: 'كلمتا المرور غير متطابقتين', type: 'error' });
      return;
    }

    try {
      await apiRequest(API_CONFIG.ENDPOINTS.userResetPassword(resetUser.id), {
        method: 'POST',
        body: {
          password: resetForm.newPassword,
          password_confirmation: resetForm.confirmPassword,
        },
      });
      setResetOpen(false);
      showToast({ message: 'تمت إعادة تعيين كلمة المرور بنجاح', type: 'success' });
    } catch (error) {
      showToast({ message: error.message || 'تعذر إعادة تعيين كلمة المرور', type: 'error' });
    }
  }, [resetForm, resetUser, showToast]);

  const headers = useMemo(() => [
    {
      key: 'user',
      label: 'المستخدم',
      render: (_, row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>{row.firstName?.[0]}{row.lastName?.[0]}</div>
          <div>
            <div className={styles.userName}>{row.firstName} {row.lastName}</div>
            <div className={styles.userEmail}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'الدور',
      render: (val) => <Badge text={val} variant={ROLE_VARIANT[val] || 'default'} />,
    },
    {
      key: 'store',
      label: 'المتجر',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => <Badge text={val} variant={STATUS_VARIANT[val] || 'default'} />,
    },
    {
      key: 'registeredAt',
      label: 'تاريخ التسجيل',
      render: (val) => formatDate(val),
    },
    {
      key: 'lastActive',
      label: 'آخر نشاط',
      render: (val) => relativeTime(val),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_, row) => (
        <ActionMenu
          actions={[
            { label: 'عرض', icon: Eye, onClick: () => openViewUserModal(row) },
            { label: 'تعديل', icon: Pencil, onClick: () => openEditUserModal(row) },
            { label: 'إعادة تعيين كلمة المرور', icon: KeyRound, onClick: () => openResetPasswordModal(row) },
          ]}
        />
      ),
    },
  ], [openEditUserModal, openResetPasswordModal, openViewUserModal]);

  const storeOptions = useMemo(
    () => stores.map((store) => ({ value: store.id, label: store.name })),
    [stores]
  );

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1 className={styles.pageTitle}>إدارة المستخدمين</h1>
          <p className={styles.pageSubtitle}>إدارة الصلاحيات، الأدوار، وحالات حسابات المستخدمين والمدراء.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setAddOpen(true)}>
          إضافة مستخدم جديد
        </Button>
      </div>

      <div className={styles.statsRow}>
        <StatCard icon={Users} label="إجمالي المستخدمين" value={toArabicNum(stats.total)} color="blue" />
        <StatCard icon={Shield} label="مشرفين (Admin)" value={toArabicNum(stats.admins)} color="red" />
        <StatCard icon={Store} label="مدراء متاجر" value={toArabicNum(stats.managers)} color="gold" />
        <StatCard icon={ShoppingBag} label="عملاء" value={toArabicNum(stats.customers)} color="green" />
      </div>

      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'بحث بالاسم أو البريد الإلكتروني...',
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
          },
          {
            type: 'select',
            label: 'الدور',
            placeholder: 'الكل',
            value: roleFilter,
            onChange: (value) => {
              setRole(value);
              setPage(1);
            },
            options: [
              { value: 'admin', label: 'أدمن' },
              { value: 'store-manager', label: 'مدير متجر' },
              { value: 'customers', label: 'عميل' },
            ],
          },
          {
            type: 'select',
            label: 'الحالة',
            placeholder: 'الكل',
            value: statusFilter,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            options: [
              { value: 'active', label: 'نشط' },
              { value: 'disabled', label: 'معطّل' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, roleFilter, statusFilter].filter(Boolean).length}
      />

      <div className={styles.tableCard}>
        <DataTable
          headers={headers}
          rows={pagedRows}
          selectable
          selected={selectedIds}
          onSelectChange={setSelectedIds}
          pagination={{
            page,
            pageSize,
            total: users.length,
            onPageChange: (value) => setPage(value),
            onPageSizeChange: (value) => {
              setPageSize(value);
              setPage(1);
            },
          }}
        />
      </div>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة مستخدم جديد"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddUser}>إنشاء المستخدم</Button>
          </>
        )}
      >
        <div className={styles.formGrid}>
          <InputField label="الاسم الأول" value={form.firstName} onChange={(e) => setForm((value) => ({ ...value, firstName: e.target.value }))} required />
          <InputField label="الاسم الأخير" value={form.lastName} onChange={(e) => setForm((value) => ({ ...value, lastName: e.target.value }))} required />
          <InputField label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm((value) => ({ ...value, email: e.target.value }))} required />
          <InputField label="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm((value) => ({ ...value, password: e.target.value }))} required />
          <InputField label="الهاتف" value={form.phone} onChange={(e) => setForm((value) => ({ ...value, phone: e.target.value }))} />
          <InputField label="العنوان" value={form.address} onChange={(e) => setForm((value) => ({ ...value, address: e.target.value }))} />
          <SelectField
            label="الدور"
            value={form.role}
            onChange={(e) => setForm((value) => ({ ...value, role: e.target.value }))}
            options={[
              { value: 'admin', label: 'أدمن' },
              { value: 'store-manager', label: 'مدير متجر' },
              { value: 'customers', label: 'عميل' },
            ]}
          />
          <SelectField
            label="الحالة"
            value={form.status}
            onChange={(e) => setForm((value) => ({ ...value, status: e.target.value }))}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'disabled', label: 'معطّل' },
            ]}
          />
          {form.role === 'store-manager' ? (
            <SelectField
              label="المتجر"
              placeholder="اختر المتجر"
              value={form.storeId}
              onChange={(e) => setForm((value) => ({ ...value, storeId: e.target.value }))}
              options={storeOptions}
            />
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title="تفاصيل المستخدم"
      >
        {viewUser ? (
          <div className={styles.viewCard}>
            <p><strong>الاسم:</strong> {viewUser.firstName} {viewUser.lastName}</p>
            <p><strong>البريد:</strong> {viewUser.email}</p>
            <p><strong>الدور:</strong> {viewUser.role}</p>
            <p><strong>المتجر:</strong> {viewUser.store || '—'}</p>
            <p><strong>الحالة:</strong> {viewUser.status}</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="تعديل المستخدم"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditUser}>حفظ التعديلات</Button>
          </>
        )}
      >
        <div className={styles.formGrid}>
          <InputField label="الاسم الأول" value={editForm?.firstName || ''} onChange={(e) => setEditForm((value) => ({ ...value, firstName: e.target.value }))} />
          <InputField label="الاسم الأخير" value={editForm?.lastName || ''} onChange={(e) => setEditForm((value) => ({ ...value, lastName: e.target.value }))} />
          <InputField label="البريد الإلكتروني" type="email" value={editForm?.email || ''} onChange={(e) => setEditForm((value) => ({ ...value, email: e.target.value }))} />
          <SelectField
            label="الدور"
            value={editForm?.role || 'customers'}
            onChange={(e) => setEditForm((value) => ({ ...value, role: e.target.value }))}
            options={[
              { value: 'admin', label: 'أدمن' },
              { value: 'store-manager', label: 'مدير متجر' },
              { value: 'customers', label: 'عميل' },
            ]}
          />
          <SelectField
            label="الحالة"
            value={editForm?.status || 'active'}
            onChange={(e) => setEditForm((value) => ({ ...value, status: e.target.value }))}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'disabled', label: 'معطّل' },
            ]}
          />
          {editForm?.role === 'store-manager' ? (
            <SelectField
              label="المتجر"
              placeholder="اختر المتجر"
              value={editForm?.storeId || ''}
              onChange={(e) => setEditForm((value) => ({ ...value, storeId: e.target.value }))}
              options={storeOptions}
            />
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title={`إعادة تعيين كلمة المرور: ${resetUser?.firstName || ''}`}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>إلغاء</Button>
            <Button onClick={handleResetPassword}>تأكيد</Button>
          </>
        )}
      >
        <div className={styles.formGrid}>
          <InputField
            label="كلمة المرور الجديدة"
            type="password"
            value={resetForm.newPassword}
            onChange={(e) => setResetForm((value) => ({ ...value, newPassword: e.target.value }))}
          />
          <InputField
            label="تأكيد كلمة المرور"
            type="password"
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm((value) => ({ ...value, confirmPassword: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
