import styles from './pages.module.css';
import settingsStyles from './SettingsPage.module.css';
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
        <div className={settingsStyles.settingsCard}>
          <PageCard>
            <h3 className={styles.cardTitle}>إعدادات المتجر</h3>
            {storeFields.map((s, i) => (
              <div key={i} className={styles.formField}>
                <label className={styles.formLabel} htmlFor={`store-${i}`}>{s.label}</label>
                <input
                  id={`store-${i}`}
                  className={`${styles.formInput} ${settingsStyles.formInput}`}
                  defaultValue={s.value}
                />
              </div>
            ))}
            <span className={settingsStyles.saveBtn}>
              <ActionBtn text="حفظ التغييرات" variant="primary" onClick={() => {}} />
            </span>
          </PageCard>
        </div>
        <div className={settingsStyles.settingsCard}>
          <PageCard>
            <h3 className={styles.cardTitle}>إعدادات اللغة والعملة</h3>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="lang-select">اللغة الافتراضية</label>
              <select
                id="lang-select"
                className={`${styles.formSelect} ${settingsStyles.formSelect}`}
                defaultValue="ar"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="currency-select">العملة الافتراضية</label>
              <select
                id="currency-select"
                className={`${styles.formSelect} ${settingsStyles.formSelect}`}
                defaultValue="usd"
              >
                <option value="usd">USD — دولار أمريكي</option>
                <option value="eur">EUR — يورو</option>
                <option value="syp">SYP — ليرة سورية</option>
              </select>
            </div>
            <div className={settingsStyles.sectionDivider} aria-hidden="true" />
            <h3 className={styles.cardTitle}>الملف الشخصي</h3>
            {profileFields.map((s, i) => (
              <div key={i} className={styles.formField}>
                <label className={styles.formLabel} htmlFor={`profile-${i}`}>{s.label}</label>
                <input
                  id={`profile-${i}`}
                  className={`${styles.formInput} ${settingsStyles.formInput}`}
                  defaultValue={s.value}
                />
              </div>
            ))}
            <span className={settingsStyles.saveBtn}>
              <ActionBtn text="تحديث الملف الشخصي" variant="primary" onClick={() => {}} />
            </span>
          </PageCard>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
