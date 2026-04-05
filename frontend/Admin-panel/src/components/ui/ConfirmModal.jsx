import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import styles from './ConfirmModal.module.css';

/**
 * ConfirmModal — destructive action confirmation dialog
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title — e.g. "تأكيد الحذف"
 * @param {string} message — e.g. "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
 * @param {string} [confirmLabel='تأكيد']
 * @param {string} [cancelLabel='إلغاء']
 * @param {boolean} [danger=true] — confirm button is red
 * @param {boolean} [loading=false]
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = true,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.content}>
        <div className={[styles.iconWrapper, danger ? styles.iconDanger : styles.iconWarning].join(' ')}>
          <AlertTriangle size={28} strokeWidth={1.8} />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}
