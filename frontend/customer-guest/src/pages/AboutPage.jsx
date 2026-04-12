import { BookOpen } from 'lucide-react';
import { PageHero } from '../components/PageHero.jsx';
import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <div>
      <PageHero
        title="من نحن"
        subtitle="نحمل إرث دمشق إلى العالم"
        icon={BookOpen}
      />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>قصتنا</h2>
          <p className={styles.text}>
            بدأت رحلتنا من قلب دمشق القديمة — من أزقة سوق الحميدية وورش الحرفيين الذين ورثوا صنعتهم أباً عن جد. نؤمن بأن كل قطعة فنية دمشقية تحمل في طياتها قصة حضارة عمرها آلاف السنين.
          </p>
          <h2 className={styles.heading}>رؤيتنا</h2>
          <p className={styles.text}>
            أن نكون الجسر الذي يوصل روائع الفن الدمشقي إلى كل بيت في العالم، مع الحفاظ على أصالة الصنعة ودعم الحرفيين المحليين.
          </p>
          <h2 className={styles.heading}>رسالتنا</h2>
          <p className={styles.text}>
            تقديم قطع فنية دمشقية أصيلة بجودة عالية، مع ضمان وصولها سليمة إلى أي مكان في العالم، ودعم المجتمع الحرفي السوري اقتصادياً وثقافياً.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
