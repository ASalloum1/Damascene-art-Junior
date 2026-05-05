/**
 * ChatbotDrawer — orchestrator for the chatbot UI.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onNavigate?: (pageId: string) => void   — passed through for future deep-linking from messages
 *
 * Composition (top → bottom):
 *   ChatbotHeader
 *   [ChatbotErrorBanner]                  — when offline OR service_down
 *   ChatbotEmptyState | ChatbotMessageList — empty state when messages.length === 0
 *   ChatbotComposer
 *
 * Layout:
 *   - Desktop (≥1024px): floating card 420×min(680, 100svh - 32px), 16px gap from FAB.
 *   - Tablet (768–1023px): min(420px, calc(100vw - 32px)) × min(640px, calc(100svh - 80px)).
 *   - Mobile (<768px): full-screen sheet, 100svh, slides up from bottom.
 *
 * Accessibility:
 *   - role="dialog", aria-modal="true" only on tablet/mobile (where the backdrop exists).
 *   - Esc closes.
 *   - On mobile/tablet, focus is trapped inside the drawer.
 *   - On open, focus moves to the textarea.
 *   - On close, focus returns to the FAB (`#chatbot-fab` if found, else document.activeElement before open).
 *
 * Animation tokens documented in CSS comments. Z-indexes: backdrop 400, drawer 401.
 *
 * NOTE: This is the ONE component allowed to import useChatbot — owned by BUILD-C.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatbot } from '../../hooks/useChatbot.js';
import { ChatbotHeader } from './ChatbotHeader.jsx';
import { ChatbotMessageList } from './ChatbotMessageList.jsx';
import { ChatbotEmptyState } from './ChatbotEmptyState.jsx';
import { ChatbotComposer } from './ChatbotComposer.jsx';
import { ChatbotErrorBanner } from './ChatbotErrorBanner.jsx';
import styles from './ChatbotDrawer.module.css';

const TABLET_BREAKPOINT = 1024; // ≥ this → desktop floating, no backdrop, no aria-modal, no trap.

/**
 * useIsBelow — returns true when window width is strictly less than `px`.
 * Updates on resize. SSR-safe (defaults to false).
 */
function useIsBelow(px) {
  const [isBelow, setIsBelow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${px - 1}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const handler = (e) => setIsBelow(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [px]);

  return isBelow;
}

/**
 * Returns the focusable elements within `root` in DOM order.
 */
function getFocusable(root) {
  if (!root) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(root.querySelectorAll(selectors)).filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null
  );
}

export function ChatbotDrawer({ open, onClose, onNavigate }) {
  // Capture onNavigate so future per-message deep-links can call it without
  // changing the public contract. Currently the chatbot doesn't emit nav events.
  void onNavigate;

  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  const isMobileOrTablet = useIsBelow(TABLET_BREAKPOINT);

  const {
    messages,
    status,
    inputDraft,
    isOffline,
    setInputDraft,
    sendMessage,
    stop,
    retryLast,
    clearChat,
  } = useChatbot();

  const hasMessages = messages.length > 0;

  // Identify the streaming assistant placeholder (last assistant message while status==='streaming').
  let streamingMessageId;
  if (status === 'streaming') {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') {
        streamingMessageId = messages[i].id;
        break;
      }
    }
  }

  const isAwaitingResponse = status === 'sending' || status === 'streaming';

  // ── Esc closes ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // ── Manage focus on open / close ──────────────────────────────
  useEffect(() => {
    if (open) {
      // Remember where focus was so we can restore it later.
      previousFocusRef.current = document.activeElement;

      // After paint, move focus into the textarea.
      const id = window.requestAnimationFrame(() => {
        const ta = drawerRef.current?.querySelector('textarea');
        if (ta) ta.focus({ preventScroll: true });
      });
      return () => window.cancelAnimationFrame(id);
    }

    // Closing → return focus to the FAB (preferred) or the previously focused element.
    const fab = document.getElementById('chatbot-fab');
    if (fab && typeof fab.focus === 'function') {
      fab.focus({ preventScroll: true });
    } else if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === 'function'
    ) {
      previousFocusRef.current.focus({ preventScroll: true });
    }
    return undefined;
  }, [open]);

  // ── Focus trap (mobile/tablet only) ───────────────────────────
  useEffect(() => {
    if (!open || !isMobileOrTablet) return undefined;
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusable(drawerRef.current);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, isMobileOrTablet]);

  // ── Body scroll lock on mobile/tablet ─────────────────────────
  useEffect(() => {
    if (!open || !isMobileOrTablet) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, isMobileOrTablet]);

  // ── Send / stop / retry / clear / suggestion handlers ─────────
  const handleSend = useCallback(() => {
    sendMessage?.();
  }, [sendMessage]);

  const handleStop = useCallback(() => {
    stop?.();
  }, [stop]);

  const handleSuggestion = useCallback(
    (text) => {
      // Pass the override directly to sendMessage so it doesn't depend on the draft.
      sendMessage?.(text);
    },
    [sendMessage]
  );

  const handleClear = useCallback(() => {
    clearChat?.();
  }, [clearChat]);

  // ── Backdrop click closes (mobile/tablet only) ────────────────
  const handleBackdropClick = () => {
    if (isMobileOrTablet) onClose?.();
  };

  // Don't render anything when closed (preserves the FAB's focus and avoids
  // an offscreen tab-stop). Mounting/unmounting is fine because animations
  // are short and there's no expensive sub-tree to recreate.
  if (!open) return null;

  // Determine error banner variant. status takes priority over isOffline so that
  // a transient service_down banner shows even when the user is online.
  let bannerVariant = null;
  if (status === 'service_down') bannerVariant = 'service_down';
  else if (isOffline || status === 'offline') bannerVariant = 'offline';

  return (
    <>
      {isMobileOrTablet ? (
        <div
          className={styles.backdrop}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      ) : null}

      <section
        id="chatbot-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${isMobileOrTablet ? styles.drawerSheet : styles.drawerFloat}`}
        role="dialog"
        aria-modal={isMobileOrTablet ? 'true' : undefined}
        aria-label="نافذة المساعد الذكي"
      >
        <ChatbotHeader
          onClose={onClose}
          onClearChat={handleClear}
          hasMessages={hasMessages}
        />

        {bannerVariant ? (
          <ChatbotErrorBanner variant={bannerVariant} />
        ) : null}

        {hasMessages ? (
          <ChatbotMessageList
            messages={messages}
            isAwaitingResponse={isAwaitingResponse}
            streamingMessageId={streamingMessageId}
            onRetry={retryLast}
          />
        ) : (
          <ChatbotEmptyState onSuggestionClick={handleSuggestion} />
        )}

        <ChatbotComposer
          value={inputDraft}
          onChange={setInputDraft}
          onSend={handleSend}
          onStop={handleStop}
          isAwaitingResponse={isAwaitingResponse}
          isOffline={isOffline}
          maxLength={500}
        />
      </section>
    </>
  );
}

export default ChatbotDrawer;
