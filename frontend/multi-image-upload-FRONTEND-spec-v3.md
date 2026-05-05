# Multi-Image Product Upload — Frontend Spec (React) — v3

> **For:** Claude Code (working with the developer who is building the frontend before the backend lands)
> **Project:** Damascene Art (React 19 + Vite 8 + CSS Modules + Lucide React)
> **Scope:** Admin Panel + Store Manager Dashboard only. **The customer storefront is unaffected** — customers cannot upload product images.
> **Goal:** Replace the current single-image upload UI with a multi-image gallery manager that supports drag-drop upload, reordering, role tagging, and alt texts. The component must work end-to-end against a mock API during development, then flip to the real backend with a single config change.
>
> **Version 3 changes:** Added mock-mode support so the component can be developed and demoed before the backend exists, added an image-URL resolution helper for relative paths returned by the real backend, clarified scope (admin/store-manager only, not the customer storefront), and noted how to mock the existing `GET /api/admin/products/{id}` endpoint during development.
>
> **Version 2 changes:** Clarified the expected `pending` state of the embedding badge during Phase 1, extracted upload logic into a custom hook, added accessibility requirements for keyboard reordering, and specified the loading-skeleton behaviour for edit mode.

---

## Context & Why

The backend has been (or is being) updated to support multiple images per product, with each image having a `role` (cover, gallery, detail, lifestyle), a sort order, and optional bilingual alt texts. The visual search feature being built next requires this richer image data.

**Current state:**
- Both Admin Panel and Store Manager Dashboard accept a single image upload per product
- Image preview, file input, and "اختر صورة" label live inside the product create/edit forms

**Target state:**
- A shared `ProductImagesManager` component used in both apps
- Drag-and-drop multi-file upload
- Image grid with reorder, role dropdown, alt text inputs, set-as-cover, delete
- Embedding status badge (read-only, just displays what the backend returns)

---

## 1. Files to update

- `frontend/Admin-panel/src/pages/admin/ProductsManagement.jsx`
- `frontend/Admin-panel/src/pages/admin/ProductsManagement.module.css`
- `frontend/store-manager-dashboard/src/pages/ProductsPage.jsx`
- `frontend/store-manager-dashboard/src/pages/ProductsPage.module.css`

Both Admin and Store Manager views should use **the same component** for the image manager. Extract it into a shared location (or duplicate it identically in both apps if your project structure does not support shared components yet — match whatever pattern is already in use).

### 1.1 On separate frontend repos

The project has three independent frontend apps, each with its own `package.json` and build pipeline:

```
frontend/
├── Admin-panel/              ← affected by this spec
├── store-manager-dashboard/  ← affected by this spec
└── customer-storefront/      ← NOT affected by this spec
```

The customer storefront has its own visual search page (built separately — see `visual-search-FRONTEND-spec-v2.md`) but does **not** include `ProductImagesManager` or any image-upload UI. Customers never upload product images.

If a shared package between `Admin-panel` and `store-manager-dashboard` does not yet exist, the cleanest approach is to:

1. Build `ProductImagesManager` first in `Admin-panel/src/components/products/`
2. Once it works, copy the same component file to `store-manager-dashboard/src/components/products/` (or set up a `frontend/shared/` package and import from both)

Pick the simpler option for v1 and refactor to a shared package later if duplication becomes painful.

---

## 2. New shared component: `ProductImagesManager`

**Suggested path:** `frontend/Admin-panel/src/components/products/ProductImagesManager.jsx` (and equivalent in store-manager).

**Props:**

```javascript
{
  productId,            // null for "create new product" mode
  initialImages,        // array of existing images (for edit mode), default []
  onImagesChange,       // callback(images) fired on any change
  maxImages = 10,
}
```

---

## 3. API contract (consumed by this component)

The backend exposes these endpoints:

