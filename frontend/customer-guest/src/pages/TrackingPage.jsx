import { useEffect, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { TrackingStep } from '../components/TrackingStep.jsx';
import { useApi } from '../context/ApiContext.jsx';
import { getAuthHeaders, readJsonSafely } from '../utils/customerApi.js';
import styles from './TrackingPage.module.css';

export function TrackingPage() {
  const { baseUrl, bearerToken, endpoints, selectedOrderId } = useApi();
  const [order, setOrder] = useState(null);
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTracking() {
      if (!selectedOrderId) {
        setError('لا يوجد طلب محدد للتتبع');
        return;
      }

      try {
        const response = await fetch(`${baseUrl}${endpoints.orderTracking(selectedOrderId)}`, {
          method: 'GET',
          headers: getAuthHeaders(bearerToken),
        });
        const data = await readJsonSafely(response);

        if (!response.ok) {
          throw new Error(data.message || 'فشل تحميل حالة الطلب');
        }

        setOrder(data?.data?.order || null);
        setTrackingSteps(data?.data?.order?.tracking_steps || []);
      } catch (trackingError) {
        setError(trackingError.message || 'تعذر تحميل التتبع');
      }
    }

    loadTracking();
  }, [baseUrl, bearerToken, endpoints, selectedOrderId]);

  return (
    <div className={styles.container}>
      <SectionHeader title="تتبع الطلب" subtitle={`رقم الطلب: ${order?.order_number || '—'}`} />
      <div className={styles.card}>
        {error ? <p style={{ color: 'var(--color-red)' }}>{error}</p> : null}
        {trackingSteps.map((step, i, arr) => (
          <TrackingStep
            key={step.key || i}
            label={step.label}
            date={step.date ? step.date.slice(0, 16).replace('T', ' ') : ''}
            stepNumber={i + 1}
            status={step.state === 'completed' ? 'done' : step.state === 'current' ? 'active' : 'pending'}
            isLast={i === arr.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default TrackingPage;
