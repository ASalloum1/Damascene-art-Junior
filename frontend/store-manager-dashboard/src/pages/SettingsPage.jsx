import styles from './pages.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import ActionBtn from '../components/ActionBtn';

const storeFields = [
  { label: 'اسم المتجر',        value: 'الفن الدمشقي — Damascene Art' },
  { label: 'البريد الإلكتروني', value: 'info@damascene-art.com' },
  { label: 'رقم الهاتف',        value: '+963 11 XXX XXXX' },
  { label: 'العنوان',           value: 'دمشق، سوريا — الحميدية' },
];

const profileFields = [
  { label: 'الاسم',  value: 'مدير المتجر' },
  { label: 'البريد', value: 'manager@damascene-art.com' },
];

export function SettingsPage() {
  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="الإعدادات" />
      <div className={styles.grid2}>
        <PageCard>
          <h3 className={styles.cardTitle}>إعدادات المتجر</h3>
          {storeFields.map((s, i) => (
            <div key={i} className={styles.formField}>
              <label className={styles.formLabel}>{s.label}</label>
              <input className={styles.formInput} defaultValue={s.value} />
            </div>
          ))}
          <ActionBtn text="حفظ التغييرات" variant="primary" onClick={() => {}} />
        </PageCard>
        <PageCard>
          <h3 className={styles.cardTitle}>إعدادات اللغة والعملة</h3>
          <div className={styles.formField}>
            <label className={styles.formLabel}>اللغة الافتراضية</label>
            <select className={styles.formSelect}>
              <option>العربية</option>
              <option>English</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>العملة الافتراضية</label>
            <select className={styles.formSelect}>
              <option>USD — دولار أمريكي</option>
              <option>EUR — يورو</option>
              <option>SYP — ليرة سورية</option>
            </select>
          </div>
          <h3 className={styles.cardTitle}>الملف الشخصي</h3>
          {profileFields.map((s, i) => (
            <div key={i} className={styles.formField}>
              <label className={styles.formLabel}>{s.label}</label>
              <input className={styles.formInput} defaultValue={s.value} />
            </div>
          ))}
          <ActionBtn text="تحديث الملف الشخصي" variant="primary" onClick={() => {}} />
        </PageCard>
      </div>
    </div>
  );
}

export default SettingsPage;
