import { Camera } from 'lucide-react';
import navStyles from './Navbar.module.css';
import styles from './VisualSearchButton.module.css';

export function VisualSearchButton({ onNavigate }) {
  return (
    <button
      type="button"
      className={`${navStyles.iconBtn} ${styles.cameraBtn}`}
      onClick={() => onNavigate?.('visual')}
      aria-label="البحث بالصورة"
      title="البحث بالصورة"
    >
      <Camera size={18} aria-hidden="true" />
    </button>
  );
}

export default VisualSearchButton;
