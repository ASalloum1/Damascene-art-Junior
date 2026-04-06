import { useState } from 'react';
import { DollarSign, ShoppingCart, Users, Store, TrendingUp, Award, Clock, ArrowLeft } from 'lucide-react';
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
  { key: 'orderNumber', label: 'رقم الطلب' },
  { key: 'store',       label: 'المتجر' },
  { key: 'customer',    label: 'العميل' },
  {
    key: 'productsCount',
    label: 'المنتجات',
    render: (val) => `${toArabicNum(val)} منتج`,
  },
  {
    key: 'amount',
    label: 'المبلغ',
    render: (val) => formatCurrency(val),
  },
  {
    key: 'status',
    label: 'الحالة',
    render: (val) => (
      <Badge text={val} variant={ORDER_STATUS_VARIANT[val] || 'default'} />
    ),
  },
  {
    key: 'date',
    label: 'التاريخ',
    render: (val) => formatDate(val),
  },
];

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Top Stats Row */}
      <div className={styles.statsRow}>
        <StatCard
          icon={DollarSign}
          label="إجمالي الإيرادات"
          value="١٢٥,٤٣٠ $"
          color="green"
          subtitle="هذا الشهر"
        />
        <StatCard
          icon={ShoppingCart}
          label="إجمالي الطلبات"
          value="٤٨٦"
          color="blue"
          subtitle="هذا الشهر"
        />
        <StatCard
          icon={Users}
          label="إجمالي المستخدمين"
          value="١,٢٤٥"
          color="gold"
          subtitle="مسجلين"
        />
        <StatCard
          icon={Store}
          label="المتاجر النشطة"
          value="٣"
          color="orange"
          subtitle="من أصل ٤"
        />
      </div>

      {/* Row 2: Revenue Chart + Top Products */}
      <div className={styles.row2}>
        <div className={styles.chartCard}>
          <BarChartWrapper
            data={monthlyRevenue}
            xKey="name"
            yKey="value"
            color={COLORS.gold}
            title="الإيرادات الشهرية"
            height={280}
            formatValue={(v) => `${Math.round(v / 1000)}k`}
          />
        </div>

        <div className={styles.topProductsCard}>
          <div className={styles.cardHeader}>
            <Award size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} />
            <h3 className={styles.cardTitle}>المنتجات الأكثر مبيعاً</h3>
          </div>
          <div className={styles.productsList}>
            {topProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                <span className={styles.productRank}>{toArabicNum(index + 1)}</span>
                <div className={styles.productBarWrapper}>
                  <MiniBar
                    label={product.name}
                    value={`${toArabicNum(product.sold)} مبيعة`}
                    percentage={Math.round((product.sold / product.total) * 100)}
                    color={COLORS.gold}
                    height={6}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Orders by Status + Recent Activities */}
      <div className={styles.row3}>
        <div className={styles.pieCard}>
          <PieChartWrapper
            data={ordersByStatus}
            title="الطلبات حسب الحالة"
            height={280}
            donut
          />
        </div>

        <div className={styles.activitiesCard}>
          <div className={styles.cardHeader}>
            <Clock size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} />
            <h3 className={styles.cardTitle}>آخر النشاطات</h3>
          </div>
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
          <div className={styles.viewAllLink}>
            <ArrowLeft size={14} strokeWidth={1.8} />
            <span>عرض الكل</span>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <div className={styles.cardHeader}>
            <ShoppingCart size={18} strokeWidth={1.8} className={styles.cardHeaderIcon} />
            <h3 className={styles.cardTitle}>آخر الطلبات</h3>
          </div>
          <div className={styles.viewAllLink}>
            <ArrowLeft size={14} strokeWidth={1.8} />
            <span>عرض كل الطلبات</span>
          </div>
        </div>
        <DataTable
          headers={recentOrderHeaders}
          rows={mockOrders.slice(0, 5)}
        />
      </div>
    </div>
  );
}
