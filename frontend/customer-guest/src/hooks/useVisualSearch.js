// useVisualSearch — state machine for the customer visual-search page.
//
// Encapsulates: file selection, preview URL lifecycle, fetch dispatch
// with abort, pagination, click logging, and Arabic error mapping. The
// page component stays purely presentational.
//
// State machine (locked, see visual-search-FRONTEND-spec-v2.md and the
// agent prompt's "State transitions" table):
//
//   idle          ── search(file) ──▶ searching
//   searching     ── service_available:true  ──▶ results
//   searching     ── service_available:false ──▶ service_unavailable
//   searching     ── fetch rejects (non-abort) ──▶ error
//   results       ── goToPage(n) ──▶ searching
//   any           ── reset() ──▶ idle (revoke previewUrl, clear queryId)
//   any           ── cancel() ──▶ idle (also abort in-flight, fire onCancel)
//
// Memory-leak defenses (all six are mandatory):
//   1. previewUrlRef mirrors previewUrl so the unmount cleanup can revoke
//      without listing previewUrl as a dep on every effect.
//   2. URL.revokeObjectURL is called BEFORE replacing previewUrl in
//      search() and inside reset()/cancel().
//   3. AbortController.abort() runs on unmount.
//   4. mountedRef gates every setState that runs after an await.
//   5. All exported callbacks are stable (deps minimal; we read mutable
//      values from refs).
//   6. The mock's abortableSleep clears its setTimeout and removes its
//      abort listener on resolve — handled inside the mock module.

import { useCallback, useEffect, useRef, useState } from 'react';
import * as visualSearchApi from '../api/visualSearchApi.index.js';

const PER_PAGE = 10;
const GENERIC_ERROR_AR = 'حدث خطأ غير متوقع. حاول مجدداً.';

/**
 * @typedef {Object} VisualSearchOptions
 * @property {() => void} [onCancel] Invoked synchronously inside `cancel()`
 *   after state has been reset to 'idle'. Useful for surfacing a toast.
 */

/**
 * @param {VisualSearchOptions} [options]
 */
export function useVisualSearch({ onCancel } = {}) {
  // Six independent slices of state — split intentionally so a setState on
  // one slice does not invalidate consumers that subscribe to another.
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  // 'idle' | 'searching' | 'results' | 'service_unavailable' | 'error'
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs for transient values that the stable callbacks need to read
  // without re-creating themselves on every state change.
  const fileRef = useRef(null);
  const previewUrlRef = useRef(null);
  const queryIdRef = useRef(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  const onCancelRef = useRef(onCancel);

  // Keep onCancelRef.current up to date without re-running the cancel
  // callback identity. (Callers may pass a fresh closure each render.)
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // Mount/unmount lifecycle: revoke any outstanding blob URL, abort any
  // in-flight request, and flip the mountedRef so post-await setStates
  // become no-ops.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  // search(file?, page?) — the workhorse.
  // - When called with a new File, it replaces the stored file/preview.
  // - When called without a file (e.g. from goToPage), it re-uses the
  //   ref-stored file for pagination.
  // - Always aborts any prior in-flight request before issuing a new one.
  // - Never resets state to 'idle' on its own — only `cancel()` does that.
  const search = useCallback(async (newFile, page = 1) => {
    const targetFile = newFile ?? fileRef.current;
    if (!targetFile) return;

    // If this call brought a new File, swap it in and rebuild the preview.
    // Revoke the previous blob URL FIRST to avoid leaking memory.
    if (newFile && newFile !== fileRef.current) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const nextPreview = URL.createObjectURL(newFile);
      fileRef.current = newFile;
      previewUrlRef.current = nextPreview;
      setFile(newFile);
      setPreviewUrl(nextPreview);
    }

    // Abort any prior in-flight request. This is also the path that
    // services "user picks a new image while we're still searching".
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('searching');
    setErrorMessage(null);

    try {
      const data = await visualSearchApi.search(targetFile, {
        page,
        perPage: PER_PAGE,
        signal: controller.signal,
      });

      // If a newer search superseded us (different controller), or the
      // component unmounted, drop the result on the floor.
      if (!mountedRef.current) return;
      if (abortRef.current !== controller) return;

      if (!data.service_available) {
        queryIdRef.current = null;
        setResults([]);
        setPagination(data.pagination ?? null);
        setErrorMessage(data.message || GENERIC_ERROR_AR);
        setStatus('service_unavailable');
        return;
      }

      queryIdRef.current = data.query_id ?? null;
      setResults(data.results || []);
      setPagination(data.pagination ?? null);
      setStatus('results');
    } catch (err) {
      // Aborts are expected — they happen when a newer search starts or
      // the component unmounts. They are not user-facing errors.
      if (err?.name === 'AbortError') return;
      if (!mountedRef.current) return;
      if (abortRef.current !== controller) return;

      setStatus('error');
      setErrorMessage(err?.body?.message ?? GENERIC_ERROR_AR);
    } finally {
      // Only clear the controller if we're still the active one.
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  // goToPage(n) — re-runs search() with the stored file at a new page.
  // Note: deliberately does not block when status !== 'results' — the
  // component layer enforces when the pagination control is visible.
  const goToPage = useCallback(async (page) => {
    if (!fileRef.current) return;
    await search(fileRef.current, page);
  }, [search]);

  // reset() — go back to the empty-state. Revokes the preview URL,
  // clears every state slice, but does NOT abort an in-flight request
  // (that's `cancel()`'s job; `reset()` is a UI affordance the user
  // hits from the results state, not while searching).
  const reset = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    fileRef.current = null;
    queryIdRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setResults([]);
    setPagination(null);
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  // cancel() — abort any in-flight request and reset to idle. Fires the
  // onCancel callback synchronously after state is cleared so consumers
  // can show a toast ("تم إلغاء البحث", etc.).
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    fileRef.current = null;
    queryIdRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setResults([]);
    setPagination(null);
    setErrorMessage(null);
    setStatus('idle');

    onCancelRef.current?.();
  }, []);

  // logClick(product, position, score) — fire-and-forget. Silently no-ops
  // if there's no active queryId (e.g. after reset()).
  const logClick = useCallback((product, position, score) => {
    const queryId = queryIdRef.current;
    if (!queryId || !product) return;
    visualSearchApi
      .logClick({
        query_id: queryId,
        product_id: product.id,
        result_position: position,
        similarity_score: score,
      })
      .catch(() => {
        // Intentional: analytics ping; never surface failures to the user.
      });
  }, []);

  return {
    file,
    previewUrl,
    status,
    results,
    pagination,
    errorMessage,
    search,
    goToPage,
    reset,
    cancel,
    logClick,
  };
}

export default useVisualSearch;
