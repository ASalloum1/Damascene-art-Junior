import { Gem } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import styles from './NotFoundPage.module.css';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className={styles.container}>
      <Gem size={80} className={styles.icon} />
      <p className={styles.code}>٤٠٤</p>
      <h2 className={styles.heading}>لم نعثر على هذا الأثر</h2>
      <p className={styles.message}>يبدو أن هذه الصفحة قد توارت خلف أروقة دمشق القديمة، أو أنها قصة لم تُحكَ بعد في سجلاتنا.</p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={() => onNavigate?.('home')}>
          العودة للرئيسية
        </Button>
        <Button variant="outline" onClick={() => onNavigate?.('shop')}>
          تصفّح المتجر
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
