/**
 * ChatbotEmptyState — initial canvas shown when the conversation has no messages.
 * Greeting + three Arabic suggestion chips that seed the first prompt.
 *
 * Props:
 *   onSuggestionClick: (text: string) => void
 */

import { Sparkles } from 'lucide-react';
import styles from './ChatbotEmptyState.module.css';

const SUGGESTIONS = [
  'اقترح لي قطعة هادئة',
  'هل تشحنون للسعودية؟',
  'ما طريقة العناية بالصندوق المطعم بالصدف؟',
];

export function ChatbotEmptyState({ onSuggestionClick }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.medallion} aria-hidden="true">
        <Sparkles size={26} strokeWidth={1.6} />
      </div>

      <h3 className={styles.heading}>أهلاً بك في الفن الدمشقي</h3>
      <p className={styles.body}>
        أنا هنا لمساعدتك على اختيار القطعة المناسبة، الإجابة عن أسئلتك حول الشحن والعناية،
        أو شرح الحرف اليدوية الدمشقية. كيف يمكنني خدمتك؟
      </p>

      <ul className={styles.chips} role="list">
        {SUGGESTIONS.map((text) => (
          <li key={text}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => onSuggestionClick?.(text)}
            >
              <span className={styles.chipDot} aria-hidden="true" />
              <span className={styles.chipText}>{text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatbotEmptyState;
