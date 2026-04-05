import { CheckCircle2 } from 'lucide-react';
import { Btn } from '../components/Btn.jsx';
import styles from './ConfirmationPage.module.css';

const orderDetails = [
  { label: 'المنتجات', value: 'طاولة موزاييك + صندوق صدف' },
  { label: 'الإجمالي', value: '١,٤٧٥ $' },
  { label: 'طريقة الدفع', value: 'بطاقة ائتمان' },
  { label: 'التوصيل المتوقع', value: '١٠-١٥ أبريل ٢٠٢٦' },
];

export function ConfirmationPage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <CheckCircle2 size={64} className={styles.icon} />

      <h1 className={styles.title}>شكراً لك! تم تأكيد طلبك</h1>

      <p className={styles.orderNum}>
        رقم الطلب: <span>#1084</span>
      </p>

      <div className={styles.detailsCard}>
        <h3 className={styles.detailsHeading}>تفاصيل الطلب</h3>
        {orderDetails.map((row) => (
          <div key={row.label} className={styles.detailRow}>
            <span className={styles.detailLabel}>{row.label}</span>
            <span className={styles.detailValue}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Btn variant="primary" onClick={() => onNavigate?.('tracking')}>
          تتبع الطلب
        </Btn>
        <Btn variant="outline" onClick={() => onNavigate?.('shop')}>
          متابعة التسوق
        </Btn>
      </div>
    </div>
  );
}

export default ConfirmationPage;
