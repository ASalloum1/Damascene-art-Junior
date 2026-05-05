# Visual Search — Frontend Spec (Customer Storefront) — v2

> **For:** You (working with Claude Code) — the frontend will be built before the backend lands.
> **Project:** Damascene Art (React 19 + Vite 8 + CSS Modules + Lucide React).
> **Scope:** The customer-facing storefront only. Admin Panel and Store Manager are unaffected.
> **Goal:** Build a complete, production-quality visual search page that can be developed and demoed against a mock API, then flipped to the real backend with a single config change.
>
> **Version 2 changes:** Added image-URL resolution helper for relative paths returned by the real backend, clarified the `queryId` lifecycle on new searches, and made the API contract lock between mock and real client explicit.

---

## Context

The customer storefront needs a new feature: **upload an image, find visually similar Damascene products**. The feature is powered by a Python microservice (DINOv2 + FAISS) bridged through the Laravel backend. From the frontend's perspective, only the Laravel endpoints matter:

```
POST /api/visual-search           ← upload image, get ranked products
POST /api/visual-search/click     ← log a click for analytics
```

The Laravel side is being built **after** this frontend, so the frontend must:
1. Work end-to-end against a **mock API** during development.
2. Switch to the **real API** with a single environment variable change.
3. Validate the entire user journey before any backend code exists.

---

## 1. Architecture overview

A single new page at `/visual-search` with three states:

```
┌─────────────────────────────────────────────────────────────┐
│  State A: Empty                                             │
│  ────────                                                   │
│  Upload zone + helper text + camera button                  │
│                                                             │
│  ↓ user picks/captures an image                             │
│                                                             │
│  State B: Searching                                         │
│  ─────────                                                  │
│  Image preview + skeleton grid + progress indicator         │
│                                                             │
│  ↓ backend responds                                         │
│                                                             │
│  State C: Results                                           │
│  ────────                                                   │
│  Image preview + paginated grid of similar products         │
│  + "search again" button                                    │
└─────────────────────────────────────────────────────────────┘
```

Plus an **error state** that overlays State B if the request fails or the service is unavailable.

The page is reachable from:

- **Direct URL:** `/visual-search`
- **Search bar icon:** a camera icon (Lucide `Camera`) next to the existing text-search input in the header, on every page

---

## 2. Files to create

```
frontend/customer-storefront/src/
├── pages/
│   └── VisualSearch/
│       ├── VisualSearchPage.jsx
│       ├── VisualSearchPage.module.css
│       └── components/
│           ├── ImageDropZone.jsx
│           ├── ImageDropZone.module.css
│           ├── QueryImagePreview.jsx
│           ├── QueryImagePreview.module.css
│           ├── ResultsGrid.jsx
│           ├── ResultsGrid.module.css
│           ├── ResultCard.jsx
│           ├── ResultCard.module.css
│           ├── ResultsPagination.jsx
│           └── ResultsPagination.module.css
├── api/
│   ├── visualSearchApi.js          ← real API client
│   └── visualSearchApi.mock.js     ← mock API client
├── hooks/
│   └── useVisualSearch.js
└── components/header/
    └── VisualSearchButton.jsx       ← camera icon in header
```

The exact path layout depends on the project's existing conventions — match what's already there. The names above are illustrative.

---

## 3. The API contract (what the backend will return)

### 3.1 `POST /api/visual-search`

**Request:**

```
Content-Type: multipart/form-data

file: <image file>            // required, max 10 MB, jpeg/png/webp
page: 1                       // optional, default 1, max 5
per_page: 10                  // optional, default 10, max 20
```

**Successful response (200):**

```typescript
{
  query_id: number,
  service_available: true,
  results: Array<{
    product: {
      id: number,
      name: string,
      slug: string,
      price: number,
      currency: string,         // "SAR"
      thumbnail_url: string,
      category: { id: number, name: string },
      // …whatever the existing /api/products/:id returns
    },
    product_image_id: number,
    matched_image_url: string,  // the specific image that matched
    similarity_score: number,   // 0..1, higher = more similar
    rank: number,               // 1-based
  }>,
  pagination: {
    page: number,
    per_page: number,
    total_pages: number,
    total_results: number,
  },
}
```

