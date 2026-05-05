import { useEffect, useMemo, useState } from 'react';
import { MapPin, Truck, CreditCard } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { getAuthHeaders, readJsonSafely } from '../utils/customerApi.js';
import styles from './CheckoutPage.module.css';

export function CheckoutPage({ onNavigate }) {
  const {
    baseUrl,
    bearerToken,
    currentUser,
    endpoints,
    cartSummary,
    refreshCartSummary,
    setLatestPlacedOrder,
    setSelectedOrderId,
  } = useApi();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [form, setForm] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    country: 'Syria',
    street: '',
    city: '',
    zip_code: '',
    phone: currentUser?.phone || '',
    shipping_type: 'standard',
    wrapping_type: 'standard',
    payment_method: 'bank_transfer',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const response = await fetch(`${baseUrl}${endpoints.addresses}`, {
          method: 'GET',
          headers: getAuthHeaders(bearerToken),
        });
        const data = await readJsonSafely(response);

        if (!response.ok) {
          throw new Error(data.message || 'فشل تحميل العناوين');
        }

        const loadedAddresses = data?.data?.addresses || [];
        setAddresses(loadedAddresses);

        if (loadedAddresses.length > 0) {
          const firstAddress = loadedAddresses[0];
          setSelectedAddressId(String(firstAddress.id));
          setForm((prev) => ({
            ...prev,
            country: firstAddress.country || prev.country,
            street: firstAddress.street || '',
            city: firstAddress.city || '',
            zip_code: firstAddress.zip_code || '',
          }));
        }
      } catch (loadError) {
        console.error(loadError);
      }
    }

    if (bearerToken) {
      loadCheckoutData();
      refreshCartSummary();
    }
  }, [baseUrl, bearerToken, endpoints.addresses, refreshCartSummary]);

  const summaryItems = useMemo(
    () => (cartSummary.product_carts || []).map((item) => ({
      name: item.product?.name || `منتج #${item.product_id}`,
      unitPrice: item.count > 0 ? (parseFloat(item.sum_price || 0) / item.count).toFixed(2) : '0.00',
      qty: item.count,
      subtotal: parseFloat(item.sum_price || 0).toFixed(2),
    })),
    [cartSummary.product_carts]
  );

  const handleSubmitOrder = async () => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}${endpoints.checkout}`, {
        method: 'POST',
        headers: getAuthHeaders(bearerToken),
        body: JSON.stringify({
          ...form,
          address_id: selectedAddressId ? Number(selectedAddressId) : undefined,
        }),
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || 'فشل إتمام الطلب');
      }

      const placedOrder = data?.data?.order;
      setLatestPlacedOrder(placedOrder || null);
      setSelectedOrderId(placedOrder?.id || null);
      setMessage('تم تأكيد الطلب بنجاح');
      await refreshCartSummary();
      onNavigate?.('confirmation');
    } catch (submitError) {
      setError(submitError.message || 'تعذر إتمام الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader title="إتمام الطلب" />
      {error ? <div className={styles.card} style={{ color: 'var(--color-red)' }}>{error}</div> : null}
      {message ? <div className={styles.card} style={{ color: 'var(--color-green)' }}>{message}</div> : null}

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
              <InputField label="الاسم الأول" value={form.first_name} onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))} />
              <InputField label="اسم العائلة" value={form.last_name} onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))} />
            </div>
            <InputField label="العنوان" value={form.street} onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))} />
            <div className={styles.twoCol}>
              <InputField label="المدينة" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
              <InputField label="الرمز البريدي" value={form.zip_code} onChange={(e) => setForm((prev) => ({ ...prev, zip_code: e.target.value }))} />
            </div>
            <select className={styles.selectField} aria-label="الدولة" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}>
              <option value="Syria">سوريا</option>
              <option value="Lebanon">لبنان</option>
              <option value="Jordan">الأردن</option>
              <option value="UAE">الإمارات</option>
              <option value="Germany">ألمانيا</option>
              <option value="Netherlands">هولندا</option>
              <option value="Other">أخرى</option>
            </select>
            {addresses.length > 0 ? (
              <select className={styles.selectField} aria-label="العنوان المحفوظ" value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.country} - {address.city} - {address.street}
                  </option>
                ))}
              </select>
            ) : null}
            <InputField label="رقم الهاتف" type="tel" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </div>

          {/* 2. Shipping method */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <Truck size={18} />
              طريقة الشحن والتغليف
            </h3>
            <label className={styles.radioCard}>
              <input type="radio" name="shipping" checked={form.shipping_type === 'standard'} onChange={() => setForm((prev) => ({ ...prev, shipping_type: 'standard' }))} />
              شحن عادي — ٣٥$ (٧-١٢ يوم)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="shipping" checked={form.shipping_type === 'express'} onChange={() => setForm((prev) => ({ ...prev, shipping_type: 'express' }))} />
              شحن سريع — ٦٥$ (٣-٥ أيام)
            </label>
            <span className={styles.radioGroupLabel}>خيار التغليف:</span>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" checked={form.wrapping_type === 'standard'} onChange={() => setForm((prev) => ({ ...prev, wrapping_type: 'standard' }))} />
              تغليف عادي (مجاني)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" checked={form.wrapping_type === 'wooden_box'} onChange={() => setForm((prev) => ({ ...prev, wrapping_type: 'wooden_box' }))} />
              صندوق خشبي فاخر (+٢٠$)
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="wrapping" checked={form.wrapping_type === 'gift'} onChange={() => setForm((prev) => ({ ...prev, wrapping_type: 'gift' }))} />
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
              <input type="radio" name="payment" checked={form.payment_method === 'credit_card'} onChange={() => setForm((prev) => ({ ...prev, payment_method: 'credit_card' }))} />
              بطاقة ائتمان / Visa / MasterCard
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="payment" checked={form.payment_method === 'paypal'} onChange={() => setForm((prev) => ({ ...prev, payment_method: 'paypal' }))} />
              PayPal
            </label>
            <label className={styles.radioCard}>
              <input type="radio" name="payment" checked={form.payment_method === 'bank_transfer'} onChange={() => setForm((prev) => ({ ...prev, payment_method: 'bank_transfer' }))} />
              تحويل بنكي
            </label>
            <InputField
              label="ملاحظات على الطلب (اختياري)"
              textarea
              placeholder="مثلاً: قطعة هدية، يرجى تغليفها بعناية..."
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </div>
        </div>

        {/* ── Right column ── */}
        <OrderSummary
          items={summaryItems}
          totalItems={cartSummary.count || cartSummary.items_count}
          subtotal={Number(cartSummary.subtotal || 0).toFixed(2)}
          discount={Number(cartSummary.discount || 0) > 0 ? Number(cartSummary.discount || 0).toFixed(2) : undefined}
          shipping={Number(cartSummary.shipping_cost || 0).toFixed(2)}
          wrapping={Number(cartSummary.wrapping_cost || 0).toFixed(2)}
          total={Number(cartSummary.total || 0).toFixed(2)}
          actionLabel={isSubmitting ? 'جاري التأكيد...' : 'تأكيد الطلب ✓'}
          onAction={handleSubmitOrder}
        />
      </div>
    </div>
  );
}

export default CheckoutPage;
