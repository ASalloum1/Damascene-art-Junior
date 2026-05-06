/**
 * ChatbotMessageList — scrollable conversation log.
 *
 * Props:
 *   messages: ChatMessage[]
 *   isAwaitingResponse: boolean
 *   streamingMessageId?: string   — id of the assistant placeholder bubble currently streaming
 *   onRetry?: () => void          — optional retry handler attached to the most recent
 *                                    errored message (useChatbot.retryLast)
 *
 * Behaviour:
 *   - Auto-scrolls to the bottom whenever the message count changes UNLESS the user
 *     has manually scrolled up (more than 80px above the bottom). The "near bottom"
 *     state is tracked via a ref and refreshed on every scroll.
 *   - Renders ChatbotTypingIndicator at the end when isAwaitingResponse is true and
 *     no streamingMessageId has been set yet (i.e. request is in-flight but no
 *     tokens have arrived).
 */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ChatbotMessageBubble } from './ChatbotMessageBubble.jsx';
import { ChatbotTypingIndicator } from './ChatbotTypingIndicator.jsx';
import styles from './ChatbotMessageList.module.css';

const NEAR_BOTTOM_THRESHOLD = 80;

export function ChatbotMessageList({
  messages = [],
  isAwaitingResponse = false,
  streamingMessageId,
  onRetry,
}) {
  // Find the id of the most-recent errored message — only that bubble shows a retry button.
  const lastErroredId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.error) return messages[i].id;
    }
    return null;
  }, [messages]);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);

  // Track whether the user is currently near the bottom of the scroll container.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    nearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
  };

  // After paint, if the user was near the bottom, follow the new content.
  // useLayoutEffect avoids a visible jump.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, isAwaitingResponse, streamingMessageId]);

  // Also follow content updates while a single message is streaming (length grows).
  // We watch the streaming message's content length implicitly via messages reference.
  useEffect(() => {
    if (!streamingMessageId) return;
    const el = scrollRef.current;
    if (!el || !nearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  });

  const showTyping = isAwaitingResponse && !streamingMessageId;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={styles.list}
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className={styles.inner}>
        {messages.map((msg) => (
          <ChatbotMessageBubble
            key={msg.id}
            message={msg}
            isStreaming={streamingMessageId === msg.id}
            onRetry={msg.id === lastErroredId ? onRetry : undefined}
          />
        ))}
        {showTyping ? <ChatbotTypingIndicator /> : null}
      </div>
    </div>
  );
}

export default ChatbotMessageList;
