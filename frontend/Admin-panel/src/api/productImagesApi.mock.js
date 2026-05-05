// Mock product-images API client. Holds an in-memory map of
// productId -> ProductImage[]. Mirrors the real client's signatures so the
// component code can swap between them via VITE_PRODUCT_IMAGES_USE_MOCK.
//
// State lives in module scope and is intentionally lost on full page reload.
// Use `__seed(productId, images)` from a dev page to pre-populate edit-mode
// fixtures.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = () => 300 + Math.random() * 500;

let nextId = 1;

/** @type {Map<number|string, object[]>} */
const store = new Map();

/** Track blob: URLs we created so we can revoke them on delete. */
const ownedBlobUrls = new Set();

function getImages(productId) {
  if (!store.has(productId)) store.set(productId, []);
  return store.get(productId);
}

function recomputeSortOrder(list) {
  list.sort((a, b) => a.sort_order - b.sort_order);
  list.forEach((img, index) => {
    img.sort_order = index;
  });
}

function readDimensions(file) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve({ width: null, height: null });
      return;
    }
    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      const result = { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
      URL.revokeObjectURL(tempUrl);
      resolve(result);
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({ width: null, height: null });
    };
    img.src = tempUrl;
  });
}

function makeAbortError() {
  // DOMException isn't available in some test environments — fall back gracefully.
  if (typeof DOMException !== 'undefined') {
    return new DOMException('aborted', 'AbortError');
  }
  const err = new Error('aborted');
  err.name = 'AbortError';
  return err;
}

/**
 * Wait for `ms`, but also fire `onTick` periodically so callers can simulate
 * upload progress. Resolves on completion, rejects if `signal` aborts.
 */
function delayWithProgress(ms, onTick, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(makeAbortError());
      return;
    }

    let elapsed = 0;
    const stepMs = Math.max(50, Math.floor(ms / 10));

    const cleanup = () => {
      clearInterval(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(makeAbortError());
    };

    const timer = setInterval(() => {
      elapsed += stepMs;
      if (elapsed >= ms) {
        cleanup();
        resolve();
        return;
      }
      if (typeof onTick === 'function') {
        const percent = Math.min(90, Math.round((elapsed / ms) * 100));
        try {
          onTick(percent);
        } catch {
          /* ignore consumer errors */
        }
      }
    }, stepMs);

    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Upload files for a product.
 *
 * @param {number|string} productId
 * @param {File[]} files
 * @param {{
 *   onProgress?: (e: { loaded: number, total: number, percent: number }) => void,
 *   signal?: AbortSignal,
 * }} [options]
 */
export async function upload(productId, files, options = {}) {
  const { onProgress, signal } = options;
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0) || files.length;
  const latency = jitter();

  const tick = typeof onProgress === 'function'
    ? (percent) => {
        const loaded = Math.round((percent / 100) * totalBytes);
        onProgress({ loaded, total: totalBytes, percent });
      }
    : undefined;

  await delayWithProgress(latency, tick, signal);

  // Error simulation — any file whose name contains "fail" rejects the call
  // with a 422 envelope, mirroring Laravel validation responses.
  for (const file of files) {
    if (file.name && file.name.toLowerCase().includes('fail')) {
      const err = new Error('Upload failed');
      err.status = 422;
      err.body = { message: 'فشل رفع الصورة' };
      throw err;
    }
  }

  const list = getImages(productId);
  const newImages = [];

  for (const file of files) {
    const { width, height } = await readDimensions(file);
    const blobUrl = URL.createObjectURL(file);
    ownedBlobUrls.add(blobUrl);

    const isFirst = list.length === 0 && newImages.length === 0;

    newImages.push({
      id: nextId++,
      product_id: productId,
      url: blobUrl,
      image_role: isFirst ? 'cover' : 'gallery',
      sort_order: list.length + newImages.length,
      alt_text_ar: null,
      alt_text_en: null,
      width,
      height,
      file_size_bytes: file.size,
      mime_type: file.type,
      embedding_status: 'pending',
      embedding_processed_at: null,
      created_at: new Date().toISOString(),
    });
  }

  list.push(...newImages);

  if (typeof onProgress === 'function') {
    onProgress({ loaded: totalBytes, total: totalBytes, percent: 100 });
  }

  // Return a deep-ish copy so callers mutating the result don't corrupt state.
  return newImages.map((img) => ({ ...img }));
}

