import { Mail, Phone, Smartphone, MapPin, Clock, Map } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Btn } from '../components/Btn.jsx';
import styles from './ContactPage.module.css';

export function ContactPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="تواصل معنا" subtitle="نسعد بسماع رأيك واستفساراتك" />
      <div className={styles.grid}>
        {/* Form Column */}
        <div className={styles.formCard}>
          <InputField label="الاسم" placeholder="اسمك الكامل" />
          <InputField label="البريد الإلكتروني" type="email" placeholder="email@example.com" />
          <InputField
            label="الموضوع"
            select
            options={['استفسار عام', 'مشكلة في طلب', 'طلب مخصص', 'اقتراح', 'أخرى']}
          />
          <InputField
            label="الرسالة"
            textarea
            placeholder="اكتب رسالتك هنا..."
            rows={5}
          />
          <Btn variant="primary" full>
            إرسال الرسالة
          </Btn>
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
