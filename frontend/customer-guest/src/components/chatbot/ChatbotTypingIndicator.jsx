/**
 * ChatbotTypingIndicator — three pulsing dots in an assistant-styled bubble.
 * Shown by ChatbotMessageList when the assistant is awaiting/preparing a reply
 * but no streaming token has yet arrived.
 *
 * Props: none.
 */

import styles from './ChatbotTypingIndicator.module.css';

export function ChatbotTypingIndicator() {
  return (
    <div
      className={styles.row}
      role="status"
      aria-live="polite"
      aria-label="المساعد يكتب"
    >
      <div className={styles.bubble} aria-hidden="true">
        <span className={`${styles.dot} ${styles.dot1}`} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
      </div>
    </div>
  );
}

export default ChatbotTypingIndicator;
