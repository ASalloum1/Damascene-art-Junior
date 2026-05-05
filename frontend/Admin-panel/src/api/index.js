// API surface for product-images. Selects mock vs real implementation based
// on `VITE_PRODUCT_IMAGES_USE_MOCK` at runtime.
//
// Both modules are imported statically (no top-level await) — the mock
// adds ~3KB to the bundle but keeps Vite/HMR/test runners simple. Tree
// shaking will not drop the unused side, by design.

import * as realApi from './productImagesApi.js';
import * as mockApi from './productImagesApi.mock.js';

const useMock = import.meta.env.VITE_PRODUCT_IMAGES_USE_MOCK === 'true';
const impl = useMock ? mockApi : realApi;

export const upload = impl.upload;
export const patch = impl.patch;
export const deleteImage = impl.deleteImage;
export const reorder = impl.reorder;
export const setCover = impl.setCover;

// Spec §3.2 destructures `delete: deleteImage` from the impl. JavaScript
// doesn't allow `delete` as a binding, but it can be re-exported as one.
export { deleteImage as delete };
