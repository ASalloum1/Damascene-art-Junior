// useChatbot — state machine for the customer-guest chatbot widget.
//
// Encapsulates: session id minting + persistence, transcript persistence
// (debounced + cross-tab synced), abortable fetch dispatch with a 60 s
// timeout, retry-of-last-user-message, RAF typewriter on the assistant
// reply, and offline detection via navigator.onLine.
//
// State machine (locked, see chatbot-FRONTEND-spec §5):
//
//   idle         ── sendMessage() ──▶ sending
//   sending      ── 200 OK ──▶ streaming (typewriter)
//   sending      ── 422 ──▶ error (kind: 'too_long')
//   sending      ── 5xx / network ──▶ error (kind: 'server' | 'network')
//   sending      ── abort ──▶ idle
//   streaming    ── typewriter done / stop() ──▶ idle
//   error        ── 3 consecutive + health fails ──▶ service_down
//   any          ── isOffline true on send ──▶ momentarily 'offline'
//
// Memory-leak defenses (all six are mandatory, mirrored from
// useVisualSearch.js):
//   1. Refs mirror state that long-lived callbacks need to read after
//      awaits (messagesRef, sessionIdRef, statusRef) so callbacks stay
//      stable AND don't capture stale state.
//   2. AbortController.abort() runs on unmount AND on every new send.
//   3. mountedRef gates every setState that runs after an await.
//   4. RAF typewriter cancels its own rafId in stop(), unmount, and at
//      the start of a new send.
//   5. localStorage debounce timer and online/offline + storage listeners
//      are removed on unmount.
//   6. abortableSleep / fetch signal listeners are cleaned up by the API
//      modules themselves (see chatbotApi.mock.js abortableSleep).

import { useCallback, useEffect, useRef, useState } from 'react';
import * as chatbotApi from '../api/chatbotApi.index.js';

// ── Constants ─────────────────────────────────────────────────────────

const SESSION_KEY = 'damascene.chatbot.session_id';
const TRANSCRIPT_KEY = 'damascene.chatbot.transcript';
const PERSIST_DEBOUNCE_MS = 250;
const HISTORY_CAP = 20;          // matches FastAPI ChatRequest.max_length
const MAX_INPUT_CHARS = 500;     // matches FastAPI ChatRequest.max_length on message
const STORED_MESSAGES_CAP = 50;
const TRANSCRIPT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SEND_TIMEOUT_MS = 60_000;
const TYPEWRITER_PER_GRAPHEME_MS = 12;
const TYPEWRITER_MAX_TOTAL_MS = 1500;
const FAILURE_THRESHOLD = 3;
const ERR_MSG_TOO_LONG = 'الرسالة غير صالحة';
const ERR_MSG_SERVER = 'تعذّر الوصول إلى المساعد. حاول مجدداً.';
const ERR_MSG_NETWORK = 'يبدو أنك غير متصل بالإنترنت. حاول مجدداً.';

// ── Helpers ───────────────────────────────────────────────────────────

function uuid() {
  // crypto.randomUUID is available in all modern browsers. We fall back
  // to a Math.random-based id only as a last resort (e.g. very old WebViews).
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'm-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

function readSessionId() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw && typeof raw === 'string' && raw.length > 0) return raw;
  } catch {
    // localStorage may throw in privacy modes; fall through to mint a new id.
  }
  return null;
}

function writeSessionId(id) {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    // Ignore — chat still works in-memory.
  }
}

function readTranscript() {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - TRANSCRIPT_TTL_MS;
    // Drop entries older than 7 days, then cap to the last STORED_MESSAGES_CAP.
    const fresh = parsed.filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        typeof m.id === 'string' &&
        typeof m.role === 'string' &&
        typeof m.content === 'string' &&
        typeof m.createdAt === 'number' &&
        m.createdAt >= cutoff,
    );
    return fresh.slice(-STORED_MESSAGES_CAP);
  } catch {
    return [];
  }
}

function serializeTranscript(messages) {
  // Cap to the last STORED_MESSAGES_CAP to keep localStorage small.
  const slice = messages.slice(-STORED_MESSAGES_CAP);
  return JSON.stringify(slice);
}