**Service-unavailable response (still HTTP 200):**

```typescript
{
  query_id: number,
  service_available: false,
  message: string,        // Arabic, ready to display
  results: [],
  pagination: { page: 1, per_page: 10, total_pages: 1, total_results: 0 },
}
```

**Validation/rate-limit errors (HTTP 4xx):** standard Laravel error envelope; the frontend shows a generic Arabic toast.

### 3.2 `POST /api/visual-search/click`

Fire-and-forget logging — the user's navigation must not be blocked by it.

```
Content-Type: application/json

{
  "query_id": 1042,
  "product_id": 17,
  "result_position": 1,
  "similarity_score": 0.8732
}
```

**Response (201):** `{ "logged": true }`

The frontend does not need the response — call it with `keepalive: true` so it survives navigation.

### 3.3 Image URL resolution

The backend returns image URLs as **relative paths** (e.g., `/storage/products/17/cover.jpg`), not absolute URLs. This matches the convention of the existing catalogue endpoint. The frontend must resolve them against the API base URL before rendering.

Create a small helper in `src/utils/imageUrl.js`:

```javascript
import { apiBaseUrl } from '../config';

/**
 * Resolve a possibly-relative image URL against the API base URL.
 *
 * - Absolute URLs (http://, https://, data:) are returned as-is
 * - Mock data uses absolute Picsum URLs and passes through
 * - Real backend returns "/storage/..." which gets prefixed
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
```

Use this **everywhere** an image URL from the API is rendered — `<ResultCard>`, `<QueryImagePreview>` does not need it (the preview uses a `URL.createObjectURL(file)` from a local File), but every URL that came from the network does.

```jsx
// In ResultCard.jsx
<img src={resolveImageUrl(result.matched_image_url)} alt="..." />
```

This keeps the mock and the real backend interchangeable: mock data uses absolute Picsum URLs that pass through unchanged, real backend returns `/storage/...` paths that get prefixed.

---

## 4. The mock API

Built first. Lives next to the real one and is selected by an environment flag.

### 4.1 The flag

In `.env`:

```
VITE_VISUAL_SEARCH_USE_MOCK=true
```

In any module that imports the API:

```javascript
const useMock = import.meta.env.VITE_VISUAL_SEARCH_USE_MOCK === 'true';
const visualSearchApi = useMock
  ? await import('./visualSearchApi.mock.js')
  : await import('./visualSearchApi.js');
```

Or simpler: a single file that branches internally.

### 4.2 Mock behavior

The mock should feel like the real thing:

1. **Latency simulation:** resolve the search promise after **1.5 to 3.0 seconds** (random, with jitter). This lets you build and test the loading state.

2. **Result variety:** return 27 results across 3 pages with descending similarity scores (e.g., 0.94, 0.91, 0.88, … 0.32). Reuse 5–6 placeholder products from the existing catalogue (or use Lorem Picsum images if no products are seeded yet).

3. **Service-unavailable simulation:** if the uploaded image's filename includes the word `fail`, return the `service_available: false` shape. This is your manual switch for testing the error UI.

4. **Validation simulation:** if the file is over 10 MB, throw an error matching the real backend's 422 shape.

5. **Click logging:** the mock click endpoint just `console.log`s and resolves.

### 4.3 Mock implementation sketch

```javascript
// visualSearchApi.mock.js
import { mockProducts } from './mockData';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 1500 + Math.random() * 1500;

export async function search(file, { page = 1, perPage = 10 } = {}) {
  await sleep(jitter());

  if (file.size > 10 * 1024 * 1024) {
    const err = new Error('File too large');
    err.status = 422;
    err.body = { message: 'حجم الملف يتجاوز 10 ميجابايت' };
    throw err;
  }

  if (file.name.toLowerCase().includes('fail')) {
    return {
      query_id: Math.floor(Math.random() * 10000),
      service_available: false,
      message: 'خدمة البحث البصري غير متاحة حالياً. حاول مجدداً بعد قليل.',
      results: [],
      pagination: { page: 1, per_page: 10, total_pages: 1, total_results: 0 },
    };
  }

  const allResults = mockProducts.slice(0, 27).map((p, i) => ({
    product: p,
    product_image_id: 1000 + i,
    matched_image_url: p.thumbnail_url,
    similarity_score: 0.94 - (i * 0.022),
    rank: i + 1,
  }));

  const offset = (page - 1) * perPage;
  return {
    query_id: Math.floor(Math.random() * 10000),
    service_available: true,
    results: allResults.slice(offset, offset + perPage),
    pagination: {
      page,
      per_page: perPage,
      total_pages: Math.ceil(allResults.length / perPage),
      total_results: allResults.length,
    },
  };
}

export async function logClick(payload) {
  console.log('[mock] visual-search click:', payload);
  return { logged: true };
}
```

