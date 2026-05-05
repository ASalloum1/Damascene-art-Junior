import { CheckCircle2 } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { Button } from '../components/Button.jsx';
import styles from './ConfirmationPage.module.css';

export function ConfirmationPage({ onNavigate }) {
  const { latestPlacedOrder, setSelectedOrderId } = useApi();

  const orderDetails = [
    { label: 'الإجمالي', value: `${latestPlacedOrder?.total_price ?? latestPlacedOrder?.subtotal ?? '—'} $` },
    { label: 'طريقة الدفع', value: latestPlacedOrder?.payment_method_label ?? '—' },
    { label: 'حالة الطلب', value: latestPlacedOrder?.status_label ?? '—' },
    {
      label: 'المستلم',
      value: latestPlacedOrder?.shipping?.recipient_name ?? '—',
    },
  ];

  return (
    <div className={styles.page}>
      <CheckCircle2 size={64} className={styles.icon} />

      <h1 className={styles.title}>شكراً لك! تم تأكيد طلبك</h1>

      <p className={styles.orderNum}>
        رقم الطلب: <span>{latestPlacedOrder?.order_number || '—'}</span>
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
        <Button
          variant="primary"
          onClick={() => {
            if (latestPlacedOrder?.id) {
              setSelectedOrderId(latestPlacedOrder.id);
            }
            onNavigate?.('tracking');
          }}
        >
          تتبع الطلب
        </Button>
        <Button variant="outline" onClick={() => onNavigate?.('shop')}>
          متابعة التسوق
        </Button>
      </div>
    </div>
  );
}

export default ConfirmationPage;
