import styles from './pages.module.css';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import MiniBar from '../components/MiniBar';

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

export default function DashboardPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      
      {/* الصف الأول: بطاقات الإحصائيات */}
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="dollar" label="إجمالي المبيعات" value="٤٥,٢٣٠ $" accentVariant="success" sub="هذا الشهر" /></div>
        <div className="stagger-2"><StatCard icon="orders" label="طلبات جديدة" value="٣٨" accentVariant="info" sub="اليوم" /></div>
        <div className="stagger-3"><StatCard icon="products" label="منتجات نشطة" value="١٥٤" accentVariant="primary" sub="إجمالي" /></div>
        <div className="stagger-4"><StatCard icon="users" label="عملاء جدد" value="٢٧" accentVariant="warning" sub="هذا الأسبوع" /></div>
      </div>

      {/* الصف الثاني: المخطط والمنتجات */}
      <div className={styles.grid2}>
        
        {/* مخطط المبيعات - نسخة طبق الأصل من الأشهر */}
        <section className={`${styles.chartCard} stagger-2`}>
          <h3 className={styles.cardTitle}>المبيعات الأخيرة (آخر ٧ أيام)</h3>
          <div className={styles.barChart}>
            {weekData.map((h, i) => (
              <div key={i} className={styles.barCol}>
                <div
                  className={styles.bar}
                  style={{ 
                    height: `${h}%`, // هنا نطبق النسبة المئوية للارتفاع
                    animationDelay: `${i * 0.05}s` 
                  }}
                />
                <span className={styles.barLabel}>{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* قائمة المنتجات الأكثر مبيعاً */}
        <section className={`${styles.productListCard} stagger-3`}>
          <h3 className={styles.cardTitle}>المنتجات الأكثر مبيعاً</h3>
          <div className={styles.productList}>
            {topProducts.map((p, i) => (
              <div key={i} className={styles.productRow} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.rank} style={{color: '#c5a059', fontWeight: 'bold', minWidth: '20px'}}>{i + 1}</span>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', marginBottom: '4px'}}>{p.name}</div>
                  <MiniBar pct={p.pct} variant="primary" />
                </div>
                <span style={{fontSize: '12px', fontWeight: 'bold', marginRight: '10px'}}>{p.sold} قطعة</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* الصف الثالث: جدول الطلبات */}
      <section className={`${styles.tableCard} stagger-4`}>
        <h3 className={styles.cardTitle}>أحدث الطلبيات</h3>
        <Table
          headers={['رقم الطلب', 'العميل', 'المنتجات', 'المبلغ', 'الحالة', 'التاريخ']}
          rows={recentOrders}
        />
      </section>
    </div>
  );
}