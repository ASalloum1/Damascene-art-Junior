import { useState, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { mockActivities } from '../../data/mockData.js';
import { formatDate, formatTime } from '../../utils/formatters.js';
import styles from './ActivityLog.module.css';

const ACTION_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'إضافة', label: 'إضافة' },
  { value: 'تعديل', label: 'تعديل' },
  { value: 'حذف', label: 'حذف' },
  { value: 'تسجيل دخول', label: 'تسجيل دخول' },
  { value: 'تحديث حالة', label: 'تحديث حالة' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'أدمن', label: 'أدمن' },
  { value: 'مدير متجر', label: 'مدير متجر' },
  { value: 'عميل', label: 'عميل' },
];

const SECTION_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'منتجات', label: 'منتجات' },
  { value: 'طلبات', label: 'طلبات' },
  { value: 'مستخدمين', label: 'مستخدمين' },
  { value: 'إعدادات', label: 'إعدادات' },
  { value: 'مالية', label: 'مالية' },
];

function getActionVariant(action) {
  const map = {
    'إضافة': 'success',
    'تعديل': 'info',
    'حذف': 'danger',
    'تسجيل دخول': 'default',
    'تحديث حالة': 'warning',
  };
  return map[action] || 'default';
}

function getRoleVariant(role) {
  if (role === 'أدمن') return 'gold';
  if (role === 'مدير متجر') return 'info';
  return 'default';
}

const HEADERS = [
  {
    key: 'time',
    label: 'الوقت',
    sortable: true,
    render: (val) => (
      <div>
        <div>{formatDate(val)}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{formatTime(val)}</div>
      </div>
    ),
  },
  {
    key: 'user',
    label: 'المستخدم',
    render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{val}</span>
        <Badge text={row.role} variant={getRoleVariant(row.role)} size="sm" />
      </div>
    ),
  },
  {
    key: 'action',
    label: 'الإجراء',
    render: (val) => <Badge text={val} variant={getActionVariant(val)} />,
  },
  { key: 'details', label: 'التفاصيل' },
  {
    key: 'item',
    label: 'العنصر',
    render: (val) => val || '—',
  },
];

export default function ActivityLogPage() {
  const [search, setSearch] = useState(() => '');
  const [actionFilter, setActionFilter] = useState(() => '');
  const [roleFilter, setRoleFilter] = useState(() => '');
  const [sectionFilter, setSectionFilter] = useState(() => '');
  const [page, setPage] = useState(() => 1);
  const [pageSize, setPageSize] = useState(() => 10);

  const filtered = useMemo(() => {
    return mockActivities.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ? true :
        a.user.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q) ||
        (a.item ? a.item.toLowerCase().includes(q) : false);
      const matchAction = actionFilter === '' ? true : a.action === actionFilter;
      const matchRole = roleFilter === '' ? true : a.role === roleFilter;
      const matchSection = sectionFilter === '' ? true : a.section === sectionFilter;
      return matchSearch && matchAction && matchRole && matchSection;
    });
  }, [search, actionFilter, roleFilter, sectionFilter]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon} aria-hidden="true">
          <ClipboardList size={45} strokeWidth={2} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>سجل النشاطات</h1>
            <p className={styles.pageSubtitle}>تتبع جميع العمليات والإجراءات التي يقوم بها المستخدمون والمدراء</p>
        </div>
      </div>

      <div className={styles.filterBar} role="search" aria-label="فلاتر سجل النشاطات">
        <div className={styles.searchWrapper}>
          <SearchInput
            placeholder="بحث في السجل..."
            onSearch={(v) => setSearch(() => v)}
            value={search}
            onChange={(v) => setSearch(() => v)}
            aria-label="البحث في سجل النشاطات"
          />
        </div>
        <SelectField
          label="نوع الإجراء"
          hideLabel
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={(e) => { 
            const val = e.target.value;
            setActionFilter(() => val); 
            setPage(() => 1); 
          }}
          placeholder="نوع الإجراء"
        />
        <SelectField
          label="المستخدم"
          hideLabel
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={(e) => { 
            const val = e.target.value;
            setRoleFilter(() => val); 
            setPage(() => 1); 
          }}
          placeholder="المستخدم"
        />
        <SelectField
          label="القسم"
          hideLabel
          options={SECTION_OPTIONS}
          value={sectionFilter}
          onChange={(e) => { 
            const val = e.target.value;
            setSectionFilter(() => val); 
            setPage(() => 1); 
          }}
          placeholder="القسم"
        />
      </div>

      <div className={styles.tableCard}>
        <DataTable
          headers={HEADERS}
          rows={paged}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
            onPageChange: (p) => setPage(() => p),
            onPageSizeChange: (s) => { 
              setPageSize(() => s); 
              setPage(() => 1); 
            },
          }}
        />
      </div>
    </div>
  );
}
