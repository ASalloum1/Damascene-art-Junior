import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORS } from '../../constants/colors.js';
import styles from './LineChartWrapper.module.css';

/**
 * LineChartWrapper — Recharts LineChart with multi-line support
 *
 * @param {Array<{name, ...}>} data
 * @param {Array<{key, color, label}>} lines
 * @param {string} [title]
 * @param {number} [height=300]
 * @param {boolean} [showDots=true]
 * @param {function} [formatValue]
 */
export default function LineChartWrapper({
  data = [],
  lines = [],
  title,
  height = 300,
  showDots = true,
  formatValue,
}) {
  return (
    <div className={styles.wrapper}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.creamDark}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: COLORS.textSecondary, fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={{ stroke: COLORS.creamDark }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fill: COLORS.textSecondary, fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.creamDark}`,
              borderRadius: '8px',
              fontFamily: 'Tajawal',
              fontSize: '13px',
              direction: 'rtl',
            }}
            formatter={
              formatValue
                ? (value, name) => [formatValue(value), name]
                : undefined
            }
          />
          {lines.length > 1 ? (
            <Legend
              wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px', direction: 'rtl' }}
            />
          ) : null}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color || COLORS.gold}
              strokeWidth={2}
              dot={showDots ? { r: 4, fill: line.color || COLORS.gold } : false}
              activeDot={{ r: 6 }}
              name={line.label || line.key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
