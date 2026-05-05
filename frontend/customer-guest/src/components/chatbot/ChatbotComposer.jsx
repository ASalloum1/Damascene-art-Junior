/**
 * ChatbotComposer — bottom bar with the auto-resizing textarea, counter and send/stop button.
 *
 * Props:
 *   value: string                — controlled textarea value
 *   onChange: (next: string) => void
 *   onSend: () => void
 *   onStop: () => void           — called when the send button is repurposed as Stop while streaming
 *   isAwaitingResponse: boolean
 *   isOffline: boolean
 *   maxLength?: number           — default 500
 *
 * Behaviour:
 *   - Auto-resizes the textarea between 1 and 5 rows.
 *   - Enter sends; Shift+Enter inserts a newline.
 *   - Counter shows in red at >=480 chars; if the user attempts to send while over
 *     the limit, the textarea wrapper plays the global `shake` animation.
 *   - Send becomes Stop (Square icon) while isAwaitingResponse.
 *   - Disabled when isOffline OR value is empty/whitespace OR over maxLength.
 */

import { useEffect, useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';
import styles from './ChatbotComposer.module.css';

const MAX_ROWS = 5;
const SOFT_WARN_AT = 480;

export function ChatbotComposer({
  value,
  onChange,
  onSend,
  onStop,
  isAwaitingResponse,
  isOffline,
  maxLength = 500,
}) {
  const textareaRef = useRef(null);
  const [shake, setShake] = useState(false);

  // Resize the textarea up to MAX_ROWS based on content.
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Compute the cap from line-height; use a conservative 1.6em per line.
    const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 24;
    const paddingY =
      parseFloat(window.getComputedStyle(el).paddingTop) +
      parseFloat(window.getComputedStyle(el).paddingBottom);
    const maxHeight = lineHeight * MAX_ROWS + paddingY;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resize();
  }, [value]);

  const length = (value || '').length;
  const trimmed = (value || '').trim();
  const overLimit = length > maxLength;
  const empty = trimmed.length === 0;

  const sendDisabled = !isAwaitingResponse && (isOffline || empty || overLimit);

  const triggerShake = () => {
    setShake(false);
    // Force a reflow so the keyframe restarts.
    requestAnimationFrame(() => setShake(true));
    setTimeout(() => setShake(false), 450);
  };

  const handleSend = () => {
    if (isAwaitingResponse) {
      onStop?.();
      return;
    }
    if (overLimit) {
      triggerShake();
      return;
    }
    if (sendDisabled) return;
    onSend?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const counterClass = [
    styles.counter,
    length >= SOFT_WARN_AT ? styles.counterWarn : '',
    overLimit ? styles.counterError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.composer}>
      <div className={`${styles.fieldWrap} ${shake ? styles.shake : ''} ${overLimit ? styles.fieldOver : ''}`}>
        <textarea
          ref={textareaRef}
          id="chatbot-composer-textarea"
          name="chatbot-message"
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isOffline
              ? 'أنت غير متصل بالإنترنت…'
              : 'اكتب سؤالك هنا…'
          }
          rows={1}
          aria-label="رسالة إلى المساعد الذكي"
          aria-multiline="true"
          disabled={isOffline}
        />

        <button
          type="button"
          className={`${styles.sendBtn} ${isAwaitingResponse ? styles.sendBtnStop : ''}`}
          onClick={handleSend}
          disabled={sendDisabled}
          aria-label={isAwaitingResponse ? 'إيقاف التوليد' : 'إرسال'}
        >
          {isAwaitingResponse ? (
            <Square size={16} strokeWidth={2.4} fill="currentColor" aria-hidden="true" />
          ) : (
            <Send size={18} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className={styles.meta}>
        <span className={styles.hint}>اضغط Enter للإرسال • Shift + Enter لسطر جديد</span>
        <span className={counterClass} aria-live="polite">
          {length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

export default ChatbotComposer;
