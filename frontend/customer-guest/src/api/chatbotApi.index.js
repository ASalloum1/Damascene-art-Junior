// Branch module: chooses between the real and mock chatbot clients based
// on the build-time flag VITE_CHATBOT_USE_MOCK.
//
// Both implementations are imported STATICALLY (no top-level await, no
// dynamic import) so Vite/HMR/ESLint can analyze the graph normally and
// the unused side is simply tree-shaken at build time when the flag is a
// constant. Tree-shaking is conservative here — both modules are tiny so
// the worst case is a few KB carried into production, which is fine.
//
// Consumers should import from this file, not from the underlying
// implementation files:
//
//   import * as chatbotApi from '../api/chatbotApi.index.js';
//   chatbotApi.sendMessage({ message, sessionId, history });

import * as realApi from './chatbotApi.js';
import * as mockApi from './chatbotApi.mock.js';

const useMock = import.meta.env.VITE_CHATBOT_USE_MOCK === 'true';
const impl = useMock ? mockApi : realApi;

export const sendMessage = impl.sendMessage;
export const checkHealth = impl.checkHealth;

export default { sendMessage, checkHealth };
