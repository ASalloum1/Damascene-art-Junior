// Branch module: chooses between the real and mock visual-search clients
// based on the build-time flag VITE_VISUAL_SEARCH_USE_MOCK.
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
//   import * as visualSearchApi from '../api/visualSearchApi.index.js';
//   visualSearchApi.search(file, { page: 1 });

import * as realApi from './visualSearchApi.js';
import * as mockApi from './visualSearchApi.mock.js';

const useMock = import.meta.env.VITE_VISUAL_SEARCH_USE_MOCK === 'true';
const impl = useMock ? mockApi : realApi;

export const search = impl.search;
export const logClick = impl.logClick;

export default { search, logClick };
