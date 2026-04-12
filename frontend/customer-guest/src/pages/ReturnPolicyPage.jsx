import { Calendar, Package, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { PolicySection } from '../components/PolicySection.jsx';
import styles from './ReturnPolicyPage.module.css';

const sections = [
  {
    icon: Calendar,
    title: 'مدة الإرجاع',
    description: 'يمكنك طلب الإرجاع خلال ١٤ يوماً من تاريخ الاستلام.',
  },
  {
    icon: Package,
    title: 'حالة المنتج',
    description: 'يجب أن يكون المنتج بحالته الأصلية دون أي ضرر أو استخدام، مع التغليف الأصلي.',
  },
  {
    icon: DollarSign,
    title: 'استرداد المبلغ',
    description: 'يتم استرداد المبلغ كاملاً خلال ٥-١٠ أيام عمل بنفس طريقة الدفع الأصلية.',
  },
  {
    icon: RefreshCw,
    title: 'الاستبدال',
    description: 'يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو بفارق سعر.',
  },
  {
    icon: AlertTriangle,
    title: 'حالات خاصة',
    description: 'القطع المصنوعة حسب الطلب (Custom Orders) غير قابلة للإرجاع إلا في حالة وجود عيب تصنيعي.',
  },
];

export function ReturnPolicyPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="سياسة الإرجاع والاستبدال" />
      <div className={styles.card}>
        {sections.map((s, i) => (
          <PolicySection key={i} icon={s.icon} title={s.title} description={s.description} />
        ))}
      </div>
    </div>
  );
}

export default ReturnPolicyPage;
