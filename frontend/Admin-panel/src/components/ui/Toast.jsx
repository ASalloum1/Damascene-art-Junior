import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Single Toast Item ─────────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const Icon = ICONS[type] || Info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on mount
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={[
        styles.toast,
        styles[`type-${type}`],
        visible ? styles.visible : styles.hidden,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} strokeWidth={1.8} className={styles.toastIcon} />
      <span className={styles.toastMessage}>{message}</span>
      <button
        type="button"
        onClick={handleDismiss}
        className={styles.dismissBtn}
        aria-label="إغلاق الإشعار"
      >
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, type = 'info', duration = 4000 }) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => {
        const updated = [...prev, { id, message, type }];
        return updated.slice(-5); // max 5 visible
      });
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const container =
    typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {container &&
        createPortal(
          <div className={styles.container} aria-label="الإشعارات">
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                id={t.id}
                message={t.message}
                type={t.type}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          container
        )}
    </ToastContext.Provider>
  );
}