function buildHistoryFor(messages) {
  // Convert ChatMessage[] → API history shape: only successful user/assistant
  // turns, only {role, content}, capped to the last HISTORY_CAP entries.
  // System bubbles (validation errors etc.) are excluded — they aren't part
  // of the conversation as the model sees it.
  const out = [];
  for (let i = messages.length - 1; i >= 0 && out.length < HISTORY_CAP; i -= 1) {
    const m = messages[i];
    if (!m) continue;
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    if (m.error) continue;
    if (typeof m.content !== 'string' || m.content.length === 0) continue;
    out.push({ role: m.role, content: m.content });
  }
  return out.reverse();
}

function makeUserMessage(content) {
  return {
    id: uuid(),
    role: 'user',
    content,
    createdAt: Date.now(),
    error: null,
  };
}

function makeAssistantPlaceholder() {
  return {
    id: uuid(),
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
    error: null,
  };
}

function classifyError(err) {
  // Map a raw error into the shape the UI consumes.
  if (err && err.status === 422) {
    return { kind: 'too_long', message: ERR_MSG_TOO_LONG, role: 'system' };
  }
  if (err && typeof err.status === 'number' && err.status >= 500) {
    return { kind: 'server', message: ERR_MSG_SERVER, role: 'assistant' };
  }
  // Everything else (TypeError, DOMException without AbortError, etc.) is
  // treated as a network failure.
  return { kind: 'network', message: ERR_MSG_NETWORK, role: 'assistant' };
}

// ── Hook ──────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {number} createdAt
 * @property {{ kind: 'network'|'server'|'too_long', message: string } | null} [error]
 */

/**
 * useChatbot — orchestrates the chatbot widget. See file header for the
 * state machine and memory-leak defenses.
 *
 * @returns {{
 *   messages: ChatMessage[],
 *   status: 'idle'|'sending'|'streaming'|'error'|'offline'|'service_down',
 *   inputDraft: string,
 *   isOffline: boolean,
 *   sessionId: string,
 *   setInputDraft: (value: string) => void,
 *   sendMessage: (overrideText?: string) => Promise<void>,
 *   stop: () => void,
 *   retryLast: () => Promise<void>,
 *   clearChat: () => void,
 * }}
 */
