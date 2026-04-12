import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Award,
  Clock,
  ArrowLeft
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import MiniBar from '../../components/ui/MiniBar.jsx';
import BarChartWrapper from '../../components/charts/BarChartWrapper.jsx';
import PieChartWrapper from '../../components/charts/PieChartWrapper.jsx';
import {
  monthlyRevenue,
  ordersByStatus,
  topProducts,
  recentActivities,
  mockOrders,
} from '../../data/mockData.js';
import { formatCurrency, formatDate, toArabicNum } from '../../utils/formatters.js';
import { COLORS } from '../../constants/colors.js';
import styles from './Dashboard.module.css';

const ORDER_STATUS_VARIANT = {
  'مكتمل':       'success',
  'قيد التجهيز': 'info',
  'تم الشحن':    'purple',
  'جديد':        'warning',
  'ملغي':        'danger',
  'مرتجع':       'default',
};

const ACTIVITY_ACTION_VARIANT = {
  'إضافة':        'success',
  'تعديل':        'info',
  'حذف':          'danger',
  'تسجيل دخول':  'default',
  'تحديث حالة':  'warning',
};

const recentOrderHeaders = [
  { key: 'orderNumber', label: 'معرف الطلبية' },
  { key: 'store',       label: 'رواق المتجر' },
  { key: 'customer',    label: 'المقتني' },
  {
    key: 'productsCount',
    label: 'المقتنيات',
    render: (val) => `${toArabicNum(val)} مقتنى`,
  },
  {
    key: 'amount',
    label: 'القيمة الإجمالية',
    render: (val) => formatCurrency(val),
  },
  {
    key: 'status',
    label: 'مسار الطلب',
    render: (val) => (
      <Badge text={val} variant={ORDER_STATUS_VARIANT[val] || 'default'} />
    ),
  },
  {
    key: 'date',
    label: 'تاريخ الاقتناء',
    render: (val) => formatDate(val),
  },
];

export default function DashboardPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      {/* Top Stats Row */}
      <section className={styles.statsRow} aria-label="إحصائيات عامة">
        <div className="stagger-1">
          <StatCard
            icon={DollarSign}
            label="إجمالي العوائد الملكية"
            value="١٢٥,٤٣٠ $"
            color="green"
            subtitle="خلال الشهر الحالي"
          />
        </div>
        <div className="stagger-2">
          <StatCard
            icon={ShoppingCart}
            label="مجموع الطلبيات"
            value="٤٨٦"
            color="blue"
            subtitle="خلال الشهر الحالي"
          />
        </div>
        <div className="stagger-3">
          <StatCard
            icon={Users}
            label="إجمالي رواد المنصة"
            value="١,٢٤٥"
            color="gold"
            subtitle="عضوية نشطة"
          />
        </div>
        <div className="stagger-4">
          <StatCard
            icon={Store}
            label="الأروقة النشطة"
            value="٣"
            color="orange"
            subtitle="من أصل ٤ دور عرض"
          />
        </div>
      </section>

      {/* Row 2: Revenue Chart + Top Products */}
      <div className={styles.row2}>
        <section className={styles.chartCard} aria-label="بيان العوائد">
          <BarChartWrapper
            data={monthlyRevenue}
            xKey="name"
            yKey="value"
            color={COLORS.gold}
            title="بيان العوائد الشهري"
            height={280}
            formatValue={(v) => `${Math.round(v / 1000)}k`}
          />
        </section>

        <section className={styles.topProductsCard} aria-label="المقتنيات الأكثر تفضيلاً">
          <header className={styles.cardHeader}>
            <Award size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>المقتنيات الأكثر تفضيلاً</h3>
          </header>
          <div className={styles.productsList}>
            {topProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                <span className={styles.productRank}>{toArabicNum(index + 1)}</span>
                <div className={styles.productBarWrapper}>
                  <MiniBar
                    label={product.name}
                    value={`${toArabicNum(product.sold)} عملية اقتناء`}
                    percentage={Math.round((product.sold / product.total) * 100)}
                    color={COLORS.gold}
                    height={6}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Row 3: Orders by Status + Recent Activities */}
      <div className={styles.row3}>
        <section className={styles.pieCard} aria-label="توزع الطلبيات">
          <PieChartWrapper
            data={ordersByStatus}
            title="توزع الطلبيات حسب المسار"
            height={280}
            donut
          />
        </section>

        <section className={styles.activitiesCard} aria-label="سجل النشاطات">
          <header className={styles.cardHeader}>
            <Clock size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>سجل النشاطات الأخير</h3>
          </header>
          <div className={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityMeta}>
                  <Badge
                    text={activity.action}
                    variant={ACTIVITY_ACTION_VARIANT[activity.action] || 'default'}
                    size="sm"
                  />
                  <span className={styles.activityUser}>{activity.user}</span>
                </div>
                <p className={styles.activityDetails}>{activity.details}</p>
              </div>
            ))}
          </div>
          <div className={styles.viewAllLink} role="button" tabIndex={0}>
            <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>مطالعة السجل الكامل</span>
          </div>
        </section>
      </div>

      {/* Row 4: Recent Orders Table */}
      <section className={styles.tableCard} aria-label="أحدث الطلبيات">
        <header className={styles.tableCardHeader}>
          <div className={styles.cardHeader}>
            <ShoppingCart size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} aria-hidden="true" />
            <h3 className={styles.cardTitle}>أحدث الطلبيات</h3>
          </div>
          <div className={styles.viewAllLink} role="button" tabIndex={0}>
            <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>عرض كافة الطلبيات</span>
          </div>
        </header>
        <DataTable
          headers={recentOrderHeaders}
          rows={mockOrders.slice(0, 5)}
        />
      </section>
    </div>
  );
}
