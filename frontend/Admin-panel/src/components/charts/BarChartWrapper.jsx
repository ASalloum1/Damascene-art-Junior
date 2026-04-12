import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { COLORS } from '../../constants/colors.js';
import styles from './BarChartWrapper.module.css';

/**
 * BarChartWrapper — Recharts BarChart with Arabic-ready data
 *
 * @param {Array<{name, value, ...}>} data
 * @param {string} xKey — key for X axis
 * @param {string} yKey — key for bar height value
 * @param {string} [color] — bar fill color
 * @param {string} [title] — chart title
 * @param {number} [height=300]
 * @param {boolean} [showGrid=true]
 * @param {function} [formatValue] — y-axis tick formatter
 */
export default function BarChartWrapper({
  data = [],
  xKey = 'name',
  yKey = 'value',
  color = COLORS.gold,
  title,
  height = 300,
  showGrid = true,
  formatValue,
}) {
  return (
    <div className={styles.wrapper}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          barCategoryGap="30%"
        >
          {showGrid ? (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.creamDark}
              vertical={false}
            />
          ) : null}
          <XAxis
            dataKey={xKey}
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
            formatter={formatValue ? (value) => [formatValue(value)] : undefined}
          />
          <Bar
            dataKey={yKey}
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
