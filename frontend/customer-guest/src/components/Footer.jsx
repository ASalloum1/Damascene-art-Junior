import { Gem, Mail, Phone, MapPin } from 'lucide-react';
import { Ornament } from './Ornament.jsx';
import styles from './Footer.module.css';

export function Footer({ onNavigate }) {
  const quickLinks = [
    { label: 'المتجر', pageId: 'shop' },
    { label: 'من نحن', pageId: 'about' },
  ];

  const helpLinks = [
    { label: 'الأسئلة الشائعة', pageId: 'faq' },
    { label: 'سياسة الإرجاع', pageId: 'return' },
    { label: 'الخصوصية', pageId: 'privacy' },
    { label: 'تواصل معنا', pageId: 'contact' },
  ];

  const contactItems = [
    { icon: Mail, text: 'info@damascene-art.com' },
    { icon: Phone, text: '+963 11 XXX XXXX' },
    { icon: MapPin, text: 'دمشق — سوق الحميدية' },
  ];

  return (
    <footer role="contentinfo" className={styles.footer}>
      <Ornament />
      <div className={styles.grid}>
        {/* Col 1 — Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Gem size={28} className={styles.brandGem} />
            <span className={styles.brandName}>الفن الدمشقي</span>
          </div>
          <p className={styles.brandDesc}>
            نحمل إرث دمشق العريق إلى العالم من خلال قطع فنية أصيلة مصنوعة بأيدي أمهر الحرفيين السوريين.
          </p>
        </div>

        {/* Col 2 — Quick Links */}
        <div>
          <h4 className={styles.colHeading}>روابط سريعة</h4>
          {quickLinks.map((link) => (
            <button
              key={link.pageId}
              type="button"
              className={styles.colLink}
              onClick={() => onNavigate?.(link.pageId)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Col 3 — Help */}
        <div>
          <h4 className={styles.colHeading}>المساعدة</h4>
          {helpLinks.map((link) => (
            <button
              key={link.pageId}
              type="button"
              className={styles.colLink}
              onClick={() => onNavigate?.(link.pageId)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Col 4 — Contact */}
        <div>
          <h4 className={styles.colHeading}>تواصل معنا</h4>
          {contactItems.map((item) => {
            const ContactIcon = item.icon;
            return (
              <div key={item.text} className={styles.contactItem}>
                <ContactIcon size={16} className={styles.contactIcon} />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p>© ٢٠٢٦ الفن الدمشقي — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}

export default Footer;
