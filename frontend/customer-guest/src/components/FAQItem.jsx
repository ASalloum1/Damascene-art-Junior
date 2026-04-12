import { HelpCircle } from 'lucide-react';
import styles from './FAQItem.module.css';

export function FAQItem({ question, answer }) {
  return (
    <div className={styles.card}>
      <div className={styles.questionRow}>
        <HelpCircle size={18} className={styles.icon} />
        <p className={styles.question}>{question}</p>
      </div>
      <p className={styles.answer}>{answer}</p>
    </div>
  );
}

export default FAQItem;
