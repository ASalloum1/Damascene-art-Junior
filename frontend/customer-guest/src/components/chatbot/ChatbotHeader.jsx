/**
 * ChatbotHeader — the top bar of the chatbot drawer.
 * Navy field with a hairline gold inlay underline. No decorative icons in the title,
 * just two icon buttons on the trailing edge: clear-conversation and close.
 *
 * Props:
 *   onClose: () => void          — close the drawer
 *   onClearChat: () => void      — wipe the current conversation
 *   hasMessages: boolean         — when false, the clear button is disabled
 */

import { RotateCcw, X } from 'lucide-react';
import styles from './ChatbotHeader.module.css';

export function ChatbotHeader({ onClose, onClearChat, hasMessages }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>المساعد الذكي</h2>
        <p className={styles.subtitle}>متاح لخدمتك على مدار الساعة</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClearChat}
          disabled={!hasMessages}
          aria-label="مسح المحادثة"
          title="مسح المحادثة"
        >
          <RotateCcw size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          aria-label="إغلاق"
          title="إغلاق"
        >
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default ChatbotHeader;
