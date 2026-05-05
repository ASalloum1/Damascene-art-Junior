// Mock chatbot API client.
//
// Mirrors the response shape and error semantics of the real FastAPI
// /chat and /health endpoints (see ai-services/damascene-chatbot/app/main.py)
// so the UI can be developed end-to-end before the backend lands. Selected
// via `chatbotApi.index.js` based on VITE_CHATBOT_USE_MOCK.
//
// Trigger strings (case-insensitive substring of the user's message):
//   'fail'    → throws Error with status 500 (server error envelope)
//   'toolong' → throws Error with status 422 (FastAPI validation envelope)
//   'offline' → throws TypeError('Failed to fetch') (network error)
//   else      → returns a canned bilingual response with Damascene flavor

const DEFAULT_PER_REQUEST_MIN_MS = 1500;
const DEFAULT_PER_REQUEST_MAX_MS = 4000;

/**
 * Promise-based sleep that respects an AbortSignal.
 *
 * - If `signal` is already aborted when called, rejects synchronously with
 *   a DOMException('Aborted', 'AbortError').
 * - On abort during the wait, clears the timeout and rejects.
 * - On natural resolve, removes the abort listener so we don't leak it for
 *   the lifetime of the controller.
 */
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort);
  });
}

function jitterMs(min = DEFAULT_PER_REQUEST_MIN_MS, max = DEFAULT_PER_REQUEST_MAX_MS) {
  return min + Math.random() * (max - min);
}

function buildCannedResponse(userMessage) {
  // Echo a short slice of the user's message (so devs can see round-trip
  // is wired) plus a brief Damascene-art flavored remark in both languages.
  const echo = String(userMessage || '').trim().slice(0, 80);
  return [
    'مرحباً! تلقّيت رسالتك:',
    `«${echo}»`,
    '',
    'حِرَفنا الدمشقية تجمع بين الموزاييك والصدف والنحاس المطعّم — اسألني عن أي قطعة تثير فضولك.',
    '',
    '— — —',
    '',
    'Hello! I received your message:',
    `"${echo}"`,
    '',
    "Our Damascene craft blends mosaic, mother-of-pearl, and inlaid copper — ask me about any piece that catches your eye.",
  ].join('\n');
}

/**
 * Mock implementation of POST /api/chat.
 *
 * @param {{ message: string, sessionId: string, history: Array<{role: string, content: string}>, signal?: AbortSignal }} args
 * @returns {Promise<{ response: string, session_id: string }>}
 */
export async function sendMessage({ message, sessionId, signal }) {
  const lower = String(message || '').toLowerCase();

  // Network-class failure: thrown immediately, before the simulated wait,
  // so the UI's "offline" path can be exercised without a 4 s pause. We
  // still respect aborts for symmetry with the real path.
  if (lower.includes('offline')) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    throw new TypeError('Failed to fetch');
  }

  await abortableSleep(jitterMs(), signal);

  if (lower.includes('fail')) {
    const err = new Error('Mock server error');
    err.status = 500;
    err.body = { detail: 'Internal server error' };
    throw err;
  }

  if (lower.includes('toolong')) {
    const err = new Error('Mock validation error');
    err.status = 422;
    err.body = {
      detail: [
        {
          loc: ['body', 'message'],
          msg: 'String should have at most 500 characters',
          type: 'string_too_long',
        },
      ],
    };
    throw err;
  }

  return {
    response: buildCannedResponse(message),
    session_id: sessionId,
  };
}

/**
 * Mock implementation of GET /api/chat/health.
 *
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ status: string, kb_size: number, model: string }>}
 */
export async function checkHealth({ signal } = {}) {
  await abortableSleep(200 + Math.random() * 400, signal);
  return { status: 'ok', kb_size: 42, model: 'mock' };
}

export default { sendMessage, checkHealth };
