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
  UserX,
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
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser]   = useState(null);

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

  const openDeleteConfirm = (user) => {
    setTargetUser(user);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    setConfirmOpen(false);
    showToast({ message: `تم حذف المستخدم ${targetUser?.firstName} ${targetUser?.lastName}`, type: 'success' });
    setTargetUser(null);
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
            { label: 'عرض', icon: Eye, onClick: () => showToast({ message: `عرض ${row.firstName}`, type: 'info' }) },
            { label: 'تعديل', icon: Pencil, onClick: () => showToast({ message: 'تعديل المستخدم', type: 'info' }) },
            { label: 'إعادة تعيين كلمة المرور', icon: KeyRound, onClick: () => showToast({ message: 'تم إرسال رابط إعادة التعيين', type: 'success' }) },
            { 
              label: row.status === 'نشط' ? 'تعطيل' : 'تفعيل', 
              icon: row.status === 'نشط' ? UserX : CheckCircle, 
              onClick: () => showToast({ message: `تم ${row.status === 'نشط' ? 'تعطيل' : 'تفعيل'} المستخدم`, type: 'warning' }) 
            },
            { label: 'حذف', icon: Trash2, danger: true, onClick: () => openDeleteConfirm(row) },
          ]}
        />
      ),
    },
  ], [showToast]);

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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المستخدم "${targetUser?.firstName} ${targetUser?.lastName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        danger
      />
    </div>
  );
}

