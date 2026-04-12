import { useState } from 'react';
import {
  Globe,
  Save,
  Mail,
  Search,
  Languages,
  Wrench,
  Share2,
  Send,
  AlertTriangle,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import styles from './SiteSettings.module.css';

const SECTION_TABS = [
  { id: 'info', label: 'معلومات الموقع' },
  { id: 'locale', label: 'اللغة والعملة' },
  { id: 'email', label: 'البريد الإلكتروني' },
  { id: 'seo', label: 'SEO' },
  { id: 'maintenance', label: 'وضع الصيانة' },
];

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className={styles.toggleLabel}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[styles.toggle, checked ? styles.toggleOn : ''].filter(Boolean).join(' ')}
      >
        <span className={styles.toggleThumb} />
      </button>
      {label ? <span className={styles.toggleText}>{label}</span> : null}
    </label>
  );
}

export default function SiteSettingsPage() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('info');

  // Section 1: Site Info
  const [siteInfo, setSiteInfo] = useState({
    name: 'الفن الدمشقي',
    description: 'منصة للتسوق الإلكتروني للفنون والحرف اليدوية الدمشقية الأصيلة.',
    email: 'info@damasceneart.com',
    phone: '+963 11 123 4567',
    address: 'دمشق، شارع بغداد، بناء 42',
    facebook: 'https://facebook.com/damasceneart',
    instagram: 'https://instagram.com/damasceneart',
    twitter: 'https://twitter.com/damasceneart',
  });

  // Section 2: Locale
  const [locale, setLocale] = useState({
    defaultLang: 'ar',
    enabledLangs: { ar: true, en: true, fr: false },
    defaultCurrency: 'syp',
    enabledCurrencies: { syp: true, usd: true, eur: false },
  });

  // Section 3: Email
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: 'smtp.mail.com',
    smtpPort: '587',
    smtpUser: 'no-reply@damasceneart.com',
    smtpPass: '',
    senderEmail: 'no-reply@damasceneart.com',
    senderName: 'الفن الدمشقي',
    encryption: 'tls',
  });

  // Section 4: SEO
  const [seo, setSeo] = useState({
    homeTitle: 'الفن الدمشقي — حرف أصيلة بلمسة عصرية',
    metaDesc: 'اكتشف أجمل الحرف اليدوية الدمشقية من موزاييك وخشب مطعم وبروكار وأكثر.',
    keywords: ['الفن الدمشقي', 'حرف يدوية', 'موزاييك', 'بروكار'],
    gaId: 'G-XXXXXXXXXX',
    fbPixel: '',
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Section 5: Maintenance
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: 'الموقع تحت الصيانة. نعود قريباً.',
    returnAt: '',
  });

  function saveSection(section) {
    showToast({ message: 'تم حفظ التغييرات بنجاح', type: 'success' });
  }

  function testSmtp() {
    showToast({ message: 'تم إرسال بريد اختباري بنجاح', type: 'info' });
  }

  function addKeyword(e) {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      setSeo((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  }

  function removeKeyword(kw) {
    setSeo((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Globe size={35} strokeWidth={2} />
        </div>
        <div>
        <h1 className={styles.pageTitle}>إعدادات الموقع</h1>
            <p className={styles.pageSubtitle}> ضبط الإعدادات العامة للمنصة من معلومات وشعارات وسياسات التشغيل</p>
            </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabsRow}>
          <Tabs
            tabs={SECTION_TABS}
            activeTab={activeSection}
            onChange={setActiveSection}
            variant="underline"
          />
        </div>

        <div className={styles.sectionBody}>

          {/* Section 1: Site Info */}
          {activeSection === 'info' ? (
            <div className={styles.section}>
              <div className={styles.formGrid}>
                <InputField
                  label="اسم الموقع"
                  value={siteInfo.name}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, name: e.target.value }))}
                  required
                />
                <InputField
                  label="البريد الإلكتروني"
                  type="email"
                  value={siteInfo.email}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, email: e.target.value }))}
                />
                <InputField
                  label="رقم الهاتف"
                  value={siteInfo.phone}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, phone: e.target.value }))}
                />
                <InputField
                  label="العنوان"
                  value={siteInfo.address}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <TextArea
                label="وصف الموقع"
                rows={3}
                value={siteInfo.description}
                onChange={(e) => setSiteInfo((p) => ({ ...p, description: e.target.value }))}
              />

              <div className={styles.uploadRow}>
                <div className={styles.uploadArea}>
                  <Globe size={32} strokeWidth={1.2} className={styles.uploadIcon} />
                  <span className={styles.uploadLabel}>شعار الموقع</span>
                  <span className={styles.uploadHint}>PNG أو SVG — يُفضل 200×60px</span>
                  <Button variant="outline" size="sm">اختر ملف</Button>
                </div>
                <div className={styles.uploadArea}>
                  <Globe size={22} strokeWidth={1.2} className={styles.uploadIcon} />
                  <span className={styles.uploadLabel}>Favicon</span>
                  <span className={styles.uploadHint}>ICO أو PNG — 32×32px</span>
                  <Button variant="outline" size="sm">اختر ملف</Button>
                </div>
              </div>

              <h4 className={styles.subTitle}>
                <Share2 size={16} strokeWidth={1.8} /> وسائل التواصل الاجتماعي
              </h4>
              <div className={styles.formGrid}>
                <InputField
                  label="فيسبوك"
                  value={siteInfo.facebook}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, facebook: e.target.value }))}
                />
                <InputField
                  label="إنستغرام"
                  value={siteInfo.instagram}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, instagram: e.target.value }))}
                />
                <InputField
                  label="تويتر"
                  value={siteInfo.twitter}
                  onChange={(e) => setSiteInfo((p) => ({ ...p, twitter: e.target.value }))}
                />
              </div>
              <div className={styles.sectionFooter}>
                <Button variant="primary" icon={Save} onClick={() => saveSection('info')}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : null}

          {/* Section 2: Locale */}
          {activeSection === 'locale' ? (
            <div className={styles.section}>
              <div className={styles.formGrid}>
                <SelectField
                  label="اللغة الافتراضية"
                  options={[
                    { value: 'ar', label: 'العربية' },
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'Français' },
                  ]}
                  value={locale.defaultLang}
                  onChange={(e) => setLocale((p) => ({ ...p, defaultLang: e.target.value }))}
                />
                <SelectField
                  label="العملة الافتراضية"
                  options={[
                    { value: 'syp', label: 'الليرة السورية (SYP)' },
                    { value: 'usd', label: 'الدولار الأمريكي (USD)' },
                    { value: 'eur', label: 'اليورو (EUR)' },
                  ]}
                  value={locale.defaultCurrency}
                  onChange={(e) => setLocale((p) => ({ ...p, defaultCurrency: e.target.value }))}
                />
              </div>

              <div className={styles.checkGroup}>
                <h4 className={styles.subTitle}>
                  <Languages size={16} strokeWidth={1.8} /> اللغات المفعّلة
                </h4>
                {[
                  { key: 'ar', label: 'العربية' },
                  { key: 'en', label: 'English' },
                  { key: 'fr', label: 'Français' },
                ].map((lang) => (
                  <label key={lang.key} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={locale.enabledLangs[lang.key]}
                      onChange={(e) =>
                        setLocale((p) => ({
                          ...p,
                          enabledLangs: { ...p.enabledLangs, [lang.key]: e.target.checked },
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span>{lang.label}</span>
                  </label>
                ))}
              </div>

              <div className={styles.checkGroup}>
                <h4 className={styles.subTitle}>العملات المفعّلة</h4>
                {[
                  { key: 'syp', label: 'الليرة السورية (SYP)' },
                  { key: 'usd', label: 'الدولار الأمريكي (USD)' },
                  { key: 'eur', label: 'اليورو (EUR)' },
                ].map((cur) => (
                  <label key={cur.key} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={locale.enabledCurrencies[cur.key]}
                      onChange={(e) =>
                        setLocale((p) => ({
                          ...p,
                          enabledCurrencies: { ...p.enabledCurrencies, [cur.key]: e.target.checked },
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span>{cur.label}</span>
                  </label>
                ))}
              </div>

              <div className={styles.sectionFooter}>
                <Button variant="primary" icon={Save} onClick={() => saveSection('locale')}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : null}

          {/* Section 3: Email */}
          {activeSection === 'email' ? (
            <div className={styles.section}>
              <h4 className={styles.subTitle}>
                <Mail size={16} strokeWidth={1.8} /> إعدادات SMTP
              </h4>
              <div className={styles.formGrid}>
                <InputField
                  label="خادم SMTP"
                  value={emailConfig.smtpServer}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, smtpServer: e.target.value }))}
                />
                <InputField
                  label="المنفذ (Port)"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, smtpPort: e.target.value }))}
                />
                <InputField
                  label="اسم المستخدم"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, smtpUser: e.target.value }))}
                />
                <InputField
                  label="كلمة المرور"
                  type="password"
                  value={emailConfig.smtpPass}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, smtpPass: e.target.value }))}
                />
                <InputField
                  label="بريد المرسل"
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, senderEmail: e.target.value }))}
                />
                <InputField
                  label="اسم المرسل"
                  value={emailConfig.senderName}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, senderName: e.target.value }))}
                />
                <SelectField
                  label="التشفير"
                  options={[
                    { value: 'none', label: 'بدون تشفير' },
                    { value: 'ssl', label: 'SSL' },
                    { value: 'tls', label: 'TLS' },
                  ]}
                  value={emailConfig.encryption}
                  onChange={(e) => setEmailConfig((p) => ({ ...p, encryption: e.target.value }))}
                />
              </div>
              <div className={styles.testRow}>
                <Button variant="outline" icon={Send} size="sm" onClick={testSmtp}>
                  اختبار الاتصال
                </Button>
              </div>

              <h4 className={styles.subTitle}>قوالب البريد الإلكتروني</h4>
              <div className={styles.templateList}>
                {[
                  'تأكيد الطلب',
                  'تأكيد التسجيل',
                  'إعادة تعيين كلمة المرور',
                  'إشعار الشحن',
                  'طلب التقييم',
                ].map((tmpl) => (
                  <div key={tmpl} className={styles.templateItem}>
                    <span className={styles.templateName}>{tmpl}</span>
                    <div className={styles.templateActions}>
                      <Button variant="ghost" size="sm">معاينة</Button>
                      <Button variant="outline" size="sm">تعديل</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.sectionFooter}>
                <Button variant="primary" icon={Save} onClick={() => saveSection('email')}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : null}

          {/* Section 4: SEO */}
          {activeSection === 'seo' ? (
            <div className={styles.section}>
              <InputField
                label="عنوان الصفحة الرئيسية"
                value={seo.homeTitle}
                onChange={(e) => setSeo((p) => ({ ...p, homeTitle: e.target.value }))}
              />
              <TextArea
                label="الوصف التعريفي (Meta Description)"
                rows={3}
                value={seo.metaDesc}
                onChange={(e) => setSeo((p) => ({ ...p, metaDesc: e.target.value }))}
                maxLength={160}
              />

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>الكلمات المفتاحية</label>
                <div className={styles.tagsInput}>
                  {seo.keywords.map((kw) => (
                    <span key={kw} className={styles.tag}>
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className={styles.tagRemove}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={addKeyword}
                    placeholder="أضف كلمة واضغط Enter"
                    className={styles.tagInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <InputField
                  label="معرّف Google Analytics"
                  value={seo.gaId}
                  onChange={(e) => setSeo((p) => ({ ...p, gaId: e.target.value }))}
                  hint="مثال: G-XXXXXXXXXX"
                />
                <InputField
                  label="Facebook Pixel ID"
                  value={seo.fbPixel}
                  onChange={(e) => setSeo((p) => ({ ...p, fbPixel: e.target.value }))}
                />
              </div>

              <div className={styles.sectionFooter}>
                <Button variant="primary" icon={Save} onClick={() => saveSection('seo')}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : null}

          {/* Section 5: Maintenance */}
          {activeSection === 'maintenance' ? (
            <div className={styles.section}>
              {maintenance.enabled ? (
                <div className={styles.maintenanceBanner}>
                  <AlertTriangle size={18} strokeWidth={1.8} />
                  <span>وضع الصيانة مفعّل — الموقع غير متاح للزوار حالياً</span>
                </div>
              ) : null}

              <div className={styles.maintenanceToggleRow}>
                <ToggleSwitch
                  checked={maintenance.enabled}
                  onChange={(v) => setMaintenance((p) => ({ ...p, enabled: v }))}
                  label={maintenance.enabled ? 'وضع الصيانة مفعّل' : 'وضع الصيانة معطّل'}
                />
              </div>

              <TextArea
                label="رسالة الصيانة"
                rows={3}
                value={maintenance.message}
                onChange={(e) => setMaintenance((p) => ({ ...p, message: e.target.value }))}
                placeholder="أدخل الرسالة التي ستظهر للزوار..."
              />

              <InputField
                label="وقت العودة المتوقع"
                type="datetime-local"
                value={maintenance.returnAt}
                onChange={(e) => setMaintenance((p) => ({ ...p, returnAt: e.target.value }))}
              />

              <div className={styles.sectionFooter}>
                <Button variant="primary" icon={Save} onClick={() => saveSection('maintenance')}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
