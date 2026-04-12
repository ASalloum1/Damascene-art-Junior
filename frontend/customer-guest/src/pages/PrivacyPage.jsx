import { Lock, Shield, Cookie, FileText } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { PolicySection } from '../components/PolicySection.jsx';
import styles from './PrivacyPage.module.css';

const sections = [
  {
    icon: Lock,
    title: 'جمع البيانات',
    description: 'نجمع فقط البيانات الضرورية لمعالجة طلباتك: الاسم، البريد الإلكتروني، العنوان، ومعلومات الدفع.',
  },
  {
    icon: Shield,
    title: 'حماية البيانات',
    description: 'نستخدم تشفير SSL لحماية بياناتك المالية ولا نشارك معلوماتك مع أطراف ثالثة.',
  },
  {
    icon: Cookie,
    title: 'ملفات الكوكيز',
    description: 'نستخدم الكوكيز لتحسين تجربة التصفح وتذكر تفضيلاتك.',
  },
  {
    icon: FileText,
    title: 'شروط الاستخدام',
    description: 'باستخدام الموقع فإنك توافق على شروطنا. جميع المنتجات محمية بحقوق الملكية الفكرية.',
  },
];

export function PrivacyPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="سياسة الخصوصية والشروط" />
      <div className={styles.card}>
        {sections.map((s, i) => (
          <PolicySection key={i} icon={s.icon} title={s.title} description={s.description} />
        ))}
      </div>
    </div>
  );
}

export default PrivacyPage;
