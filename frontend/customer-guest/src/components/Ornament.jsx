import styles from './Ornament.module.css';

export function Ornament() {
  return (
    <svg 
      width="100%" 
      height="100%" 
      className={styles.ornament} 
      aria-hidden="true"
    >
      <defs>
        <pattern id="damascenePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#damascenePattern)" />
    </svg>
  );
}

export default Ornament;
