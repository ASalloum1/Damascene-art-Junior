import styles from './SectionTitle.module.css';
import ActionBtn from './ActionBtn';
import { Plus } from 'lucide-react';

/**
 * SectionTitle — page heading with optional primary action
 */
export function SectionTitle({ title, action, onAction }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      {action ? (
        <ActionBtn
          text={action}
          variant="primary"
          onClick={onAction}
          icon={<Plus size={14} />}
        />
      ) : null}
    </div>
  );
}
export default SectionTitle;
