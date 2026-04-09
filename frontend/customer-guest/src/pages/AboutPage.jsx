import { BookOpen } from 'lucide-react';
import { PageHero } from '../components/PageHero.jsx';
import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <div>
      <PageHero
        title="رحلتنا"
        subtitle="نقل عبق دمشق وأصالتها إلى أرجاء المعمورة"
        icon={BookOpen}
      />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>بذور الإبداع</h2>
          <p className={styles.text}>
            انطلقت حكايتنا من نبض دمشق العتيقة، من أزقة أسواقها العبقة وورش المبدعين الذين توارثوا الفن جيلاً بعد جيل. نؤمن بأن كل مقتنىً يحمل في طياته روح حضارةٍ ضاربة في عمق التاريخ.
          </p>
          <h2 className={styles.heading}>تطلعاتنا</h2>
          <p className={styles.text}>
            نسعى لنكون الجسر الحضاري الذي يعبر ببدائع الفن الدمشقي إلى كل صرحٍ في العالم، مع صون نقاء الصنعة ورعاية أنامل المبدعين المحليين.
          </p>
          <h2 className={styles.heading}>أهدافنا السامية</h2>
          <p className={styles.text}>
            تتمحور رسالتنا حول تقديم قطع فنية دمشقية تحاكي الكمال، بضمان وصولها بأمان إلى أي وجهة عالمية، مع الالتزام الراسخ بتمكين المجتمع الحرفي السوري ثقافياً واقتصادياً.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
