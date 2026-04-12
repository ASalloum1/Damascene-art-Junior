import { SectionHeader } from '../components/SectionHeader.jsx';
import { FAQItem } from '../components/FAQItem.jsx';
import styles from './FAQPage.module.css';

const faqs = [
  {
    question: 'هل المنتجات مصنوعة يدوياً بالكامل؟',
    answer: 'نعم، جميع منتجاتنا مصنوعة يدوياً بالكامل بأيدي حرفيين سوريين متخصصين. كل قطعة فريدة ومميزة.',
  },
  {
    question: 'هل تشحنون إلى خارج الشرق الأوسط؟',
    answer: 'نعم، نشحن إلى أغلب دول العالم. مدة الشحن تتراوح بين ٣-٢٠ يوم حسب المنطقة.',
  },
  {
    question: 'كيف تُغلّف القطع الحساسة؟',
    answer: 'نستخدم تغليفاً خاصاً متعدد الطبقات يشمل فقاعات هوائية وحشو مقاوم للصدمات لضمان وصول القطع سليمة.',
  },
  {
    question: 'ما هي سياسة الإرجاع؟',
    answer: 'يمكنك إرجاع المنتج خلال ١٤ يوماً من الاستلام بشرط أن يكون بحالته الأصلية. نتحمل تكاليف الإرجاع في حال وجود عيب.',
  },
  {
    question: 'هل يمكنني طلب قطعة بمقاس أو تصميم مخصص؟',
    answer: 'بالتأكيد! نقدم خدمة الطلبات المخصصة. تواصل معنا وسنعمل مع الحرفي المناسب لتنفيذ رؤيتك.',
  },
];

export function FAQPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="الأسئلة الشائعة" />
      <div className={styles.list}>
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

export default FAQPage;
