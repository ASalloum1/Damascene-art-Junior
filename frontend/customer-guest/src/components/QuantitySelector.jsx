import { Minus, Plus } from 'lucide-react';
import styles from './QuantitySelector.module.css';

export function QuantitySelector({ value, onChange, min = 1, max = 999 }) {
  const handleDecrement = () => {
    if (value > min) onChange((v) => v - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange((v) => v + 1);
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.btn}
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="تقليل الكمية"
      >
        <Minus size={14} />
      </button>

      <span className={styles.value}>{value}</span>

      <button
        type="button"
        className={styles.btn}
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="زيادة الكمية"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default QuantitySelector;
