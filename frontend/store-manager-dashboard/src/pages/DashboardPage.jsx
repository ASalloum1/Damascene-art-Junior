import styles from './pages.module.css';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import MiniBar from '../components/MiniBar';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const recentOrders = [
  ['#1084', 'أحمد الشامي', 'طاولة موزاييك × ١', '١,٢٠٠ $', <Badge key="b1" text="جديد" variant="info" />, '٢٠٢٦/٠٤/٠٣'],
  ['#1083', 'سارة مولر', 'صندوق صدف × ٢', '٨٠٠ $', <Badge key="b2" text="قيد التجهيز" variant="warning" />, '٢٠٢٦/٠٤/٠٢'],
  ['#1082', 'جون سميث', 'مزهرية زجاج × ١', '٣٥٠ $', <Badge key="b3" text="تم الشحن" variant="success" />, '٢٠٢٦/٠٤/٠١'],
];

const topProducts = [
  { name: 'طاولة موزاييك دمشقية', sold: 48, pct: 90 },
  { name: 'صندوق خشب مطعّم بالصدف', sold: 35, pct: 70 },
  { name: 'مزهرية زجاج منفوخ', sold: 28, pct: 55 },
  { name: 'وشاح بروكار حريري', sold: 22, pct: 44 },
];

const weekDays = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const weekData = [65, 45, 80, 55, 90, 70, 85];

export function DashboardPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      {/* Stat Cards */}
      <div className={styles.statRow}>
        <StatCard icon={DollarSign}   label="إجمالي المبيعات"  value="٤٥,٢٣٠ $" accentVariant="success"  sub="هذا الشهر" />
        <StatCard icon={ShoppingCart} label="طلبات جديدة"      value="٣٨"        accentVariant="info"     sub="اليوم" />
        <StatCard icon={Package}      label="منتجات نشطة"      value="١٥٤"       accentVariant="primary"  sub="إجمالي" />
        <StatCard icon={Users}        label="عملاء جدد"        value="٢٧"        accentVariant="warning"  sub="هذا الأسبوع" />
      </div>

      {/* Charts Row */}
      <div className={styles.grid2}>
        <PageCard>
          <h3 className={styles.cardTitle}>المبيعات الأخيرة (آخر ٧ أيام)</h3>
          <div className={styles.barChart}>
            {weekData.map((h, i) => (
              <div key={i} className={styles.barCol}>
                <span className={styles.barLabel}>{weekDays[i]}</span>
                <div
                  className={styles.bar}
                  style={{ height: h }}
                  role="img"
                  aria-label={`${weekDays[i]}: ${h}%`}
                />
              </div>
            ))}
          </div>
        </PageCard>

        <PageCard>
          <h3 className={styles.cardTitle}>المنتجات الأكثر مبيعاً</h3>
          <div className={styles.productList}>
            {topProducts.map((p, i) => (
              <div key={i} className={styles.productRow}>
                <span className={styles.rank}>{i + 1}</span>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{p.name}</div>
                  <MiniBar pct={p.pct} variant="primary" />
                </div>
                <span className={styles.soldCount}>{p.sold} قطعة</span>
              </div>
            ))}
          </div>
        </PageCard>
      </div>

      {/* Recent Orders */}
      <PageCard>
        <h3 className={styles.cardTitle}>آخر الطلبات</h3>
        <Table
          headers={['رقم الطلب', 'العميل', 'المنتجات', 'المبلغ', 'الحالة', 'التاريخ']}
          rows={recentOrders}
        />
      </PageCard>
    </div>
  );
}

export default DashboardPage;