```
POST   /api/admin/products/{product}/images                     Upload one or more images (multipart)
PATCH  /api/admin/products/{product}/images/{image}             Update image metadata
DELETE /api/admin/products/{product}/images/{image}             Delete an image
POST   /api/admin/products/{product}/images/reorder             Reorder images
POST   /api/admin/products/{product}/images/{image}/set-cover   Set as cover
```

Each `ProductImage` returned by the backend has this shape:

```typescript
{
  id: number,
  product_id: number,
  url: string,                    // full URL to display
  image_role: 'cover' | 'gallery' | 'detail' | 'lifestyle',
  sort_order: number,
  alt_text_ar: string | null,
  alt_text_en: string | null,
  width: number | null,
  height: number | null,
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped',
  embedding_processed_at: string | null,
  created_at: string,
}
```

### 3.1 Image URL resolution

The backend returns image URLs as **relative paths** (e.g., `/storage/products/17/cover.jpg`) — this is the default behaviour of Laravel's `Storage::url()`. The frontend must resolve them against the API base URL before rendering.

Create a small helper in `src/utils/imageUrl.js` (one in each frontend app, or shared):

```javascript
import { apiBaseUrl } from '../config'; // existing project utility

/**
 * Resolve a possibly-relative image URL against the API base URL.
 *
 * - Absolute URLs (http://, https://, data:, blob:) are returned as-is
 * - Local previews from URL.createObjectURL() pass through (blob:)
 * - Mock data using Picsum URLs passes through
 * - Real backend returns "/storage/..." which gets prefixed
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
```

Use this helper **everywhere** an image URL from the API is rendered. The local preview during upload (from `URL.createObjectURL(file)`) is already a `blob:` URL and passes through unchanged.

### 3.2 Mock API mode (for developing without a backend)

The Laravel side of this feature is being built **after** the frontend. To make the frontend developable and demoable in the meantime, every API call must go through a thin client layer that can be flipped between a mock implementation and the real one with a single environment variable.

#### Environment flag

In each frontend app's `.env`:

```
VITE_PRODUCT_IMAGES_USE_MOCK=true
```

#### The API client structure

```
src/api/
├── productImagesApi.js          ← real client (calls Laravel)
├── productImagesApi.mock.js     ← mock client (in-memory state)
└── index.js                     ← chooses based on the env flag
```

`index.js`:

```javascript
const useMock = import.meta.env.VITE_PRODUCT_IMAGES_USE_MOCK === 'true';
const impl = useMock
  ? await import('./productImagesApi.mock.js')
  : await import('./productImagesApi.js');

export const {
  upload,
  patch,
  delete: deleteImage,
  reorder,
  setCover,
} = impl;
```

#### Real client signature

All five functions return Promises and throw on error. Same signatures regardless of which implementation is loaded:

```javascript
// productImagesApi.js (real)
export async function upload(productId, files /* File[] */) { /* POST */ }
export async function patch(productId, imageId, fields)     { /* PATCH */ }
export async function deleteImage(productId, imageId)       { /* DELETE */ }
export async function reorder(productId, order)             { /* POST */ }
export async function setCover(productId, imageId)          { /* POST */ }
```

#### Mock implementation behaviour

The mock holds an in-memory map of `{ productId: ProductImage[] }`. Behaviour:

1. **Latency simulation:** every call resolves after 300–800 ms (random) so the UI shows progress bars and skeletons realistically.

2. **`upload()`:** for each `File`, generates a fake `ProductImage` with:
   - `id`: incrementing counter (e.g., `Date.now() + index`)
   - `url`: `URL.createObjectURL(file)` (blob URL — passes through `resolveImageUrl` unchanged)
   - `image_role`: `'cover'` for the first image of a product, `'gallery'` for the rest
   - `sort_order`: appended at end
   - `width`/`height`: read from the file in-browser via a hidden `<img>` element
   - `file_size_bytes`: from `file.size`
   - `mime_type`: from `file.type`
   - `embedding_status`: always `'pending'` (no Python service in mock mode)
   - `created_at`: `new Date().toISOString()`

