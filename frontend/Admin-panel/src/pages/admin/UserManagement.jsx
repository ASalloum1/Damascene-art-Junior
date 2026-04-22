import { useState, useMemo, useCallback } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  Store,
  ShoppingBag,
  Eye,
  Pencil,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
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
import { mockUsers, mockStores } from '../../data/mockData.js';
import { formatDate, relativeTime, toArabicNum } from '../../utils/formatters.js';
import styles from './UserManagement.module.css';

const ROLE_VARIANT = {
  'أدمن':       'danger',
  'مدير متجر':  'gold',
  'عميل':       'success',
};

const STATUS_VARIANT = {
  'نشط':   'success',
  'معطّل': 'danger',
};

const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const { showToast } = useToast();

  // Filter state
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [statusFilter, setStatus] = useState('');

  // Pagination
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(PAGE_SIZE);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal state
  const [addOpen, setAddOpen]         = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [viewUser, setViewUser]       = useState(null);
  const [editOpen, setEditOpen]       = useState(false);
  const [editForm, setEditForm]       = useState(null);
  const [resetOpen, setResetOpen]     = useState(false);
  const [resetUser, setResetUser]     = useState(null);
  const [resetForm, setResetForm]     = useState({ password: '', confirmPassword: '' });
  // Add User form state
  const [form, setForm] = useState(() => ({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    store: '',
    status: 'نشط',
  }));

  // Computed stats
  const stats = useMemo(() => ({
    total: mockUsers.length,
    admins: mockUsers.filter((u) => u.role === 'أدمن').length,
    managers: mockUsers.filter((u) => u.role === 'مدير متجر').length,
    customers: mockUsers.filter((u) => u.role === 'عميل').length,
  }), []);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return mockUsers.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        fullName.includes(s) ||
        u.email.toLowerCase().includes(s);
      const matchRole   = !roleFilter   || u.role   === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const pagedRows = useMemo(() => 
    filteredRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredRows, page, pageSize]
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleAddUser = () => {
    setAddOpen(false);
    showToast({ message: 'تم إضافة المستخدم بنجاح', type: 'success' });
    setForm({ firstName: '', lastName: '', email: '', password: '', role: '', store: '', status: 'نشط' });
  };

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
      role: user.role,
      store: user.store || '',
      status: user.status,
    });
    setEditOpen(true);
  }, []);

  const handleEditUser = () => {
    setEditOpen(false);
    showToast({ message: 'تم حفظ تعديلات المستخدم بنجاح', type: 'success' });
  };

  const openResetPasswordModal = useCallback((user) => {
    setResetUser(user);
    setResetForm({ password: '', confirmPassword: '' });
    setResetOpen(true);
  }, []);

  const handleResetPassword = () => {
    if (!resetForm.password || !resetForm.confirmPassword) {
      showToast({ message: 'يرجى إدخال كلمة المرور وتأكيدها', type: 'warning' });
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      showToast({ message: 'كلمة المرور وتأكيدها غير متطابقين', type: 'error' });
      return;
    }

    setResetOpen(false);
    showToast({ message: `تمت إعادة تعيين كلمة المرور للمستخدم ${resetUser?.firstName || ''}`, type: 'success' });
  };

  const handleBulkAction = (action) => {
    showToast({ 
      message: `تم تنفيذ إجراء (${action}) على ${toArabicNum(selectedIds.length)} مستخدمين`, 
      type: 'info' 
    });
    setSelectedIds([]);
  };

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
      render: (val) => val ? val : '—',
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
  ], [showToast, openViewUserModal, openEditUserModal, openResetPasswordModal]);

  const storeOptions = useMemo(() => mockStores.map((s) => ({ value: s.name, label: s.name })), []);

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1 className={styles.pageTitle}>إدارة المستخدمين</h1>
          <p className={styles.pageSubtitle}>إدارة الصلاحيات، الأدوار، وحالات حسابات المستخدمين والمدراء.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setAddOpen(true)}>
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard icon={Users}      label="إجمالي المستخدمين" value={toArabicNum(stats.total)}     color="blue" />
        <StatCard icon={Shield}     label="مشرفين (Admin)"    value={toArabicNum(stats.admins)}    color="red" />
        <StatCard icon={Store}      label="مدراء متاجر"       value={toArabicNum(stats.managers)}  color="gold" />
        <StatCard icon={ShoppingBag} label="عملاء"            value={toArabicNum(stats.customers)} color="green" />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'بحث بالاسم أو البريد الإلكتروني...',
            value: search,
            onChange: setSearch,
          },
          {
            type: 'select',
            label: 'الدور',
            placeholder: 'الكل',
            value: roleFilter,
            onChange: (v) => { setRole(v); setPage(1); },
            options: [
              { value: 'أدمن', label: 'أدمن' },
              { value: 'مدير متجر', label: 'مدير متجر' },
              { value: 'عميل', label: 'عميل' },
            ],
          },
          {
            type: 'select',
            label: 'الحالة',
            placeholder: 'الكل',
            value: statusFilter,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: [
              { value: 'نشط', label: 'نشط' },
              { value: 'معطّل', label: 'معطّل' },
            ],
          },
        ]}
        onReset={resetFilters}
        activeCount={[search, roleFilter, statusFilter].filter(Boolean).length}
      />

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 ? (
        <div className={`${styles.bulkActions} slideInDown`}>
          <div className={styles.bulkInfo}>
            <span className={styles.bulkCount}>{toArabicNum(selectedIds.length)}</span>
            <span>مستخدمين مختارين</span>
          </div>
          <div className={styles.bulkButtons}>
            <Button variant="ghost" size="sm" icon={CheckCircle} onClick={() => handleBulkAction('تفعيل')}>تفعيل</Button>
            <Button variant="ghost" size="sm" icon={XCircle} onClick={() => handleBulkAction('تعطيل')}>تعطيل</Button>
            <Button variant="ghost" size="sm" icon={Trash2} danger onClick={() => handleBulkAction('حذف')}>حذف</Button>
            <div className={styles.bulkDivider} />
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>إلغاء التحديد</Button>
          </div>
        </div>
      ) : null}

      {/* Table */}
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
            total: filteredRows.length,
            onPageChange: setPage,
            onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
          }}
        />
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة مستخدم جديد"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddUser}>إنشاء المستخدم</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <InputField
            label="الاسم الأول"
            placeholder="أدخل الاسم الأول"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
          <InputField
            label="اسم العائلة"
            placeholder="أدخل اسم العائلة"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
          <div className={styles.formFull}>
            <InputField
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formFull}>
            <InputField
              label="كلمة المرور"
              type="password"
              placeholder="٨ أحرف على الأقل"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <SelectField
            label="الدور"
            placeholder="اختر الدور"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, store: '' }))}
            options={[
              { value: 'أدمن', label: 'أدمن' },
              { value: 'مدير متجر', label: 'مدير متجر' },
              { value: 'عميل', label: 'عميل' },
            ]}
          />
          {form.role === 'مدير متجر' ? (
            <SelectField
              label="المتجر"
              placeholder="اختر المتجر"
              value={form.store}
              onChange={(e) => setForm((f) => ({ ...f, store: e.target.value }))}
              options={storeOptions}
            />
          ) : null}
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

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="تعديل بيانات المستخدم"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditUser}>حفظ التعديلات</Button>
          </>
        }
      >
        {editForm ? (
          <div className={styles.formGrid}>
            <InputField
              label="الاسم الأول"
              value={editForm.firstName}
              onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
            <InputField
              label="اسم العائلة"
              value={editForm.lastName}
              onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
              required
            />
            <div className={styles.formFull}>
              <InputField
                label="البريد الإلكتروني"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <SelectField
              label="الدور"
              value={editForm.role}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value, store: '' }))}
              options={[
                { value: 'أدمن', label: 'أدمن' },
                { value: 'مدير متجر', label: 'مدير متجر' },
                { value: 'عميل', label: 'عميل' },
              ]}
            />
            {editForm.role === 'مدير متجر' ? (
              <SelectField
                label="المتجر"
                placeholder="اختر المتجر"
                value={editForm.store}
                onChange={(e) => setEditForm((f) => ({ ...f, store: e.target.value }))}
                options={storeOptions}
              />
            ) : null}
            <SelectField
              label="الحالة"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
              options={[
                { value: 'نشط', label: 'نشط' },
                { value: 'معطّل', label: 'معطّل' },
              ]}
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title="عرض بيانات المستخدم"
        size="md"
        footer={<Button variant="ghost" onClick={() => setViewOpen(false)}>إغلاق</Button>}
      >
        {viewUser ? (
          <div className={styles.viewUserContent}>
            <div className={styles.viewUserHeader}>
              <div className={styles.avatar}>
                {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
              </div>
              <div>
                <div className={styles.userName}>{viewUser.firstName} {viewUser.lastName}</div>
                <div className={styles.userEmail}>{viewUser.email}</div>
              </div>
            </div>

            <div className={styles.viewUserGrid}>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>الدور</span>
                <Badge text={viewUser.role} variant={ROLE_VARIANT[viewUser.role] || 'default'} />
              </div>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>الحالة</span>
                <Badge text={viewUser.status} variant={STATUS_VARIANT[viewUser.status] || 'default'} />
              </div>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>المتجر</span>
                <span className={styles.viewUserValue}>{viewUser.store ? viewUser.store : '—'}</span>
              </div>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>تاريخ التسجيل</span>
                <span className={styles.viewUserValue}>{formatDate(viewUser.registeredAt)}</span>
              </div>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>آخر نشاط</span>
                <span className={styles.viewUserValue}>{relativeTime(viewUser.lastActive)}</span>
              </div>
              <div className={styles.viewUserItem}>
                <span className={styles.viewUserLabel}>معرف المستخدم</span>
                <span className={styles.viewUserValue}>{viewUser.id}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="إعادة تعيين كلمة المرور"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>إلغاء</Button>
            <Button onClick={handleResetPassword}>حفظ كلمة المرور</Button>
          </>
        }
      >
        {resetUser ? (
          <div className={styles.formGrid}>
            <div className={styles.formFull}>
              <div className={styles.resetUserMeta}>
                إعادة تعيين كلمة المرور للمستخدم:
                <span className={styles.resetUserName}> {resetUser.firstName} {resetUser.lastName}</span>
              </div>
            </div>
            <div className={styles.formFull}>
              <InputField
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="٨ أحرف على الأقل"
                value={resetForm.password}
                onChange={(e) => setResetForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formFull}>
              <InputField
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
}

