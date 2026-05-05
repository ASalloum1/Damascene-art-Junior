// Real chatbot API client. Talks to the FastAPI service described in
// ai-services/damascene-chatbot/app/main.py (proxied through the Laravel
// gateway at API_CONFIG.ENDPOINTS.chat / .chatHealth).
//
// Paired with `chatbotApi.mock.js` and selected via `chatbotApi.index.js`
// based on VITE_CHATBOT_USE_MOCK.
//
// Auth: chat is available to guests, so we DO NOT send an Authorization
// header and DO NOT set credentials: 'include'. The ngrok tunnel
// browser-warning interstitial is bypassed with the dedicated header.
//
// Errors: throws a plain Error decorated with `.status` (HTTP status code)
// and `.body` (parsed JSON envelope when available). Mirrors the shape of
// visualSearchApi.js so the hook can read err.body?.detail uniformly.

import { API_CONFIG } from '../config/api.config.js';

const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  ...NGROK_HEADER,
};

function buildUrl(path) {
  const base = String(API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * POST /api/chat — send a user message with conversation history.
 *
 * @param {{ message: string, sessionId: string, history: Array<{role: string, content: string}>, signal?: AbortSignal }} args
 * @returns {Promise<{ response: string, session_id: string }>}
 */
export async function sendMessage({ message, sessionId, history, signal }) {
  const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.chat), {
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      conversation_history: history,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await parseJsonSafe(response);
    const err = new Error(`Chatbot send failed: ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return response.json();
}

/**
 * GET /api/chat/health — liveness probe for the chatbot service.
 * Used after a streak of failures to decide between 'error' and
 * 'service_down' UI states.
 *
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ status: string, kb_size: number, model: string }>}
 */
export async function checkHealth({ signal } = {}) {
  const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.chatHealth), {
    method: 'GET',
    headers: { ...NGROK_HEADER },
    signal,
  });

  if (!response.ok) {
    const body = await parseJsonSafe(response);
    const err = new Error(`Chatbot health failed: ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return response.json();
}

export default { sendMessage, checkHealth };
