import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { Icon } from '../components/SvgIcons';

const products = [
  ['', 'طاولة موزاييك دمشقية كبيرة', 'فسيفساء', '١,٢٠٠ $', '١٢', <Badge key="s1" text="نشط" variant="success" />, ''],
  ['', 'صندوق خشب مطعّم بالصدف', 'خشب مطعّم', '٤٠٠ $', '٢٥', <Badge key="s2" text="نشط" variant="success" />, ''],
  ['', 'مزهرية زجاج منفوخ يدوي', 'زجاج منفوخ', '٣٥٠ $', '٠', <Badge key="s3" text="نفد المخزون" variant="error" />, ''],
  ['', 'وشاح بروكار حريري', 'بروكار', '١٥٠ $', '٤٠', <Badge key="s4" text="نشط" variant="success" />, ''],
  ['', 'طبق نحاس محفور', 'نحاسيات', '٢٨٠ $', '٣', <Badge key="s5" text="مخزون منخفض" variant="warning" />, ''],
];

// Replace image/action placeholders with components
const rows = products.map((row, i) => [
  <div key={`img-${i}`} className={styles.iconCell}><Icon name="image" size={20} /></div>,
  row[1], row[2], row[3], row[4], row[5],
  <div key={`act-${i}`} style={{ display: 'flex', gap: 8 }}>
    <button className="icon-btn-standard" title="تعديل"><Icon name="pencil" size={16} /></button>
    <button className="icon-btn-standard" title="حذف"><Icon name="trash" size={16} style={{ color: 'var(--color-error)' }} /></button>
  </div>
]);

export function ProductsPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="إدارة المنتجات" action="إضافة منتج جديد" onAction={() => {}} />
      <div className="stagger-1">
        <PageCard>
          <div className={styles.filterBar}>
            <input className={styles.filterInput} placeholder="بحث عن منتج..." />
            <select className={styles.filterSelect} aria-label="التصنيف">
              <option>كل التصنيفات</option>
              <option>فسيفساء / موزاييك</option>
              <option>خشب مطعّم بالصدف</option>
              <option>زجاج منفوخ</option>
              <option>بروكار</option>
              <option>نحاسيات</option>
            </select>
            <select className={styles.filterSelect} aria-label="الحالة">
              <option>الحالة: الكل</option>
              <option>نشط</option>
              <option>مخفي</option>
              <option>نفد المخزون</option>
            </select>
          </div>
          <Table
            headers={['الصورة', 'اسم المنتج', 'التصنيف', 'السعر', 'المخزون', 'الحالة', 'إجراءات']}
            rows={rows}
            emptyTitle="جناح العرض فارغ"
            emptyDesc="لم يتم إضافة أي قطع فنية بعد. ابدأ بإضافة أول تحفة يدوية إلى متجرك."
          />
        </PageCard>
      </div>
    </div>
  );
}

export default ProductsPage;
