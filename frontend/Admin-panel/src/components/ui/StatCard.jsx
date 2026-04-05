import styles from './StatCard.module.css';

const COLOR_MAP = {
  green:  { icon: 'var(--color-green)',  bg: 'var(--color-green-bg)' },
  blue:   { icon: 'var(--color-blue)',   bg: 'var(--color-blue-bg)' },
  gold:   { icon: 'var(--color-gold)',   bg: 'var(--color-gold-bg)' },
  orange: { icon: 'var(--color-orange)', bg: 'var(--color-orange-bg)' },
  red:    { icon: 'var(--color-red)',    bg: 'var(--color-red-bg)' },
  purple: { icon: 'var(--color-purple)', bg: 'var(--color-purple-bg)' },
};

/**
 * StatCard — KPI card for dashboard and stats pages
 *
 * @param {React.ComponentType} icon — lucide icon component
 * @param {string} label — Arabic label
 * @param {string} value — formatted value (Arabic numerals)
 * @param {'green'|'blue'|'gold'|'orange'|'red'|'purple'} color
 * @param {string} [subtitle] — small text below value
 * @param {string} [trend] — optional trend indicator e.g. "+١٢%"
 * @param {boolean} [trendUp] — true=green, false=red
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  color = 'gold',
  subtitle,
  trend,
  trendUp,
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.gold;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div
          className={styles.iconCircle}
          style={{
            backgroundColor: colors.bg,
            color: colors.icon,
          }}
        >
          <Icon size={24} strokeWidth={1.8} />
        </div>

        {trend !== undefined && (
          <span
            className={[
              styles.trend,
              trendUp === true
                ? styles.trendUp
                : trendUp === false
                ? styles.trendDown
                : styles.trendNeutral,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {trend}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}
