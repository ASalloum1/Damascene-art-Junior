import { useState, useEffect } from 'react';
import { MapPin, Trash2, Plus } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './AddressesPage.module.css';

const emptyForm = { country: '', street: '', city: '', zip_code: '' };

export function AddressesPage() {
  const { baseUrl, bearerToken } = useApi();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/api/customers/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `خطأ: ${response.status}`);
      }
      setAddresses(data?.data?.addresses ?? []);
    } catch (err) {
      setError(err.message || 'فشل تحميل العناوين');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.country.trim() || !form.street.trim() || !form.city.trim() || !form.zip_code.trim()) {
      setFormError('جميع الحقول مطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${baseUrl}/api/customers/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `خطأ: ${response.status}`);
      }
      const created = data?.data?.address;
      if (created) {
        setAddresses((prev) => [...prev, created]);
      } else {
        fetchAddresses();
      }
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.message || 'فشل إضافة العنوان');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    setDeletingId(addressId);
    try {
      const response = await fetch(`${baseUrl}/api/customers/addresses/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ address_id: addressId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `خطأ: ${response.status}`);
      }
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      setError(err.message || 'فشل حذف العنوان');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader title="عناويني" subtitle="إدارة عناوين التوصيل" />

      {/* ── Address list ── */}
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>
          <MapPin size={18} />
          العناوين المحفوظة
        </h3>

        {isLoading ? (
          <p className={styles.stateMsg}>جاري تحميل العناوين...</p>
        ) : error ? (
          <p className={styles.errorMsg}>{error}</p>
        ) : addresses.length === 0 ? (
          <p className={styles.stateMsg}>لا توجد عناوين محفوظة بعد.</p>
        ) : (
          <ul className={styles.list}>
            {addresses.map((address) => (
              <li key={address.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>البلد:</span>
                    <span className={styles.itemValue}>{address.country}</span>
                  </div>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>المدينة:</span>
                    <span className={styles.itemValue}>{address.city}</span>
                  </div>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>الشارع:</span>
                    <span className={styles.itemValue}>{address.street}</span>
                  </div>
                  <div className={styles.itemRow}>
                    <span className={styles.itemLabel}>الرمز البريدي:</span>
                    <span className={styles.itemValue}>{address.zip_code}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  aria-label="حذف العنوان"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Add address form ── */}
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>
          <Plus size={18} />
          إضافة عنوان جديد
        </h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.twoCol}>
            <InputField
              label="البلد"
              name="country"
              placeholder="Syria"
              value={form.country}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <InputField
              label="المدينة"
              name="city"
              placeholder="Damascus"
              value={form.city}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <InputField
              label="الشارع"
              name="street"
              placeholder="Al Hamra Street"
              value={form.street}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <InputField
              label="الرمز البريدي"
              name="zip_code"
              placeholder="12345"
              value={form.zip_code}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {formError ? <p className={styles.errorMsg}>{formError}</p> : null}

          <Button
            variant="primary"
            type="submit"
            icon={<Plus size={16} />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة العنوان'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AddressesPage;
