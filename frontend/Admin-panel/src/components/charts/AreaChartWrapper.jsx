import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORS } from '../../constants/colors.js';
import styles from './AreaChartWrapper.module.css';

/**
 * AreaChartWrapper — Recharts AreaChart with gradient fill support
 *
 * @param {Array<{name, ...}>} data
 * @param {Array<{key, color, label}>} areas
 * @param {string} [title]
 * @param {number} [height=300]
 * @param {function} [formatValue]
 */
export default function AreaChartWrapper({
  data = [],
  areas = [],
  title,
  height = 300,
  formatValue,
}) {
  return (
    <div className={styles.wrapper}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={`gradient-${area.key}`}
                id={`gradient-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={area.color || COLORS.gold}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={area.color || COLORS.gold}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
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
          {areas.length > 1 && (
            <Legend
              wrapperStyle={{ fontFamily: 'Tajawal', fontSize: '12px', direction: 'rtl' }}
            />
          )}
          {areas.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stroke={area.color || COLORS.gold}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${area.key})`}
              name={area.label || area.key}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
