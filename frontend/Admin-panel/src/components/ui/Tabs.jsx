import { toArabicNum } from '../../utils/formatters.js';
import styles from './Tabs.module.css';

/**
 * Tabs — horizontal tab navigation
 *
 * @param {Array<{id, label, count?}>} tabs
 * @param {string} activeTab — currently active tab id
 * @param {function} onChange — (id) => void
 * @param {'pills'|'underline'} [variant='pills']
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
}) {
  return (
    <div
      className={[styles.container, styles[`variant-${variant}`]].join(' ')}
      role="tablist"
      aria-orientation="horizontal"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            className={[styles.tab, isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange?.(tab.id)}
            type="button"
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span className={[styles.count, isActive ? styles.countActive : ''].filter(Boolean).join(' ')}>
                {toArabicNum(tab.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
