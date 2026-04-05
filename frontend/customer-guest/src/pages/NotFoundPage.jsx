import { Gem } from 'lucide-react';
import { Btn } from '../components/Btn.jsx';
import styles from './NotFoundPage.module.css';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className={styles.container}>
      <Gem size={80} className={styles.icon} />
      <p className={styles.code}>٤٠٤</p>
      <h2 className={styles.heading}>الصفحة غير موجودة</h2>
      <p className={styles.message}>يبدو أن هذه الصفحة ضاعت في أزقة دمشق القديمة!</p>
      <div className={styles.actions}>
        <Btn variant="primary" onClick={() => onNavigate?.('home')}>
          العودة للرئيسية
        </Btn>
        <Btn variant="outline" onClick={() => onNavigate?.('shop')}>
          تصفّح المتجر
        </Btn>
      </div>
    </div>
  );
}

export default NotFoundPage;
