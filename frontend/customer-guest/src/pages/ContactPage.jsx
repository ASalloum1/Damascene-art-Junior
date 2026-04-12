import { Mail, Phone, Smartphone, MapPin, Clock, Map } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './ContactPage.module.css';

export function ContactPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="آفاق التواصل" subtitle="يُسعدنا استقبال استفساراتكم ومشاركتكم شغف الفن" />
      <div className={styles.grid}>
        {/* Form Column */}
        <div className={styles.formCard}>
          <InputField label="الاسم الكريم" placeholder="الاسم الكامل كما تودون ظهوره" />
          <InputField label="عنوان المراسلة الرقمي" type="email" placeholder="email@example.com" />
          <InputField
            label="ماهية التواصل"
            select
            options={['استفسار عن مقتنى', 'متابعة طلبية', 'طلب قطعة مخصصة', 'مقترح إبداعي', 'أمر آخر']}
          />
          <InputField
            label="تفاصيل الرسالة"
            textarea
            placeholder="يرجى تدوين رسالتكم الموقرة هنا..."
            rows={5}
          />
          <Button variant="primary" full>
            إرسال المراسلة
          </Button>
        </div>

        {/* Info Column */}
        <div className={styles.infoCol}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoHeading}>معلومات التواصل</h3>
            <div className={styles.contactRow}>
              <Mail size={18} className={styles.contactIcon} />
              <span>info@damascene-art.com</span>
            </div>
            <div className={styles.contactRow}>
              <Phone size={18} className={styles.contactIcon} />
              <span>+963 11 XXX XXXX</span>
            </div>
            <div className={styles.contactRow}>
              <Smartphone size={18} className={styles.contactIcon} />
              <span>واتساب: +963 9XX XXX XXX</span>
            </div>
            <div className={styles.contactRow}>
              <MapPin size={18} className={styles.contactIcon} />
              <span>دمشق — سوق الحميدية</span>
            </div>
            <div className={styles.contactRow}>
              <Clock size={18} className={styles.contactIcon} />
              <span>السبت - الخميس: ٩ ص - ٦ م</span>
            </div>
          </div>

          <div className={styles.mapCard}>
            <Map size={28} className={styles.mapIcon} />
            <span>خريطة الموقع — سوق الحميدية، دمشق</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
