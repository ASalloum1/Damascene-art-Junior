/**
 * ChatbotErrorBanner — slim banner shown above the message list when the
 * chatbot is offline or the upstream service is down.
 *
 * Props:
 *   variant: 'offline' | 'service_down'
 *   onDismiss?: () => void          — when provided, renders a close X
 */

import { WifiOff, AlertTriangle, X } from 'lucide-react';
import styles from './ChatbotErrorBanner.module.css';

const COPY = {
  offline: {
    text: 'أنت غير متصل بالإنترنت',
    Icon: WifiOff,
    className: 'offline',
  },
  service_down: {
    text: 'المساعد غير متاح حالياً، يرجى المحاولة لاحقاً',
    Icon: AlertTriangle,
    className: 'serviceDown',
  },
};

export function ChatbotErrorBanner({ variant, onDismiss }) {
  const config = COPY[variant];
  if (!config) return null;
  const { text, Icon, className } = config;

  return (
    <div
      className={`${styles.banner} ${styles[className]}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={16} strokeWidth={2} aria-hidden="true" className={styles.icon} />
      <span className={styles.text}>{text}</span>
      {onDismiss ? (
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="إخفاء التنبيه"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default ChatbotErrorBanner;
