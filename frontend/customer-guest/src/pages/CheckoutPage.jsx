import { useState, useEffect, useMemo } from 'react';
import { MapPin, Truck, CreditCard, Plus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { products } from '../data/index.js';
import styles from './CheckoutPage.module.css';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const formatAddressLabel = (addr) => `${addr.street}, ${addr.city}, ${addr.country}`;

function StripePaymentForm({ totalLabel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setConfirmError('');
    setIsPaying(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?confirmation=1`,
        },
      });
      if (error) {
        setConfirmError(error.message || 'تعذّر إتمام الدفع. يُرجى التحقق من بيانات البطاقة.');
      }
    } catch {
      setConfirmError('حدث خطأ غير متوقع أثناء الدفع.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <PaymentElement />
      {confirmError ? (
        <p className={styles.errorMsg} role="alert" aria-live="polite">{confirmError}</p>
      ) : null}
      <Button
        variant="primary"
        full
        onClick={handleConfirm}
        disabled={!stripe || !elements || isPaying}
        ariaLabel="تأكيد الدفع"
      >
        {isPaying ? 'جارٍ تنفيذ الدفع…' : `تأكيد الدفع — ${totalLabel}`}
      </Button>
    </>
  );
}

export function CheckoutPage() {
  const { baseUrl, bearerToken } = useApi();
  const [addresses, setAddresses] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const ADD_NEW_OPTION = '+ إضافة عنوان جديد';
  const emptyAddressForm = { street: '', city: '', zip_code: '', country: '' };
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [formError, setFormError] = useState('');
  const [shippingSpeed, setShippingSpeed] = useState('normal');
  const [clientSecret, setClientSecret] = useState('');
  // eslint-disable-next-line no-unused-vars -- retained for future order-status polling / support UI
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const summaryItems = [
    { name: products[0].name, price: '١,٢٠٠', qty: 1 },
    { name: products[1].name, price: '٤٠٠', qty: 1 },
  ];

  const elementsOptions = useMemo(() => ({
    clientSecret,
    locale: 'ar',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#C8A45A',
        fontFamily: 'Tajawal, system-ui, sans-serif',
      },
    },
  }), [clientSecret]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAddresses(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async (signal) => {
    setIsLoadingAddresses(true);
    setLoadError('');
    try {
      const response = await fetch(`${baseUrl}/api/customers/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${bearerToken}`,
        },
        signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `خطأ: ${response.status}`);
      }
      const list = data?.data?.addresses ?? [];
      setAddresses(list);
      if (list.length) {
        setSelectedValue(formatAddressLabel(list[0]));
        setShowAddForm(false);
      } else {
        setSelectedValue(ADD_NEW_OPTION);
        setShowAddForm(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setLoadError('تعذّر تحميل العناوين');
    } finally {
      if (!signal?.aborted) {
        setIsLoadingAddresses(false);
      }
    }
  };

  const handleAddressSelect = (e) => {
    const v = e.target.value;
    setSelectedValue(v);
    setShowAddForm(v === ADD_NEW_OPTION);
    if (v !== ADD_NEW_OPTION) setFormError('');
  };

  const handleFieldChange = (e) =>
    setAddressForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddAddress = async (e) => {
    e.preventDefault?.();
    setFormError('');
    const { street, city, zip_code, country } = addressForm;
    if (!street.trim() || !city.trim() || !zip_code.trim() || !country.trim()) {
      setFormError('جميع الحقول مطلوبة');
      return;
    }
    setIsSubmittingAddress(true);
    try {
      const res = await fetch(`${baseUrl}/api/customers/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ street, city, zip_code, country }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `خطأ: ${res.status}`);
      const created = data?.data?.address;
      if (created) {
        setAddresses((prev) => [...prev, created]);
        setSelectedValue(formatAddressLabel(created));
      } else {
        // Fallback: re-fetch and select last entry
        const r = await fetch(`${baseUrl}/api/customers/addresses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${bearerToken}`,
          },
        });
        const d = await r.json().catch(() => ({}));
        const list = d?.data?.addresses ?? [];
        setAddresses(list);
        if (list.length) setSelectedValue(formatAddressLabel(list[list.length - 1]));
      }
      setAddressForm(emptyAddressForm);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message || 'فشل إضافة العنوان');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const requestClientSecret = async () => {
    setPaymentError('');
    if (!stripePromise) {
      setPaymentError('تعذّر تحميل وسيلة الدفع. يُرجى المحاولة لاحقاً.');
      return;
    }
    const selectedAddress = addresses.find((a) => formatAddressLabel(a) === selectedValue);
    if (!selectedAddress) {
      setPaymentError('يُرجى اختيار عنوان توصيل قبل المتابعة');
      return;
    }
    setIsPreparingPayment(true);
    try {
      const res = await fetch(`${baseUrl}/api/customers/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          shipping_speed: shippingSpeed,
          secondary_phone: secondaryPhone || null,
          address_id_or_label: selectedAddress.id ?? formatAddressLabel(selectedAddress),
          order_notes: orderNotes || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'تعذّر تحضير عملية الدفع');
      }
      const secret = data?.data?.client_secret;
      const intentId = data?.data?.payment_intent_id;
      if (!secret) throw new Error('استجابة الخادم غير مكتملة');
      setClientSecret(secret);
      setPaymentIntentId(intentId || '');
    } catch (err) {
      setPaymentError(err.message || 'تعذّر تحضير عملية الدفع. يُرجى المحاولة لاحقاً.');
    } finally {
      setIsPreparingPayment(false);
    }
  };

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

            {isLoadingAddresses ? (
              <p className={styles.stateMsg}>جاري تحميل العناوين...</p>
            ) : loadError ? (
              <p className={styles.errorMsg} role="alert" aria-live="polite">{loadError}</p>
            ) : (
              <>
                <InputField
                  label="عنوان التوصيل"
                  select
                  name="address_choice"
                  value={selectedValue}
                  onChange={handleAddressSelect}
                  options={[...addresses.map(formatAddressLabel), ADD_NEW_OPTION]}
                />

                {showAddForm ? (
                  <div className={styles.inlineForm}>
                    <div className={styles.twoCol}>
                      <InputField
                        label="الشارع"
                        name="street"
                        placeholder="Al Hamra Street"
                        value={addressForm.street}
                        onChange={handleFieldChange}
                        disabled={isSubmittingAddress}
                      />
                      <InputField
                        label="المدينة"
                        name="city"
                        placeholder="Damascus"
                        value={addressForm.city}
                        onChange={handleFieldChange}
                        disabled={isSubmittingAddress}
                      />
                      <InputField
                        label="الرمز البريدي"
                        name="zip_code"
                        placeholder="12345"
                        value={addressForm.zip_code}
                        onChange={handleFieldChange}
                        disabled={isSubmittingAddress}
                      />
                      <InputField
                        label="البلد"
                        name="country"
                        placeholder="Syria"
                        value={addressForm.country}
                        onChange={handleFieldChange}
                        disabled={isSubmittingAddress}
                      />
                    </div>
                    <InputField
                      label="رقم هاتف ثانوي (اختياري)"
                      name="secondary_phone"
                      type="tel"
                      placeholder="+971 XXX XXXX"
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                      disabled={isSubmittingAddress}
                    />
                    {formError ? (
                      <p className={styles.errorMsg} role="alert" aria-live="polite">{formError}</p>
                    ) : null}
                    <Button
                      variant="primary"
                      type="button"
                      icon={<Plus size={16} />}
                      onClick={handleAddAddress}
                      disabled={isSubmittingAddress}
                    >
                      {isSubmittingAddress ? 'جاري الحفظ...' : 'حفظ العنوان'}
                    </Button>
                  </div>
                ) : (
                  <InputField
                    label="رقم هاتف ثانوي (اختياري)"
                    name="secondary_phone"
                    type="tel"
                    placeholder="+971 XXX XXXX"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                  />
                )}
              </>
            )}
          </div>

          {/* 2. Shipping method */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>
              <Truck size={18} />
              طريقة الشحن
            </h3>
            <label className={styles.radioCard}>
              <input
                type="radio"
                name="shipping"
                value="normal"
                checked={shippingSpeed === 'normal'}
                onChange={() => setShippingSpeed('normal')}
              />
              شحن عادي — ٣٥$ (٧-١٢ يوم)
            </label>
            <label className={styles.radioCard}>
              <input
                type="radio"
                name="shipping"
                value="fast"
                checked={shippingSpeed === 'fast'}
                onChange={() => setShippingSpeed('fast')}
              />
              شحن سريع — ٦٥$ (٣-٥ أيام)
            </label>
          </div>

          {/* 3. Payment */}
          {/* TODO(#2B): replaced by Stripe Elements */}
          <section data-stripe-mount-target className={styles.card}>
            <h3 className={styles.cardHeading}>
              <CreditCard size={18} />
              طريقة الدفع
            </h3>

            {!clientSecret ? (
              <>
                <p className={styles.stateMsg}>
                  ستتم معالجة الدفع عبر Stripe بشكل آمن. اضغط على المتابعة لتحضير وسيلة الدفع.
                </p>
                <InputField
                  label="ملاحظات على الطلب (اختياري)"
                  textarea
                  name="order_notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="مثلاً: قطعة هدية، يرجى تغليفها بعناية..."
                />
                {paymentError ? (
                  <p className={styles.errorMsg} role="alert" aria-live="polite">{paymentError}</p>
                ) : null}
                <Button
                  variant="primary"
                  onClick={requestClientSecret}
                  disabled={isPreparingPayment || !stripePromise}
                >
                  {isPreparingPayment ? 'جاري تحضير وسيلة الدفع…' : 'متابعة إلى الدفع'}
                </Button>
              </>
            ) : (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <StripePaymentForm totalLabel="$ ١,٤٧٥" />
              </Elements>
            )}
          </section>
        </div>

        {/* ── Right column ── */}
        <OrderSummary
          items={summaryItems}
          subtotal="١,٦٠٠"
          discount="١٦٠"
          shipping="٣٥"
          wrapping="٠"
          total="١,٤٧٥"
        />
      </div>
    </div>
  );
}

export default CheckoutPage;
