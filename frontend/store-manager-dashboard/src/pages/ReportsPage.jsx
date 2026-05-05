import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import MiniBar from '../components/MiniBar';

const monthlyHeights = [40, 55, 70, 60, 80, 95, 75, 88, 65, 90, 78, 85];
const monthLabels = ['ي', 'ف', 'مر', 'أب', 'ما', 'يو', 'يل', 'أغ', 'س', 'أك', 'ن', 'د'];

const categories = [
  { cat: 'فسيفساء / موزاييك', pct: 35 },
  { cat: 'خشب مطعّم بالصدف',  pct: 25 },
  { cat: 'زجاج منفوخ',        pct: 18 },
  { cat: 'بروكار',             pct: 12 },
  { cat: 'نحاسيات',            pct: 10 },
];

const metrics = [
  { label: 'إيرادات الشهر',     value: '٤٥,٢٣٠ $', change: '+١٢%',  up: true  },
  { label: 'متوسط قيمة الطلب', value: '٤٢٠ $',     change: '+٥%',   up: true  },
  { label: 'معدل الإرجاع',      value: '٣.٢%',      change: '-٠.٨%', up: false },
  { label: 'رضا العملاء',       value: '٤.٧ / ٥',   change: '+٠.٢',  up: true  },
];

export function ReportsPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="التقارير والإحصائيات" />
      <div className={styles.grid2}>
        <PageCard>
          <h3 className={styles.cardTitle}>تقرير المبيعات الشهرية</h3>
          <div className={styles.monthChart}>
            {monthlyHeights.map((h, i) => (
              <div key={i} className={styles.monthCol}>
                <div
                  className={`${styles.monthBar} ${i === 11 ? styles.current : styles.other}`}
                  style={{ height: h * 1.3 }}
                  role="img"
                  aria-label={`${monthLabels[i]}: ${h}`}
                />
                <span className={styles.monthLabel}>{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </PageCard>
        <PageCard>
          <h3 className={styles.cardTitle}>المبيعات حسب التصنيف</h3>
          {categories.map((c, i) => (
            <div key={i} className={styles.catRow}>
              <span className={styles.catName}>{c.cat}</span>
              <div style={{ flex: 1 }}>
                <MiniBar pct={c.pct * 2.5} variant="primary" />
              </div>
              <span className={styles.catPct}>{c.pct}%</span>
            </div>
          ))}
        </PageCard>
      </div>
      <PageCard>
        <h3 className={styles.cardTitle}>ملخص الأداء</h3>
        <div className={styles.grid4}>
          {metrics.map((m, i) => (
            <div key={i} className={styles.metricCard}>
              <div className={styles.metricLabel}>{m.label}</div>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={`${styles.metricChange} ${m.up ? styles.up : styles.down}`}>{m.change}</div>
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}

export default ReportsPage;
