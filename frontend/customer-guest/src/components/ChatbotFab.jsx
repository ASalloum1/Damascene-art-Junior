/**
 * ChatbotFab — Floating action button that opens the Damascene chatbot drawer.
 *
 * Props:
 *   open: boolean              — whether the drawer is currently open (drives aria-expanded + active state)
 *   onToggle: () => void       — called when the FAB is clicked
 *   hidden?: boolean           — when true, renders null (e.g. on the chat page itself)
 *   unreadCount?: number       — optional unread badge count (assistant messages while drawer closed)
 *
 * Behaviour:
 *   - On the very first visit (no `damascene.chatbot.seenFab` in localStorage) plays
 *     a 3-iteration gold pulse to draw attention. Once the user opens the drawer,
 *     the flag is set and the pulse never plays again.
 *   - Suppresses the pulse under prefers-reduced-motion via CSS.
 */

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import styles from './ChatbotFab.module.css';

const SEEN_FAB_KEY = 'damascene.chatbot.seenFab';

export function ChatbotFab({ open, onToggle, hidden = false, unreadCount = 0 }) {
  // Decide on mount (lazy initializer) whether to play the first-visit pulse.
  // Doing this in the initializer rather than inside an effect avoids a
  // cascading render and matches the React-19 lint guidance.
  const [shouldPulse, setShouldPulse] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !window.localStorage.getItem(SEEN_FAB_KEY);
    } catch {
      // localStorage may be unavailable (private mode) — silently skip pulse.
      return false;
    }
  });

  // Once the drawer has been opened at least once, retire the pulse forever.
  // The setState here only fires once (the first time `open` flips true);
  // subsequent toggles short-circuit because shouldPulse is already false.
  // This is a one-shot retire-the-pulse sync, not a cascading render.
  useEffect(() => {
    if (!open) return;
    try {
      window.localStorage.setItem(SEEN_FAB_KEY, '1');
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldPulse((prev) => (prev ? false : prev));
  }, [open]);

  if (hidden) return null;

  const showBadge = !open && unreadCount > 0;

  return (
    <button
      id="chatbot-fab"
      type="button"
      className={`${styles.fab} ${shouldPulse && !open ? styles.pulse : ''} ${open ? styles.active : ''}`}
      onClick={onToggle}
      aria-label="المساعد الذكي — Damascene Art"
      aria-expanded={open}
      aria-controls="chatbot-drawer"
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Sparkles
          size={22}
          strokeWidth={1.8}
          className={styles.icon}
        />
      </span>
      {showBadge ? (
        <span className={styles.badge} aria-label={`${unreadCount} رسالة جديدة`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

export default ChatbotFab;