### 4.4 The real client

```javascript
// visualSearchApi.js
import { apiBaseUrl } from '../config'; // existing project utility

export async function search(file, { page = 1, perPage = 10 } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('page', String(page));
  form.append('per_page', String(perPage));

  const res = await fetch(`${apiBaseUrl}/api/visual-search`, {
    method: 'POST',
    body: form,
    credentials: 'include', // for session-based auth + CSRF
  });

  if (!res.ok) {
    const err = new Error(`Search failed: ${res.status}`);
    err.status = res.status;
    try { err.body = await res.json(); } catch { /* ignore */ }
    throw err;
  }

  return res.json();
}

export async function logClick(payload) {
  return fetch(`${apiBaseUrl}/api/visual-search/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
    keepalive: true, // survives page navigation
  });
}
```

---

## 5. The `useVisualSearch` hook

Encapsulates all the state machine logic. The page component stays presentation-focused.

```javascript
// hooks/useVisualSearch.js
import { useCallback, useState } from 'react';
import * as visualSearchApi from '../api/visualSearchApi';

export function useVisualSearch() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  // 'idle' | 'searching' | 'results' | 'service_unavailable' | 'error'
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const search = useCallback(async (newFile, page = 1) => {
    if (newFile && newFile !== file) {
      setFile(newFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(newFile));
    }

    setStatus('searching');
    setErrorMessage(null);

    try {
      const targetFile = newFile ?? file;
      if (!targetFile) throw new Error('No file');

      const data = await visualSearchApi.search(targetFile, { page });

      if (!data.service_available) {
        setStatus('service_unavailable');
        setErrorMessage(data.message);
        setResults([]);
        setPagination(data.pagination);
        return;
      }

      setQueryId(data.query_id);
      setResults(data.results);
      setPagination(data.pagination);
      setStatus('results');
    } catch (e) {
      setStatus('error');
      setErrorMessage(
        e.body?.message ?? 'حدث خطأ غير متوقع. حاول مجدداً.'
      );
    }
  }, [file, previewUrl]);

  const goToPage = useCallback((page) => {
    if (status === 'results') search(file, page);
  }, [status, file, search]);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResults([]);
    setPagination(null);
    setQueryId(null);
    setErrorMessage(null);
    setStatus('idle');
  }, [previewUrl]);

  const logClick = useCallback((product, position, score) => {
    if (!queryId) return;
    visualSearchApi.logClick({
      query_id: queryId,
      product_id: product.id,
      result_position: position,
      similarity_score: score,
    }).catch(() => { /* fire and forget */ });
  }, [queryId]);

  return {
    file, previewUrl, status, results, pagination,
    errorMessage, search, goToPage, reset, logClick,
  };
}
```

### 5.1 `queryId` lifecycle

Each call to `search()` produces a new `query_id` from the backend (or the mock). The hook updates its internal `queryId` state on every successful search.

This means: **clicks logged after the user starts a new search are attributed to the new search, not the old one.** This is intentional and correct — a click only makes sense in the context of the search that produced the result list. If the user uploads a new image and then clicks a result from the *new* result list, that click belongs to the new query_id.

Edge cases:
- **Click during a search-in-progress:** `queryId` from the previous search is still set; click logs against it. This is fine — the result the user clicked was from the previous search list, which is still visible until the new results arrive.
- **Click during `service_unavailable`:** there are no results to click, so this can't happen.
- **`reset()` clears `queryId`:** clicks attempted after reset are silently ignored (the `if (!queryId) return` guard handles this).

---

## 6. Page layout

```
┌───────────────────────────────────────────────────────┐
│  Header (existing)                                    │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ← العودة         البحث بالصورة                       │
│                                                       │
│  ┌─────────────────┬───────────────────────────────┐  │
│  │                 │                               │  │
│  │  [preview /     │  [results grid]               │  │
│  │   drop zone]    │                               │  │
│  │                 │                               │  │
│  │  📷 ابحث بصورة  │  ┌─────┐ ┌─────┐ ┌─────┐      │  │
│  │  أخرى            │  │     │ │     │ │     │      │  │
│  │                 │  └─────┘ └─────┘ └─────┘      │  │
│  │                 │                               │  │
│  │                 │     ←  1  2  3  →             │  │
│  └─────────────────┴───────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

