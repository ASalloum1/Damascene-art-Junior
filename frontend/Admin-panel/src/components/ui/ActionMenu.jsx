import { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import styles from './ActionMenu.module.css';

/**
 * ActionMenu — three-dot dropdown for table row actions
 *
 * @param {Array<{label, icon, onClick, danger?, disabled?}>} actions
 */
export default function ActionMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={[styles.trigger, isOpen ? styles.triggerOpen : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="خيارات"
      >
        <MoreVertical size={18} strokeWidth={1.8} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                className={[
                  styles.action,
                  action.danger ? styles.actionDanger : '',
                  action.disabled ? styles.actionDisabled : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick?.();
                    setIsOpen(false);
                  }
                }}
              >
                {Icon && (
                  <Icon size={14} strokeWidth={1.8} className={styles.actionIcon} />
                )}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
