import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Icon } from '../components/SvgIcons';

const alertRows = [
  [
    'مزهرية زجاج منفوخ', 'زجاج منفوخ', '٠', '٥',
    <Badge key="b1" text="نفد" variant="error" />,
    <ActionBtn key="a1" text="طلب تعبئة" variant="info" onClick={() => {}} icon={<Icon name="plus" size={14} />} />,
  ],
  [
    'طبق نحاس محفور', 'نحاسيات', '٣', '١٠',
    <Badge key="b2" text="منخفض" variant="warning" />,
    <ActionBtn key="a2" text="طلب تعبئة" variant="info" onClick={() => {}} icon={<Icon name="plus" size={14} />} />,
  ],
  [
    'مرآة موزاييك صغيرة', 'فسيفساء', '٤', '٨',
    <Badge key="b3" text="منخفض" variant="warning" />,
    <ActionBtn key="a3" text="طلب تعبئة" variant="info" onClick={() => {}} icon={<Icon name="plus" size={14} />} />,
  ],
];

const movementRows = [
  ['٠٣/٠٤/٢٠٢٦', 'طاولة موزاييك', 'خروج (بيع)', '-١', 'النظام'],
  ['٠٢/٠٤/٢٠٢٦', 'صندوق صدف', 'دخول (تعبئة)', '+٢٠', 'محمد'],
  ['٠١/٠٤/٢٠٢٦', 'وشاح بروكار', 'خروج (بيع)', '-٣', 'النظام'],
];

export function InventoryPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="إدارة المخزون" />
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="products"       label="إجمالي المنتجات" value="١٥٤" accentVariant="info"    sub="في المخزن" /></div>
        <div className="stagger-2"><StatCard icon="warning" label="مخزون منخفض"     value="١٢"  accentVariant="warning" sub="يحتاج تعبئة" /></div>
        <div className="stagger-3"><StatCard icon="xCircle"       label="نفد المخزون"      value="٥"   accentVariant="error"   sub="غير متوفر" /></div>
      </div>
      <div className="stagger-2">
        <PageCard>
          <h3 className={styles.cardTitle}>تنبيهات المخزون</h3>
          <Table
            headers={['المنتج', 'التصنيف', 'الكمية الحالية', 'الحد الأدنى', 'الحالة', 'إجراء']}
            rows={alertRows}
          />
        </PageCard>
      </div>
      <div className="stagger-3">
        <PageCard>
          <h3 className={styles.cardTitle}>سجل حركة المخزون</h3>
          <Table
            headers={['التاريخ', 'المنتج', 'النوع', 'الكمية', 'بواسطة']}
            rows={movementRows}
          />
        </PageCard>
      </div>
    </div>
  );
}

export default InventoryPage;