- **Desktop (≥ 1024px):** two columns. Preview/dropzone fixed at ~360px on the left, results grid on the right.
- **Tablet (768–1023px):** preview on top (full-width, max-height 320px), results below.
- **Mobile (< 768px):** preview takes full width and ~40vh, results scroll below.

Right-to-left layout (the project is Arabic-first); use `dir="rtl"` if not already applied at a higher level.

---

## 7. Component specs

### 7.1 `ImageDropZone`

Empty state. Shown when `status === 'idle'`.

```
┌───────────────────────────────────────────┐
│                                           │
│             [📷 large icon]               │
│                                           │
│   اسحب صورة هنا أو انقر للاختيار          │
│                                           │
│   JPEG, PNG, WebP — حتى 10 ميجابايت       │
│                                           │
│   ┌─────────────────────────────────┐     │
│   │   اختيار من الجهاز              │     │
│   └─────────────────────────────────┘     │
│                                           │
│   ─────────────  أو  ─────────────        │
│                                           │
│   ┌─────────────────────────────────┐     │
│   │   التقاط صورة بالكاميرا         │     │
│   └─────────────────────────────────┘     │
│                                           │
└───────────────────────────────────────────┘
```

**Behavior:**
- Drop zone covers the entire empty state on desktop
- "اختيار من الجهاز" → opens `<input type="file" accept="image/*">`
- "التقاط صورة بالكاميرا" → opens `<input type="file" accept="image/*" capture="environment">` — on mobile, this opens the rear camera directly; on desktop, it falls back to file picker
- On hover/drag-over: dashed gold border becomes solid + filled gold-bg (existing tokens `--color-gold` / `--color-gold-bg`)
- Above the buttons, a one-line hint: "يبحث النظام عن منتجات شبيهة في كتالوجنا" (small gray text)

**Lucide icons:** `Camera` (large center icon), `Upload` (file picker button), `CameraOff` doesn't fit — use `Camera` for both.

### 7.2 `QueryImagePreview`

Shown when `status !== 'idle'`. The user's uploaded image stays visible while searching.

