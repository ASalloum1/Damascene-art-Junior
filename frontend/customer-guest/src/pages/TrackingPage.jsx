import { SectionHeader } from '../components/SectionHeader.jsx';
import { TrackingStep } from '../components/TrackingStep.jsx';
import { trackingSteps } from '../data/index.js';
import styles from './TrackingPage.module.css';

export function TrackingPage() {
  return (
    <div className={styles.container}>
      <SectionHeader title="تتبع الطلب" subtitle="رقم الطلب: #1084" />
      <div className={styles.card}>
        {trackingSteps.map((step, i, arr) => (
          <TrackingStep
            key={i}
            label={step.label}
            date={step.date}
            stepNumber={i + 1}
            status={step.status}
            isLast={i === arr.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default TrackingPage;
