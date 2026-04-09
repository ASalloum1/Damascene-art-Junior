import { Paperclip } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './CustomOrderPage.module.css';

export function CustomOrderPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="طلب مخصص" subtitle="صمّم قطعتك الفنية الخاصة" />
      <div className={styles.card}>
        <p className={styles.intro}>
          هل تريد قطعة فنية بمواصفات خاصة؟ أخبرنا بتفاصيل حلمك وسنعمل مع حرفيينا لتحويله إلى حقيقة.
        </p>

        <InputField label="اسمك" placeholder="الاسم الكامل" />
        <InputField label="البريد الإلكتروني" type="email" placeholder="email@example.com" />
        <InputField
          label="نوع المنتج"
          select
          options={[
            'فسيفساء / موزاييك',
            'خشب مطعّم بالصدف',
            'زجاج منفوخ',
            'بروكار حريري',
            'نحاسيات',
            'أخرى',
          ]}
        />

        <div className={styles.twoCol}>
          <InputField label="الأبعاد التقريبية" placeholder="مثلاً: ٦٠×٤٠ سم" />
          <InputField label="الميزانية التقريبية" placeholder="مثلاً: ٥٠٠-١٠٠٠$" />
        </div>

        <InputField
          label="وصف القطعة المطلوبة"
          textarea
          placeholder="صف لنا بالتفصيل ما تريده: التصميم، الألوان، الاستخدام..."
          rows={5}
        />

        <div className={styles.uploadZone}>
          <Paperclip size={28} className={styles.uploadIcon} />
          <span className={styles.uploadText}>ارفع صورة مرجعية (اختياري)</span>
        </div>

        <Button variant="primary" full>
          إرسال الطلب
        </Button>
      </div>
    </div>
  );
}

export default CustomOrderPage;