export function useChatbot() {
  // ── State ────────────────────────────────────────────────────────
  // Each slice is split intentionally so a setState on one does not
  // invalidate consumers subscribed to another.
  const [messages, setMessages] = useState(() => readTranscript());
  const [status, setStatus] = useState('idle');
  const [inputDraft, setInputDraftState] = useState('');
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );
  const [sessionId, setSessionId] = useState(() => {
    const existing = readSessionId();
    if (existing) return existing;
    const fresh = uuid();
    writeSessionId(fresh);
    return fresh;
  });

  // ── Refs (mirror state for stable callbacks) ─────────────────────
  const mountedRef = useRef(true);
  const messagesRef = useRef(messages);
  const sessionIdRef = useRef(sessionId);
  const statusRef = useRef(status);
  const isOfflineRef = useRef(isOffline);
  const inputDraftRef = useRef(inputDraft);

  // Persistence + cross-tab sync.
  const persistTimerRef = useRef(null);
  const lastPersistedTranscriptRef = useRef(null);
  const lastPersistedSessionRef = useRef(sessionId);

  // Send pipeline.
  const abortRef = useRef(null);
  const sendTimeoutRef = useRef(null);
  const placeholderIdRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  const consecutiveFailRef = useRef(0);
  const healthInflightRef = useRef(false);

  // Typewriter.
  const typewriterRafRef = useRef(null);
  const typewriterCancelledRef = useRef(false);

  // ── Ref mirrors ──────────────────────────────────────────────────
  // We update these in plain effects so the stable callbacks below can
  // read the latest values without listing the corresponding state in
  // their deps (which would re-create the callback on every keystroke).
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    isOfflineRef.current = isOffline;
  }, [isOffline]);
  useEffect(() => {
    inputDraftRef.current = inputDraft;
  }, [inputDraft]);

  // ── Mount / unmount ──────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;

      // Abort any in-flight request.
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {
          // Ignore — abort is best-effort.
        }
        abortRef.current = null;
      }
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
        sendTimeoutRef.current = null;
      }

      // Cancel typewriter.
      typewriterCancelledRef.current = true;
      if (typewriterRafRef.current && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(typewriterRafRef.current);
      }
      typewriterRafRef.current = null;

      // Flush pending persist to avoid losing the last keystroke / message.
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
        try {
          const serialized = serializeTranscript(messagesRef.current || []);
          localStorage.setItem(TRANSCRIPT_KEY, serialized);
          lastPersistedTranscriptRef.current = serialized;
        } catch {
          // Ignore.
        }
      }
    };
  }, []);

  // ── Online/offline listeners ─────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onOnline = () => {
      if (mountedRef.current) setIsOffline(false);
    };
    const onOffline = () => {
      if (mountedRef.current) setIsOffline(true);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── Debounced transcript persistence ─────────────────────────────
  // Only fires when `messages` changes (input keystrokes do NOT touch
  // this effect — `inputDraft` lives in its own slice). 250 ms debounce
  // coalesces typewriter ticks into a single localStorage write.
  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      try {
        const serialized = serializeTranscript(messages);
        // Skip the write if the value is identical to what's already in
        // localStorage — saves I/O AND avoids triggering our own storage
        // listener in other tabs (which compares against this ref).
        if (serialized === lastPersistedTranscriptRef.current) return;
        localStorage.setItem(TRANSCRIPT_KEY, serialized);
        lastPersistedTranscriptRef.current = serialized;
      } catch {
        // Ignore — persistence is best-effort.
      }
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      // No-op: we only want to clear on unmount or when the effect re-runs
      // before the timer fires; the unmount path already flushes pending
      // writes. Re-run path simply restarts the debounce.
    };
  }, [messages]);

  // ── Cross-tab sync (storage events) ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event) => {
      if (!event || !event.key) return;
      if (!mountedRef.current) return;

      if (event.key === TRANSCRIPT_KEY) {
        // Skip self-originated events.
        if (event.newValue === lastPersistedTranscriptRef.current) return;
        try {
          const next = event.newValue ? JSON.parse(event.newValue) : [];
          if (!Array.isArray(next)) return;
          lastPersistedTranscriptRef.current = event.newValue;
          setMessages(next);
        } catch {
          // Ignore malformed cross-tab payloads.
        }
        return;
      }

      if (event.key === SESSION_KEY) {
        if (event.newValue === lastPersistedSessionRef.current) return;
        if (typeof event.newValue === 'string' && event.newValue.length > 0) {
          lastPersistedSessionRef.current = event.newValue;
          setSessionId(event.newValue);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Typewriter ───────────────────────────────────────────────────
  // Reveals `fullText` into the message identified by `placeholderId` at
  // ~12 ms per grapheme, capped at 1.5 s total. Runs on RAF so React only
  // sees as many setState calls as frames the browser can paint.
  const runTypewriter = useCallback((placeholderId, fullText) => {
    return new Promise((resolve) => {
      if (!placeholderId || typeof fullText !== 'string') {
        resolve();
        return;
      }

      // If the message is empty, settle immediately.
      if (fullText.length === 0) {
        resolve();
        return;
      }

      // Respect prefers-reduced-motion: snap to full text without the
      // character-by-character RAF reveal. The bubble enter animation is
      // already neutralized in CSS for the same media query.
      if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        if (mountedRef.current) {
          setMessages((prev) =>
            prev.map((m) => (m.id === placeholderId ? { ...m, content: fullText } : m)),
          );
        }
        resolve();
        return;
      }

      // Use a grapheme segmenter when available so we don't slice in the
      // middle of multi-codepoint glyphs (e.g. emoji or Arabic ligatures).
      let graphemes;
      try {
        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
          const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
          graphemes = Array.from(seg.segment(fullText), (s) => s.segment);
        } else {
          graphemes = Array.from(fullText);
        }
      } catch {
        graphemes = Array.from(fullText);
      }

      const total = graphemes.length;
      const perChar = Math.max(
        1,
        Math.min(TYPEWRITER_PER_GRAPHEME_MS, Math.floor(TYPEWRITER_MAX_TOTAL_MS / total)),
      );
      const startedAt = (typeof performance !== 'undefined' && performance.now)
        ? performance.now()
        : Date.now();

      typewriterCancelledRef.current = false;

      const tick = () => {
        if (!mountedRef.current || typewriterCancelledRef.current) {
          typewriterRafRef.current = null;
          // On cancel, snap the bubble to the full text so the user isn't
          // left with a partial reply.
          if (mountedRef.current) {
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === placeholderId ? { ...m, content: fullText } : m,
              );
              return next;
            });
          }
          resolve();
          return;
        }

        const now = (typeof performance !== 'undefined' && performance.now)
          ? performance.now()
          : Date.now();
        const elapsed = now - startedAt;
        const idealCount = Math.min(total, Math.floor(elapsed / perChar) + 1);
        const slice = graphemes.slice(0, idealCount).join('');

        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, content: slice } : m)),
        );

        if (idealCount >= total || elapsed >= TYPEWRITER_MAX_TOTAL_MS) {
          // Final paint: ensure full text is set.
          setMessages((prev) =>
            prev.map((m) => (m.id === placeholderId ? { ...m, content: fullText } : m)),
          );
          typewriterRafRef.current = null;
          resolve();
          return;
        }

        typewriterRafRef.current = requestAnimationFrame(tick);
      };

      typewriterRafRef.current = requestAnimationFrame(tick);
    });
  }, []);

  // ── Stable setters / actions ─────────────────────────────────────
  const setInputDraft = useCallback((value) => {
    setInputDraftState(typeof value === 'string' ? value : '');
  }, []);

  const stop = useCallback(() => {
    // Abort the in-flight request. The fetch path will see AbortError,
    // drop the placeholder, and reset status to 'idle'.
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // Ignore.
      }
      abortRef.current = null;
    }
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    // Cancel the typewriter — its tick() snaps the bubble to full text
    // and resolves the promise so the send pipeline can finish.
    typewriterCancelledRef.current = true;
    if (typewriterRafRef.current && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(typewriterRafRef.current);
      typewriterRafRef.current = null;
    }
    if (mountedRef.current && statusRef.current === 'streaming') {
      setStatus('idle');
    }
  }, []);

  const clearChat = useCallback(() => {
    // Abort any in-flight work first so we don't get a late setMessages
    // dropping a placeholder back into the freshly cleared transcript.
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // Ignore.
      }
      abortRef.current = null;
    }
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    typewriterCancelledRef.current = true;
    if (typewriterRafRef.current && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(typewriterRafRef.current);
      typewriterRafRef.current = null;
    }
    placeholderIdRef.current = null;
    consecutiveFailRef.current = 0;

    const fresh = uuid();
    writeSessionId(fresh);
    lastPersistedSessionRef.current = fresh;

    if (mountedRef.current) {
      setMessages([]);
      setSessionId(fresh);
      setStatus('idle');
    }
  }, []);

  // The send pipeline. Called by both `sendMessage` and `retryLast`.
  // Uses ref-mirrored state so it stays referentially stable.
  const performSend = useCallback(async (rawText) => {
    const text = String(rawText || '').trim();

    // Validate inputs (guards mirror those in `sendMessage`/`retryLast`,
    // but we double-check here so internal callers can't bypass them).
    if (!text) return;
    if (text.length > MAX_INPUT_CHARS) return;
    if (isOfflineRef.current) {
      if (mountedRef.current) {
        setStatus('offline');
        // Briefly surface 'offline' status so the UI can show a hint, then
        // fall back to whatever the prior status was. We use a microtask +
        // small timeout so the UI has a chance to react.
        setTimeout(() => {
          if (mountedRef.current && statusRef.current === 'offline') {
            setStatus('idle');
          }
        }, 1500);
      }
      return;
    }

    // Abort any prior in-flight send.
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // Ignore.
      }
      abortRef.current = null;
    }
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    // Cancel any in-progress typewriter from a prior turn.
    typewriterCancelledRef.current = true;
    if (typewriterRafRef.current && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(typewriterRafRef.current);
      typewriterRafRef.current = null;
    }

    // Build the user + placeholder bubbles AND the API history snapshot
    // BEFORE pushing them onto the messages list — the API history must
    // not include the just-added user msg or the empty placeholder.
    const userMsg = makeUserMessage(text);
    const placeholder = makeAssistantPlaceholder();
    placeholderIdRef.current = placeholder.id;
    lastUserMessageRef.current = text;

    const baseMessages = messagesRef.current || [];
    const history = buildHistoryFor(baseMessages);

    if (mountedRef.current) {
      setMessages((prev) => [...prev, userMsg, placeholder]);
      setStatus('sending');
    }

    // Build an abort controller. We compose a manual timeout so we have
    // a single signal we can observe with an explicit-error path. Using
    // AbortSignal.timeout would also work, but composing here keeps the
    // 60 s cleanup symmetric with the other refs we manage.
    const controller = new AbortController();
    abortRef.current = controller;
    sendTimeoutRef.current = setTimeout(() => {
      try {
        controller.abort();
      } catch {
        // Ignore.
      }
    }, SEND_TIMEOUT_MS);

    let result;
    try {
      result = await chatbotApi.sendMessage({
        message: text,
        sessionId: sessionIdRef.current,
        history,
        signal: controller.signal,
      });
    } catch (err) {
      // Always clear the timer if it's still our timer.
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
        sendTimeoutRef.current = null;
      }
      if (abortRef.current === controller) {
        abortRef.current = null;
      }

      // Drop late results if the component unmounted or a newer send
      // superseded us.
      if (!mountedRef.current) return;

      // Abort: drop the placeholder and reset status. Do NOT bump the
      // consecutive-failure counter — the user (or stop()) chose this.
      if (err && (err.name === 'AbortError' || (err instanceof DOMException && err.name === 'AbortError'))) {
        const phId = placeholder.id;
        setMessages((prev) => prev.filter((m) => m.id !== phId));
        setStatus('idle');
        return;
      }

      // Real failure: replace the placeholder with an error bubble.
      const classified = classifyError(err);
      const phId = placeholder.id;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === phId
            ? {
                ...m,
                role: classified.role,
                content: classified.message,
                error: { kind: classified.kind, message: classified.message },
              }
            : m,
        ),
      );
      setStatus('error');

      // 422 (validation) is a user-input problem, not a service problem —
      // don't count it toward the service_down threshold.
      if (classified.kind !== 'too_long') {
        consecutiveFailRef.current += 1;
        if (
          consecutiveFailRef.current >= FAILURE_THRESHOLD &&
          !healthInflightRef.current
        ) {
          healthInflightRef.current = true;
          chatbotApi
            .checkHealth()
            .then(() => {
              healthInflightRef.current = false;
              // Health passed — leave status at 'error' (the user's last
              // attempt still failed) but don't escalate to service_down.
            })
            .catch(() => {
              healthInflightRef.current = false;
              if (mountedRef.current) setStatus('service_down');
            });
        }
      }
      return;
    }

    // ── Success path ──
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    if (abortRef.current === controller) {
      abortRef.current = null;
    }
    if (!mountedRef.current) return;

    consecutiveFailRef.current = 0;

    // Reconcile session id from the server (FastAPI echoes whatever we
    // sent, but if it ever rotates we want to follow).
    if (result && typeof result.session_id === 'string' && result.session_id.length > 0) {
      if (result.session_id !== sessionIdRef.current) {
        writeSessionId(result.session_id);
        lastPersistedSessionRef.current = result.session_id;
        setSessionId(result.session_id);
      }
    }

    setStatus('streaming');
    await runTypewriter(placeholder.id, String(result?.response || ''));

    if (!mountedRef.current) return;
    setStatus('idle');
  }, [runTypewriter]);

  const sendMessage = useCallback(async (overrideText) => {
    const candidate = typeof overrideText === 'string' ? overrideText : inputDraftRef.current;
    const text = String(candidate || '').trim();
    if (!text) return;
    if (text.length > MAX_INPUT_CHARS) return;
    if (isOfflineRef.current) {
      if (mountedRef.current) {
        setStatus('offline');
        setTimeout(() => {
          if (mountedRef.current && statusRef.current === 'offline') {
            setStatus('idle');
          }
        }, 1500);
      }
      return;
    }
    // Clear the draft only when we used it (not when the caller passed
    // an explicit override — caller manages its own draft).
    if (typeof overrideText !== 'string') {
      setInputDraftState('');
    }
    await performSend(text);
  }, [performSend]);

  const retryLast = useCallback(async () => {
    const last = lastUserMessageRef.current;
    if (!last) return;
    // Preserve a draft the user typed in the meantime.
    const currentDraft = inputDraftRef.current;
    await performSend(last);
    if (mountedRef.current && currentDraft && currentDraft !== last) {
      // performSend doesn't touch the draft when called with an override,
      // but we re-assert here to make the intent explicit.
      setInputDraftState(currentDraft);
    }
  }, [performSend]);

  return {
    messages,
    status,
    inputDraft,
    isOffline,
    sessionId,
    setInputDraft,
    sendMessage,
    stop,
    retryLast,
    clearChat,
  };
}

export default useChatbot;
