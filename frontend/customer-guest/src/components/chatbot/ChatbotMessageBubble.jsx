/**
 * ChatbotMessageBubble — a single message bubble.
 *
 * Props:
 *   message: {
 *     id: string,
 *     role: 'user' | 'assistant' | 'system',
 *     content: string,
 *     createdAt: number,
 *     error?: { kind: 'network'|'server'|'too_long', message: string } | null
 *   }
 *   isStreaming?: boolean        — true while assistant content is still arriving
 *   onRetry?: () => void         — called when the user clicks the inline retry button
 *
 * Behaviour:
 *   - Auto-detects per-bubble `dir`: counts Arabic characters; ratio > 0.3 → rtl, else ltr.
 *   - Linkifies URLs with a simple regex (no markdown lib).
 *   - Converts \n to <br>.
 *   - Shows an inline retry button when message.error is set.
 */

import { RefreshCw } from 'lucide-react';
import styles from './ChatbotMessageBubble.module.css';

// Arabic Unicode block: U+0600–U+06FF (and supplementary forms via the same range here).
const ARABIC_RE = /[؀-ۿ]/g;
const URL_RE = /(https?:\/\/[^\s<]+)/g;

/**
 * Returns 'rtl' when at least 30% of the (alphabetic) characters in `text` are Arabic.
 * Falls back to 'rtl' for empty strings to match the storefront default.
 */
function detectDir(text) {
  if (!text) return 'rtl';
  const arabicMatches = text.match(ARABIC_RE);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  // Count non-whitespace as the denominator so emoji/URLs don't dominate the ratio.
  const meaningful = text.replace(/\s+/g, '').length || 1;
  return arabicCount / meaningful > 0.3 ? 'rtl' : 'ltr';
}

/**
 * Splits text into an array of plain-string and {link,href} segments.
 * Keeps the linkify logic local; no external dependency.
 */
function linkify(text) {
  if (!text) return [];
  const segments = [];
  let lastIndex = 0;
  let match;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: 'link', value: match[1] });
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) });
  }
  return segments;
}

/**
 * Renders text with newlines as <br> and URLs as anchors.
 */
function renderContent(text) {
  // Split first by newlines so each line is rendered as its own row;
  // within each line, linkify URLs.
  const lines = (text || '').split('\n');
  return lines.map((line, lineIdx) => {
    const segments = linkify(line);
    return (
      <span key={lineIdx} className={styles.line}>
        {segments.length === 0 ? line : segments.map((seg, segIdx) => {
          if (seg.kind === 'link') {
            return (
              <a
                key={segIdx}
                className={styles.link}
                href={seg.value}
                target="_blank"
                rel="noopener noreferrer"
              >
                {seg.value}
              </a>
            );
          }
          return <span key={segIdx}>{seg.value}</span>;
        })}
        {lineIdx < lines.length - 1 ? <br /> : null}
      </span>
    );
  });
}

export function ChatbotMessageBubble({ message, isStreaming = false, onRetry }) {
  const role = message?.role || 'assistant';
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const hasError = Boolean(message?.error);

  const dir = detectDir(message?.content || '');

  const variantClass = isUser
    ? styles.user
    : isSystem
      ? styles.system
      : styles.assistant;

  const errorClass = hasError ? styles.errored : '';

  // Rendering rules to avoid duplicating the error message:
  //   • System bubbles: their styling IS the error chrome — show the content,
  //     skip the errorRow (and the retry, which doesn't help for 'too_long').
  //   • Assistant bubbles in an error state: skip the content (it's the same
  //     localized error string that goes into errorRow) and render only the
  //     errorRow + retry. The bubble border still visually marks the error.
  //   • All other bubbles: normal content rendering.
  const showContent = !hasError || isSystem;
  const showErrorRow = hasError && !isSystem;

  return (
    <div
      className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
      role={isSystem ? 'status' : undefined}
    >
      <div
        className={`${styles.bubble} ${variantClass} ${errorClass}`}
        dir={dir}
        aria-busy={isStreaming || undefined}
      >
        {showContent ? (
          <div className={styles.content}>
            {renderContent(message?.content || '')}
            {isStreaming ? (
              <span className={styles.caret} aria-hidden="true">▍</span>
            ) : null}
          </div>
        ) : null}

        {showErrorRow ? (
          <div className={styles.errorRow}>
            <span className={styles.errorMsg}>
              {message.error?.message || 'تعذّر إرسال الرسالة'}
            </span>
            {onRetry ? (
              <button
                type="button"
                className={styles.retryBtn}
                onClick={onRetry}
                aria-label="إعادة المحاولة"
              >
                <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
                <span>إعادة المحاولة</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ChatbotMessageBubble;
