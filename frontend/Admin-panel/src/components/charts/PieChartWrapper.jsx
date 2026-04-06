import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORS } from '../../constants/colors.js';
import styles from './PieChartWrapper.module.css';

/**
 * PieChartWrapper — Recharts PieChart with optional donut style
 *
 * @param {Array<{name, value, color?}>} data
 * @param {string} [title]
 * @param {number} [height=300]
 * @param {boolean} [donut=true]
 * @param {boolean} [showLegend=true]
 */

const DEFAULT_COLORS = [
  COLORS.gold,
  COLORS.blue,
  COLORS.green,
  COLORS.orange,
  COLORS.purple,
  COLORS.red,
];

function CustomLegend({ payload }) {
  return (
    <ul className={styles.legend}>
      {payload.map((entry, index) => (
        <li key={index} className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.legendLabel}>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PieChartWrapper({
  data = [],
  title,
  height = 300,
  donut = true,
  showLegend = true,
}) {
  return (
    <div className={styles.wrapper}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? '55%' : 0}
            outerRadius="85%"
            dataKey="value"
            paddingAngle={donut ? 3 : 0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.creamDark}`,
              borderRadius: '8px',
              fontFamily: 'Tajawal',
              fontSize: '13px',
              direction: 'rtl',
            }}
          />
          {showLegend && (
            <Legend
              content={<CustomLegend />}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
