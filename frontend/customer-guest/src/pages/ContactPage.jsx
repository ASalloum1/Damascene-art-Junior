import { useState } from 'react';
import { Mail, Phone, Smartphone, MapPin, Clock, Map } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { API_CONFIG } from '../config/api.config.js';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './ContactPage.module.css';

export function ContactPage({ onNavigate }) {
  const { baseUrl, bearerToken, endpoints } = useApi();
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!description || !subject || !message) {
      setError('يرجى ملء جميع الحقول لإرسال الرسالة.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}${endpoints.contactUs}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          subject,
          message,
          description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'فشل إرسال رسالتك.');
        return;
      }

      setSuccess('تم إرسال المراسلة بنجاح. شكرًا لتواصلك معنا.');
      setDescription('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Contact submit error:', err);
      setError('حدث خطأ في الاتصال بالخادم. حاول مرة أخرى لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <SectionHeader title="آفاق التواصل" subtitle="يُسعدنا استقبال استفساراتكم ومشاركتكم شغف الفن" />
      <div className={styles.grid}>
        {/* Form Column */}
        <div className={styles.formCard}>
          {error ? <div className={styles.errorMessage}>{error}</div> : null}
          {success ? <div className={styles.successMessage}>{success}</div> : null}

          <InputField
            label="وصف"
            placeholder="اكتب وصفاً موجزاً لطلبك أو استفسارك"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <InputField
            label="موضوع"
            placeholder="موضوع الرسالة"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <InputField
            label="رسالة"
            textarea
            placeholder="اكتب رسالتك هنا..."
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="primary" full onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال المراسلة'}
          </Button>
        </div>

        {/* Info Column */}
        <div className={styles.infoCol}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoHeading}>معلومات التواصل</h3>
            <div className={styles.contactRow}>
              <Mail size={18} className={styles.contactIcon} />
              <span>info@damascene-art.com</span>
            </div>
            <div className={styles.contactRow}>
              <Phone size={18} className={styles.contactIcon} />
              <span>+963 11 XXX XXXX</span>
            </div>
            <div className={styles.contactRow}>
              <Smartphone size={18} className={styles.contactIcon} />
              <span>واتساب: +963 9XX XXX XXX</span>
            </div>
            <div className={styles.contactRow}>
              <MapPin size={18} className={styles.contactIcon} />
              <span>دمشق — سوق الحميدية</span>
            </div>
            <div className={styles.contactRow}>
              <Clock size={18} className={styles.contactIcon} />
              <span>السبت - الخميس: ٩ ص - ٦ م</span>
            </div>
          </div>

          <div className={styles.mapCard}>
            <Map size={28} className={styles.mapIcon} />
            <span>خريطة الموقع — سوق الحميدية، دمشق</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