```
┌───────────────────────────────┐
│  [×]                          │  ← top-right, "remove and start over"
│                               │
│      [user's image]           │
│                               │
│                               │
│                               │
│  ┌─────────────────────────┐  │
│  │  📷 بحث بصورة أخرى       │  │  ← stays clickable during search
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

- Image preview: `object-fit: contain`, max-height matches drop zone
- The "×" button calls `reset()`
- The "بحث بصورة أخرى" button opens the file picker again — clicking it during a search cancels the in-flight request and starts a new one (use `AbortController` in the API client)

### 7.3 `ResultsGrid`

The results column, with three sub-states:

#### A. Searching (skeleton)

```
┌─────┐ ┌─────┐ ┌─────┐
│░░░░░│ │░░░░░│ │░░░░░│
│░░░░░│ │░░░░░│ │░░░░░│
└─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐
│░░░░░│ │░░░░░│ │░░░░░│
│░░░░░│ │░░░░░│ │░░░░░│
└─────┘ └─────┘ └─────┘
```

10 placeholder cards (matching `per_page` default), each with shimmer animation. A small status line above the grid: "جاري البحث عن منتجات مشابهة…"

#### B. Results

The actual grid. 3 columns on desktop, 2 on tablet, 1 on mobile.

#### C. Service unavailable

```
┌─────────────────────────────────────────┐
│                                         │
│            ⚠️ (large icon)              │
│                                         │
│   خدمة البحث البصري غير متاحة حالياً     │
│                                         │
│       حاول مجدداً بعد قليل              │
│                                         │
│   ┌────────────────────────┐            │
│   │   إعادة المحاولة        │            │
│   └────────────────────────┘            │
│                                         │
│       ─────  أو  ─────                  │
│                                         │
│   ابحث عن منتجاتنا بالاسم  →            │
│                                         │
└─────────────────────────────────────────┘
```

The "ابحث بالاسم" link routes to the existing text-search page. This is the graceful-degradation escape hatch.

#### D. Empty results

If the catalogue is empty or no embeddings exist yet (Phase 1 transition state):

```
┌─────────────────────────────────────────┐
│       لم نجد منتجات مطابقة               │
│                                         │
│   جرّب صورة بزاوية أو إضاءة مختلفة      │
└─────────────────────────────────────────┘
```

### 7.4 `ResultCard`

Each result is essentially a product card with an extra similarity badge.

```
┌─────────────────────────────┐
│                             │
│      [product image]        │
│                             │
│  ⭐ 87% تطابق                │  ← top-right, gold
│                             │
├─────────────────────────────┤
│  صندوق دمشقي مزخرف          │  ← product name
│  850 ر.س                    │  ← price
│  صناديق                     │  ← category, small
└─────────────────────────────┘
```

**Similarity badge formula:** `Math.round(score * 100)`. Show only if score ≥ 0.5 — below that, hide the badge (low scores look bad and confuse users; if FAISS returned it, it's still ranked, but we don't advertise the percentage).

**Hover state:** subtle scale-up (1.02) and `--shadow-card-hover`.

**Click behavior:**
1. Call `logClick(product, rank, score)` (fire and forget)
2. Navigate to `/products/{slug}` (or whatever the existing product detail route is)

Use the existing `<Link>` component / router pattern — match what other product cards in the project already do.

### 7.5 `ResultsPagination`

Standard numeric pagination, **not** infinite scroll.

```
   ←   1   2   3   →
```

- Current page: gold background, white text
- Disabled state: ghost styling
- Show all pages if `total_pages ≤ 5`; otherwise use the standard "first / current ± 2 / last" pattern with ellipsis
- Updating the page calls `goToPage(n)` from the hook
- Scroll the results column to the top when the page changes

---

## 8. Header integration: `VisualSearchButton`

A small camera icon next to the existing search bar. On every page.

```
[🔍  ابحث عن منتج...           ]  [📷]
```

- Icon: Lucide `Camera`
- Color: `--color-stone` default, `--color-gold` on hover
- Click: `useNavigate()('/visual-search')`
- Tooltip on hover: "البحث بالصورة"
- Keyboard accessible: `<button>` with `aria-label="البحث بالصورة"`

On mobile, this icon should be visible but compact (the search bar is usually collapsed into an icon at small viewports — the camera goes next to or inside that pattern).

---

## 9. Loading states summary

A cheat-sheet for what shows when:

| `status`              | Preview column                  | Results column         |
|-----------------------|---------------------------------|------------------------|
| `idle`                | `<ImageDropZone>`               | hidden / illustration  |
| `searching`           | `<QueryImagePreview>` + spinner | skeleton grid          |
| `results`             | `<QueryImagePreview>`           | `<ResultsGrid>`        |
| `service_unavailable` | `<QueryImagePreview>`           | service-unavailable card |
| `error`               | `<QueryImagePreview>`           | error card with retry  |

The error card is identical in shape to the service-unavailable one but with different copy: "حدث خطأ — حاول مجدداً" + retry button that re-invokes the last search.

---

## 10. Accessibility

- The page must have a `<h1>` saying "البحث بالصورة"
- The drop zone is a `<button>` (not a `<div>`) so it's reachable by keyboard. Pressing Enter or Space opens the file picker
- Camera button has `aria-label`
- Result cards are `<a>` or `<Link>` — fully keyboard navigable
- During search, the results region has `aria-busy="true"`
- Toast errors are announced via `aria-live="polite"` (use the existing toast pattern in the project)
- The similarity badge has `aria-label="نسبة التطابق ٨٧ بالمئة"` (or similar) so screen readers don't read just "87%"

---

## 11. Styling

Use existing design tokens. Examples:

```css
.dropZone {
  border: 2px dashed var(--color-gold);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  background: var(--color-cream);
  transition: var(--transition-base);
}

