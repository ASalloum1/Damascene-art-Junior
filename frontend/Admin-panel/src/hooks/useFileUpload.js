import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useFileUpload — generic multi-file upload state machine.
 *
 * Single source of truth: the API client owns the actual transport (XHR vs fetch).
 * This hook owns:
 *   - tempId mapping for each upload batch / file
 *   - the `uploads` reducer keyed by tempId
 *   - AbortController lifecycle (one per batch)
 *   - translating onProgress({percent}) callbacks into setUploads writes
 *
 * The API contract: apiClient.upload(productId, files, { onProgress, signal })
 *   - onProgress is called with { percent: 0..100 } (single batch-level number;
 *     a single multipart POST gives only batch-level progress, by design — see
 *     spec §4.2 trade-off note).
 *   - signal is an AbortSignal that the client honors for cancellation.
 *
 * @param {object}   opts
 * @param {*}        opts.productId   passed through to apiClient.upload
 * @param {object}   opts.apiClient   { upload(productId, files, { onProgress, signal }) }
 * @param {function} [opts.onSuccess] (uploadedImages) => void
 * @param {function} [opts.onError]   (error) => void
 *
 * @returns {{
 *   upload: (files: File[]) => Promise<ProductImage[]>,
 *   uploads: Record<string, { fileName, progress, status, error? }>,
 *   cancelUpload: (tempId: string) => void
 * }}
 */
export function useFileUpload({ productId, apiClient, onSuccess, onError }) {
  const [uploads, setUploads] = useState({});
  // Track active controllers so cancelUpload can abort & cleanup on unmount.
  const controllersRef = useRef(new Map());

  // Cleanup any outstanding controllers if the component unmounts mid-upload.
  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((ctrl) => {
        try {
          ctrl.abort();
        } catch {
          /* noop */
        }
      });
      controllers.clear();
    };
  }, []);

  const upload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return [];

      // Single tempId per batch — spec §4.2 / brief: per-batch progress, not per-file.
      const tempId = `upl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const fileName = files.map((f) => f.name).join('، ');
      const controller = new AbortController();
      controllersRef.current.set(tempId, controller);

      setUploads((prev) => ({
        ...prev,
        [tempId]: {
          fileName,
          progress: 0,
          status: 'uploading',
        },
      }));

      try {
        const result = await apiClient.upload(productId, files, {
          signal: controller.signal,
          onProgress: ({ percent }) => {
            // Functional update so concurrent batches don't clobber each other.
            setUploads((prev) => {
              const current = prev[tempId];
              if (!current || current.status !== 'uploading') return prev;
              const next = Math.max(current.progress, Math.min(100, Math.round(percent)));
              if (next === current.progress) return prev;
              return { ...prev, [tempId]: { ...current, progress: next } };
            });
          },
        });

        setUploads((prev) => {
          const current = prev[tempId];
          if (!current) return prev;
          return {
            ...prev,
            [tempId]: { ...current, progress: 100, status: 'done' },
          };
        });

        // Auto-clear the row after the success animation has had time to play.
        setTimeout(() => {
          setUploads((prev) => {
            if (!prev[tempId]) return prev;
            const { [tempId]: _removed, ...rest } = prev;
            return rest;
          });
        }, 1200);

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const aborted = err?.name === 'AbortError' || controller.signal.aborted;
        setUploads((prev) => {
          const current = prev[tempId];
          if (!current) return prev;
          return {
            ...prev,
            [tempId]: {
              ...current,
              status: aborted ? 'cancelled' : 'error',
              error: aborted ? null : err?.message || 'فشل رفع الصور',
            },
          };
        });
        if (!aborted && onError) onError(err);
        // Re-throw so the caller (component) can react (toast etc).
        throw err;
      } finally {
        controllersRef.current.delete(tempId);
      }
    },
    [productId, apiClient, onSuccess, onError],
  );

  const cancelUpload = useCallback((tempId) => {
    const ctrl = controllersRef.current.get(tempId);
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {
        /* noop */
      }
    }
  }, []);

  return { upload, uploads, cancelUpload };
}
