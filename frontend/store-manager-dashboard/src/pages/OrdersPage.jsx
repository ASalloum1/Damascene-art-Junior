import { useState } from 'react';
import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { Eye, Pencil } from 'lucide-react';

const tabs = [
  { id: 'all',       label: 'الكل',       count: 156 },
  { id: 'new',       label: 'جديد',       count: 12  },
  { id: 'preparing', label: 'قيد التجهيز', count: 8   },
  { id: 'shipped',   label: 'تم الشحن',   count: 15  },
  { id: 'completed', label: 'مكتمل',      count: 110 },
  { id: 'cancelled', label: 'ملغي',       count: 6   },
  { id: 'returned',  label: 'مرتجع',      count: 5   },
];

const orderRows = [
  [
    '#1084', 'أحمد الشامي', '٢ منتجات', '١,٢٠٠ $', 'بطاقة ائتمان',
    <Badge key="b1" text="جديد" variant="info" />,
    '٠٣/٠٤/٢٠٢٦',
    <span key="a1" style={{ display: 'flex', gap: 8 }}>
      <Eye size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
      <Pencil size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
    </span>,
  ],
  [
    '#1083', 'سارة مولر', '١ منتج', '٤٠٠ $', 'PayPal',
    <Badge key="b2" text="قيد التجهيز" variant="warning" />,
    '٠٢/٠٤/٢٠٢٦',
    <span key="a2" style={{ display: 'flex', gap: 8 }}>
      <Eye size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
      <Pencil size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
    </span>,
  ],
  [
    '#1082', 'جون سميث', '٣ منتجات', '٩٥٠ $', 'تحويل بنكي',
    <Badge key="b3" text="تم الشحن" variant="success" />,
    '٠١/٠٤/٢٠٢٦',
    <span key="a3" style={{ display: 'flex', gap: 8 }}>
      <Eye size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
      <Pencil size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
    </span>,
  ],
  [
    '#1081', 'ليلى حسن', '١ منتج', '١٥٠ $', 'بطاقة ائتمان',
    <Badge key="b4" text="مكتمل" variant="neutral" />,
    '٣٠/٠٣/٢٠٢٦',
    <span key="a4" style={{ display: 'flex', gap: 8 }}>
      <Eye size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
    </span>,
  ],
  [
    '#1080', 'ماركو روسي', '٢ منتجات', '٧٠٠ $', 'PayPal',
    <Badge key="b5" text="ملغي" variant="error" />,
    '٢٩/٠٣/٢٠٢٦',
    <span key="a5" style={{ display: 'flex', gap: 8 }}>
      <Eye size={16} style={{ cursor: 'pointer', color: 'var(--color-stone-mid)' }} />
    </span>,
  ],
];

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="إدارة الطلبات" />
      <div className={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      <PageCard>
        <Table
          headers={['رقم الطلب', 'العميل', 'المنتجات', 'المبلغ', 'طريقة الدفع', 'الحالة', 'تاريخ الطلب', 'إجراءات']}
          rows={orderRows}
          emptyTitle="هدوء في سجلات الطلبات"
          emptyDesc="بانتظار أن يكتشف محبو التراث روائعكم. سيتم إدراج كل طلب جديد هنا بكل تفاصيله."
        />
      </PageCard>
    </div>
  );
}

export default OrdersPage;