3. **`patch()`:** mutates the in-memory record. If `image_role` becomes `'cover'`, demote any existing cover to `'gallery'` first.

4. **`deleteImage()`:** removes the record. If it was the cover, promote the next image (lowest `sort_order`) to cover automatically. Frees the blob URL via `URL.revokeObjectURL`.

5. **`reorder()`:** updates `sort_order` according to the supplied array.

6. **`setCover()`:** demotes current cover, sets new cover, returns updated images.

7. **Error simulation:** if any uploaded file's name includes `fail`, the upload call rejects with an error matching the real backend's 422 shape — useful for testing error states manually.

8. **State persistence:** the mock state lives in a module-level variable. It is lost on page refresh — that's intentional. If you want to test the edit-mode flow, seed the mock with a few hardcoded images (see §4.4).

#### Mock implementation sketch

```javascript
// productImagesApi.mock.js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 300 + Math.random() * 500;

let nextId = 1;
const store = new Map(); // productId -> ProductImage[]

function getImages(productId) {
  if (!store.has(productId)) store.set(productId, []);
  return store.get(productId);
}

async function readDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = URL.createObjectURL(file);
  });
}

export async function upload(productId, files) {
  await sleep(jitter());

  for (const file of files) {
    if (file.name.toLowerCase().includes('fail')) {
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
    const isFirst = list.length === 0 && newImages.length === 0;
    newImages.push({
      id: nextId++,
      product_id: productId,
      url: URL.createObjectURL(file),
      image_role: isFirst ? 'cover' : 'gallery',
      sort_order: list.length + newImages.length,
      alt_text_ar: null,
      alt_text_en: null,
      width, height,
      file_size_bytes: file.size,
      mime_type: file.type,
      embedding_status: 'pending',
      embedding_processed_at: null,
      created_at: new Date().toISOString(),
    });
  }

  list.push(...newImages);
  return newImages;
}

// patch, deleteImage, reorder, setCover follow the same pattern…
```

Full mock implementation is left to the developer — the sketch above shows the style and the level of fidelity expected.

#### When the real backend lands

Switching from mock to real is a single env change:

```
VITE_PRODUCT_IMAGES_USE_MOCK=false
```