/**
 * Update metadata on a single image.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 * @param {object} fields
 */
export async function patch(productId, imageId, fields) {
  await sleep(jitter());

  const list = getImages(productId);
  const target = list.find((img) => img.id === imageId);
  if (!target) {
    const err = new Error('Image not found');
    err.status = 404;
    err.body = { message: 'الصورة غير موجودة' };
    throw err;
  }

  // Setting role to cover demotes any existing cover first.
  if (fields && fields.image_role === 'cover') {
    for (const img of list) {
      if (img.id !== imageId && img.image_role === 'cover') {
        img.image_role = 'gallery';
      }
    }
  }

  Object.assign(target, fields);

  return { ...target };
}

/**
 * Delete an image. If the deleted image was the cover and other images
 * remain, the next image (lowest sort_order) is auto-promoted to cover.
 * The blob URL is revoked.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 */
export async function deleteImage(productId, imageId) {
  await sleep(jitter());

  const list = getImages(productId);
  const index = list.findIndex((img) => img.id === imageId);
  if (index === -1) {
    const err = new Error('Image not found');
    err.status = 404;
    err.body = { message: 'الصورة غير موجودة' };
    throw err;
  }

  const [removed] = list.splice(index, 1);

  // Revoke the blob URL we created in upload().
  if (typeof removed.url === 'string' && removed.url.startsWith('blob:') && ownedBlobUrls.has(removed.url)) {
    try {
      URL.revokeObjectURL(removed.url);
    } catch {
      /* ignore */
    }
    ownedBlobUrls.delete(removed.url);
  }

  // Auto-promote next image to cover if needed.
  let promoted = null;
  if (removed.image_role === 'cover' && list.length > 0) {
    const next = [...list].sort((a, b) => a.sort_order - b.sort_order)[0];
    next.image_role = 'cover';
    promoted = next;
  }

  recomputeSortOrder(list);

  return {
    deleted_id: removed.id,
    promoted_cover_id: promoted ? promoted.id : null,
    images: list.map((img) => ({ ...img })),
  };
}

/**
 * Reorder images. `order` is either an array of ids (new order) or an array
 * of { id, sort_order } entries.
 *
 * @param {number|string} productId
 * @param {Array<number|string|{ id: number|string, sort_order: number }>} order
 */
export async function reorder(productId, order) {
  await sleep(jitter());

  const list = getImages(productId);

  if (Array.isArray(order)) {
    // Build a desired-order map.
    const positions = new Map();
    order.forEach((entry, index) => {
      if (entry && typeof entry === 'object') {
        positions.set(entry.id, typeof entry.sort_order === 'number' ? entry.sort_order : index);
      } else {
        positions.set(entry, index);
      }
    });

    for (const img of list) {
      if (positions.has(img.id)) {
        img.sort_order = positions.get(img.id);
      }
    }

    recomputeSortOrder(list);
  }

  return list.map((img) => ({ ...img }));
}

/**
 * Promote `imageId` to cover; demote the previous cover to gallery.
 *
 * @param {number|string} productId
 * @param {number|string} imageId
 */
export async function setCover(productId, imageId) {
  await sleep(jitter());

  const list = getImages(productId);
  const target = list.find((img) => img.id === imageId);
  if (!target) {
    const err = new Error('Image not found');
    err.status = 404;
    err.body = { message: 'الصورة غير موجودة' };
    throw err;
  }

  for (const img of list) {
    if (img.id !== imageId && img.image_role === 'cover') {
      img.image_role = 'gallery';
    }
  }
  target.image_role = 'cover';

  return list.map((img) => ({ ...img }));
}

/**
 * Dev-only helper. Seed the in-memory store with hardcoded fixtures so
 * edit-mode flows can be tested before the product GET is wired up.
 *
 * Not exported through `src/api/index.js` — import from this module directly.
 *
 * @param {number|string} productId
 * @param {object[]} images
 */
export function __seed(productId, images) {
  const cloned = images.map((img) => ({ ...img }));
  store.set(productId, cloned);

  // Keep nextId ahead of any seeded ids so subsequent uploads don't collide.
  for (const img of cloned) {
    if (typeof img.id === 'number' && img.id >= nextId) {
      nextId = img.id + 1;
    }
  }
}