.dropZone:hover,
.dropZoneDragging {
  background: var(--color-gold-bg);
  border-style: solid;
}

.similarityBadge {
  position: absolute;
  top: var(--space-3);
  inset-inline-end: var(--space-3); /* RTL-aware */
  background: var(--color-gold);
  color: var(--color-white);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.skeletonCard {
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    90deg,
    var(--color-cream-dark) 0%,
    var(--color-cream) 50%,
    var(--color-cream-dark) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-lg);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 12. Toast messages (Arabic)

| Event                          | Message                                            |
|--------------------------------|----------------------------------------------------|
| File too large                 | "حجم الملف يتجاوز 10 ميجابايت"                    |
| Invalid file type              | "نوع الملف غير مدعوم — استخدم JPEG أو PNG أو WebP" |
| Network error during search    | "تعذّر إجراء البحث — تحقّق من اتصالك بالإنترنت"   |
| Rate limited (HTTP 429)        | "حاول البحث مجدداً بعد قليل"                       |
| Camera permission denied (web) | "تعذّر الوصول إلى الكاميرا"                        |

---

## 13. Mock data for development

Create `frontend/customer-storefront/src/api/mockData.js`:

```javascript
export const mockProducts = [
  {
    id: 101, slug: 'damascene-box-classic',
    name: 'صندوق دمشقي كلاسيكي',
    price: 850, currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/box1/400/400',
    category: { id: 1, name: 'صناديق' },
  },
  {
    id: 102, slug: 'damascene-tray',
    name: 'صينية مطعّمة بالصدف',
    price: 1200, currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/tray1/400/400',
    category: { id: 2, name: 'صواني' },
  },
  // …seed 5–6 entries; the mock cycles through them
];
```

Replace these with real product data once the catalogue is seeded.

---

## 14. What this spec leaves out

- **Saving to favorites from the results page.** Existing favorites flow on product cards still works; no new favorites UI needed.
- **Sharing search results.** Deep-linking a search query is non-trivial without server-side image storage; not in this phase.
- **Filters on results.** The catalogue has filters (category, price); they are not applied to visual-search results in v1. Adding them would require sending filter params to Laravel and either filtering after the FAISS query or filtering before. Defer.
- **CLIP text-to-image search.** A separate feature on the regular `/search` page; not part of this spec.

---

## 15. Definition of Done

- [ ] `/visual-search` route renders and is accessible from the header camera icon
- [ ] Drop zone accepts drag-and-drop and click-to-pick, on desktop and mobile
- [ ] "Take a picture" button opens the camera on mobile
- [ ] Mock API returns realistic results with simulated latency
- [ ] All five `status` states render correctly (`idle`, `searching`, `results`, `service_unavailable`, `error`)
- [ ] Skeleton grid displays during search
- [ ] Results grid is responsive (3 / 2 / 1 columns)
- [ ] Similarity badge shows for scores ≥ 0.5
- [ ] Pagination works and scrolls to top of results on page change
- [ ] Click logging fires (visible in console for the mock)
- [ ] Service-unavailable state shows the fallback to text search
- [ ] Reset button returns to the empty state
- [ ] All UI strings in Arabic, RTL layout correct
- [ ] CSS uses existing design tokens
- [ ] `resolveImageUrl()` helper created and used wherever a network-returned image URL is rendered
- [ ] `queryId` resets on every new search; clicks attribute to the right query
- [ ] Switching `VITE_VISUAL_SEARCH_USE_MOCK=false` swaps to the real API without code changes
- [ ] Lighthouse accessibility score ≥ 95 on the page

---

**End of Customer Visual Search frontend spec v2.**
