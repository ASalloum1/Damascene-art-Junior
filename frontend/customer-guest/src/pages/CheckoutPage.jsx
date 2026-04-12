import { MapPin, Truck, CreditCard } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { products } from '../data/index.js';
import styles from './CheckoutPage.module.css';

export function CheckoutPage({ onNavigate }) {
  const summaryItems = [
    { name: products[0].name, price: '١,٢٠٠', qty: 1 },
    { name: products[1].name, price: '٤٠٠', qty: 1 },
  ];

  return (
    <div className={styles.page}>
      <SectionHeader title="إتمام الطلب" />

      <div className={styles.grid}>
        {/* ── Left column ── */}
        <div>
          {/* 1. Shipping info */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <MapPin size={18} />
              معلومات الشحن
            </h3>
            <div className={styles.twoCol}>
              <InputField label="الاسم الأول" placeholder="أحمد" />
              <InputField label="اسم العائلة" placeholder="الشامي" />
            </div>
            <InputField label="العنوان" placeholder="الشارع والحي" />
            <div className={styles.twoCol}>
              <InputField label="المدينة" placeholder="دبي" />
              <InputField label="الرمز البريدي" placeholder="00000" />
            </div>
            <select className={styles.selectField} aria-label="الدولة">
              <option>سوريا</option>
              <option>لبنان</option>
              <option>الأردن</option>
              <option>الإمارات</option>
              <option>ألمانيا</option>
              <option>هولندا</option>
              <option>أخرى</option>
            </select>
            <InputField label="رقم الهاتف" placeholder="+971 XXX XXXX" type="tel" />
          </div>

          {/* 2. Shipping method */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <Truck size={18} />
              طريقة الشحن والتغليف
            </h3>
            <label className={styles.radioCard}>
              <input type="radio" name="shipping" defaultChecked />
              شحن عادي — ٣٥$ (٧-١٢ يوم)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="shipping" />
              شحن سريع — ٦٥$ (٣-٥ أيام)
            </label>
            <span className={styles.radioGroupLabel}>خيار التغليف:</span>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" defaultChecked />
              تغليف عادي (مجاني)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" />
              صندوق خشبي فاخر (+٢٠$)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" />
              تغليف هدايا مزخرف (+٣٠$)
            </label>
          </div>

          {/* 3. Payment */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <CreditCard size={18} />
              طريقة الدفع
            </h3>
            <label className={styles.radioCard}>
              <input type="radio" name="payment" defaultChecked />
              بطاقة ائتمان / Visa / MasterCard
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="payment" />
              PayPal
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="payment" />
              تحويل بنكي
            </label>
            <InputField
              label="ملاحظات على الطلب (اختياري)"
              textarea
              placeholder="مثلاً: قطعة هدية، يرجى تغليفها بعناية..."
            />
          </div>
        </div>

        {/* ── Right column ── */}
        <OrderSummary
          items={summaryItems}
          subtotal="١,٦٠٠"
          discount="١٦٠"
          shipping="٣٥"
          wrapping="٠"
          total="١,٤٧٥"
          actionLabel="تأكيد الطلب ✓"
          onAction={() => onNavigate?.('confirmation')}
        />
      </div>
    </div>
  );
}

export default CheckoutPage;