If the response shapes match (this spec's §3 contract), nothing else needs to change in the component code.

---

## 4. Component layout

### 4.1 Drop zone (top of the component)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            [📷 icon]                            │
│                                                 │
│     اسحب الصور هنا أو انقر للاختيار             │
│        JPEG, PNG, WebP — حد أقصى 5 ميجا         │
│                                                 │
│         [ اختيار ملفات ]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

Behavior:
- Accepts multiple files at once
- Shows a per-file progress bar during upload
- Disables when `images.length >= maxImages`, with a tooltip: "تم الوصول للحد الأقصى من الصور (10)"
- On hover/drag-over: solid gold filled background (`var(--color-gold-bg)`)
- Idle state: dashed gold border (`2px dashed var(--color-gold)`)

### 4.2 Custom hook: `useFileUpload`

Extract the file-upload logic into a reusable custom hook to keep the component focused on UI:

**Suggested path:** `frontend/Admin-panel/src/hooks/useFileUpload.js`

The hook should expose:

```javascript
const {
  upload,           // (files, productId) => Promise<ProductImage[]>
  uploads,          // { [tempId]: { progress, status, fileName } } for the UI
  cancelUpload,     // (tempId) => void
} = useFileUpload({ endpoint, onSuccess, onError });
```

Use `XMLHttpRequest` (not `fetch`) so that `xhr.upload.onprogress` events are available for the per-file progress bar. The component renders progress bars by iterating over `uploads`.

This separation makes the upload logic testable on its own and reusable later if the project adds other multi-file upload contexts.

### 4.3 Images grid (below the drop zone)

Layout: 3 columns on desktop, 2 on tablet, 1 on mobile.

Each image renders as a card:

```
┌──────────────────────┐
│  [ ⋮⋮ drag handle ]  │  ← top-left, only visible on hover
│                      │
│   [ thumbnail ]      │  ← aspect-ratio: 1/1, object-fit: cover
│                      │
│  ★ الصورة الرئيسية    │  ← only on cover image, gold badge top-right
│                      │
│  ┌────────────────┐  │
│  │ النوع: gallery ▾│  │  ← role dropdown
│  └────────────────┘  │
│                      │
│  [▸ نص بديل (ar/en)] │  ← collapsible section, closed by default
│                      │
│  ⏳ في الانتظار       │  ← embedding status badge (edit mode only)
│                      │
│  [⌂ تعيين كرئيسية]   │  ← visible only if not already cover
│  [🗑 حذف]            │
└──────────────────────┘
```

Drag-and-drop reordering: use `@dnd-kit/sortable`. Pick whichever already exists in the project's `package.json`; if neither exists, install `@dnd-kit/core` + `@dnd-kit/sortable`.

### 4.4 Edit-mode loading skeleton

When the component mounts in edit mode (`productId !== null`), the parent page is fetching `GET /api/admin/products/{id}` to populate the form. While that request is in flight, render a skeleton instead of an empty grid:

- 3 placeholder cards (gray rectangles with shimmer animation), matching the responsive column count
- Drop zone is rendered but disabled with reduced opacity
- Once `initialImages` arrives, transition to the real grid with a 200ms fade

This prevents the disconcerting flash of "no images" before the data loads on slower connections.

#### Edit mode in mock-mode dev environments

The product fetch (`GET /api/admin/products/{id}`) is part of the existing product CRUD flow, **not** of this spec. While the backend for the product CRUD likely already exists, if it doesn't, you have two options for visual testing:

1. **Hardcode `initialImages` for one route.** Add a dev-only route or query param that mounts `<ProductImagesManager>` directly with seeded mock data:
   ```jsx
   <ProductImagesManager
     productId={1}
     initialImages={MOCK_PRODUCT_1_IMAGES}
     onImagesChange={() => {}}
   />
   ```
   `MOCK_PRODUCT_1_IMAGES` is an array of 3–4 hardcoded `ProductImage` objects with Picsum URLs. Pre-seed the mock store on first render so subsequent operations (delete, reorder, set-cover) are consistent.

2. **Mock the product GET as well.** If the existing product CRUD frontend already has its own mock client, extend it to return seeded images. This is cleaner but more work.

Option 1 is the right call for v1 — it lets you build the entire upload UI in isolation, then plug into the real product CRUD flow once the backend lands.

---

## 5. Role dropdown — display labels

| Value | Display label (Arabic) | Lucide icon |
|-------|------------------------|-------------|
| `cover` | الصورة الرئيسية | Star |
| `gallery` | معرض (زاوية) | Image |
| `detail` | تفاصيل (تقريب) | ZoomIn |
| `lifestyle` | في الاستخدام | Sofa or Home |

---

## 6. Embedding status badge (edit mode only)

| Status | Display | Color |
|--------|---------|-------|
| `pending` | ⏳ في الانتظار | gray (`var(--color-stone)`) |
| `processing` | 🔄 قيد المعالجة | blue |
| `completed` | ✅ جاهزة للبحث البصري | green |
| `failed` | ❌ فشلت — [إعادة المحاولة] | red |
| `skipped` | ⏸ مؤجَّلة (الخدمة غير متاحة) | amber |

In **create mode** (new product, `productId === null`), do NOT show this badge — it only makes sense after the image exists in the DB.

### 6.1 Expected state during Phase 1

> **Important UX note for the team:** The visual search backend pipeline is built in a follow-up phase. **Until then, every newly uploaded image will display `pending` indefinitely** — there is no job actually consuming these records yet, by design. This is the documented placeholder state, not a bug.
>
> Once the visual search backend lands, the badge will start transitioning through `processing → completed` automatically without any frontend changes. The frontend just renders whatever the backend reports.
>
> If the admin asks "why is everything stuck on pending?", the correct answer is: "the visual search pipeline is being built; the badge will activate once the backend is wired."

The "إعادة المحاولة" button on the `failed` state calls a backend endpoint that doesn't exist yet — leave a `// TODO` and have the button do nothing for now (or hide it). The visual search pipeline is being built next.

The `skipped` state is similar in spirit to `pending` but indicates the visual search service was specifically unavailable when a job ran. No retry button is needed for `skipped` — a periodic backend command will retry these automatically. The amber color signals "transient issue, will resolve itself" rather than "needs human attention."

---

## 7. Accessibility requirements

The component must be navigable by keyboard alone. `@dnd-kit/sortable` provides keyboard-accessible drag-and-drop out of the box, but the integration must register the keyboard sensor explicitly:

```javascript
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);
```

With this, the keyboard interaction model is:

- **Tab:** focus the next image card
- **Space:** pick up the focused card (announce "picked up image at position X")
- **Arrow keys:** move the picked-up card up/down/left/right
- **Space:** drop the card at the new position
- **Esc:** cancel the move and restore the original position

In addition:

- Every interactive element (role dropdown, set-as-cover button, delete button) must have an accessible name (use `aria-label` if the visible text is just an icon)
- Toast notifications should be announced via `aria-live="polite"` so screen-reader users hear them
- The cover badge must include a screen-reader-only label: `<span class="sr-only">الصورة الرئيسية</span>` if the visual is icon-only

---

## 8. Behavior rules

### 8.1 First upload auto-becomes cover

When a product has zero images and the admin uploads files, the first file automatically becomes `image_role = 'cover'`. The backend handles this on the server side — the frontend just renders whatever the backend returns.

### 8.2 Setting a new cover demotes the old one

Clicking "تعيين كرئيسية" on an image: that image becomes `cover`, the previous cover automatically reverts to `gallery`. The backend handles the transaction; the frontend re-fetches or optimistically updates both images.

### 8.3 Cannot delete the only image

Show a tooltip on hover of the delete button: "لا يمكن حذف الصورة الوحيدة للمنتج." The button is disabled when `images.length === 1`.

### 8.4 Cannot delete the cover unless other images exist

If admin tries to delete the cover and there are other images, the backend automatically promotes the next image (lowest `sort_order`) to cover. The frontend just shows a toast: "تم تعيين [الصورة التالية] كصورة رئيسية تلقائياً."

### 8.5 Reordering — debounce server calls

When the user drags an image, update local state immediately (optimistic UI). After 500ms of no further drags, send a single reorder request to the backend with the full new order.

### 8.6 Create mode behavior

In create mode (new product not yet saved), the component holds files in **local state only** — no upload happens until the product is saved. The submit handler should:

1. POST the product (without images, just the text fields)
2. Take the returned `productId`
3. Call `POST /api/admin/products/{id}/images` with all the staged files
4. On success, navigate back to the products list

If the second step fails, show an error and let the user retry — the product still exists, but has no images yet.

---

## 9. Styling — match the existing brand

Follow the design tokens already defined in the project's CSS:

- `--color-gold` for the cover badge, drag handle, active states, primary buttons
- `--color-gold-bg` for hover/drop-zone-active backgrounds
- `--color-cream-dark` for borders
- `--color-navy` for text
- `--color-stone` and `--color-stone-light` for secondary/muted text
- `--radius-lg` for cards, `--radius-md` for inputs
- `--shadow-card` default elevation, `--shadow-card-hover` on hover
- `--space-*` scale for all gaps and padding
- `--transition-base` for hover transitions

**Cover badge style example:**

```css
.coverBadge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--color-gold);
  color: var(--color-white);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--glow-gold);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

---

## 10. Remove the old single-image upload UI

In both `ProductsManagement.jsx` and `ProductsPage.jsx`, the existing single-image upload block (with `imagePreview`, `handleImageChange`, the `imagePlaceholder` div, the `uploadLabel`) should be **replaced entirely** by `<ProductImagesManager>`.

### 10.1 Update the form state shape

```javascript
// Before
productForm = { name, price, quantity, image, imagePreview }

// After
productForm = { name, price, quantity, images: [] }
// images = array of File objects (create mode) or ProductImage objects (edit mode)
```

### 10.2 Update the submit handler

**Create mode:**
1. POST `/api/admin/products` with the text fields only → get `productId`
2. POST `/api/admin/products/{productId}/images` with the staged files (multipart)
3. Navigate back on success

**Edit mode:**
- Image changes are committed live via the dedicated endpoints (upload, patch, delete, reorder, set-cover)
- The product PATCH only sends text fields (name, price, quantity, etc.)

---

## 11. Toast notifications (Arabic)

Use the existing toast system (whatever the project already has). Suggested messages:

| Event | Message |
|-------|---------|
| Upload success | "تم رفع الصور بنجاح" |
| Upload failure | "فشل رفع الصور — حاول مجدداً" |
| Set cover success | "تم تعيين الصورة كرئيسية" |
| Auto-promoted cover after delete | "تم تعيين [الصورة التالية] كصورة رئيسية تلقائياً" |
| Delete success | "تم حذف الصورة" |
| Reorder saved | (silent, no toast — just a subtle indicator if at all) |
| File too large | "حجم الملف يتجاوز 5 ميجابايت" |
| Invalid file type | "نوع الملف غير مدعوم — استخدم JPEG أو PNG أو WebP" |
| Max images reached | "تم الوصول للحد الأقصى (10 صور)" |

Toasts should be wrapped in a region with `role="status"` and `aria-live="polite"` so screen readers announce them.

---

## 12. Definition of Done

- [ ] `ProductImagesManager` component built and reusable
- [ ] `useFileUpload` custom hook extracted and exposes `upload`, `uploads`, `cancelUpload`
- [ ] Mock API client (`productImagesApi.mock.js`) implements all 5 operations with realistic latency and error simulation
- [ ] Real API client (`productImagesApi.js`) with matching signatures
- [ ] `VITE_PRODUCT_IMAGES_USE_MOCK` env flag switches between mock and real
- [ ] `resolveImageUrl()` helper created and used wherever a network-returned image URL is rendered
- [ ] Drag-drop upload works in both apps (Admin Panel + Store Manager Dashboard)
- [ ] Image grid: thumbnail, role dropdown, alt text inputs, drag-to-reorder
- [ ] Cover badge displays correctly on the cover image only
- [ ] "Set as cover" button works and updates the UI
- [ ] Delete works with the "cannot delete last image" guard
- [ ] Reorder is debounced (500ms) and sends a single backend call
- [ ] Embedding status badge displays all five states correctly in edit mode (and is hidden in create mode)
- [ ] Loading skeleton renders during the initial fetch in edit mode
- [ ] Keyboard reordering works end-to-end (Tab → Space → Arrows → Space)
- [ ] All interactive elements have accessible names
- [ ] Create-mode flow uploads images after product creation
- [ ] All UI strings in Arabic, matching the existing brand tone
- [ ] CSS uses existing design tokens (no hardcoded colors/spacing)
- [ ] Old single-image upload UI fully removed from both `ProductsManagement.jsx` and `ProductsPage.jsx`
- [ ] Responsive: 3 cols desktop / 2 tablet / 1 mobile
- [ ] **End-to-end smoke test in mock mode:** upload 3 files → reorder → change role → set new cover → delete → all UX paths work without a backend
- [ ] **Switching `VITE_PRODUCT_IMAGES_USE_MOCK=false` swaps to the real API without code changes**

---

**End of frontend spec v3.** The backend spec is in a separate file and defines the API contract this component consumes.
