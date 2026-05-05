import { useState, useRef } from 'react';
import { Paperclip, AlertCircle, CheckCircle } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { InputField } from '../components/InputField.jsx';
import { Button } from '../components/Button.jsx';
import styles from './CustomOrderPage.module.css';

export function CustomOrderPage() {
  const { baseUrl, bearerToken, endpoints } = useApi();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    dimensions: '',
    budget: '',
    description: '',
    variants: '',
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoFileName, setPhotoFileName] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts editing
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    if (!formData.category) {
      setErrorMessage('يرجى اختيار نوع المنتج');
      return false;
    }
    if (!formData.budget.trim()) {
      setErrorMessage('يرجى إدخال الميزانية التقريبية');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage('يرجى إدخال وصف القطعة المطلوبة');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Prepare the request body
      const requestBody = {
        category: formData.category,
        variants: formData.variants || formData.dimensions,
        budget: parseInt(formData.budget, 10),
        description: formData.description,
        photo: photoFileName || 'no-photo.jpg',
      };

      // Make the API call
      const response = await fetch(`${baseUrl}${endpoints.specialOrders}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ في إرسال الطلب');
      }

      const data = await response.json();
      
      // Success
      setSuccessMessage(`تم إنشاء طلبك بنجاح! رقم الطلب: ${data.data.special_order.id}`);
      
      // Reset form
      setFormData({
        category: '',
        dimensions: '',
        budget: '',
        description: '',
        variants: '',
      });
      setPhotoFile(null);
      setPhotoFileName('');
      
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage(error.message || 'فشل في إرسال الطلب. يرجى المحاولة مجددًا.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <SectionHeader title="طلب مخصص" subtitle="صمّم قطعتك الفنية الخاصة" />
      <div className={styles.card}>
        <p className={styles.intro}>
          هل تريد قطعة فنية بمواصفات خاصة؟ أخبرنا بتفاصيل حلمك وسنعمل مع حرفيينا لتحويله إلى حقيقة.
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className={`${styles.messageBox} ${styles.messageError}`}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className={`${styles.messageBox} ${styles.messageSuccess}`}>
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="نوع المنتج"
            select
            options={[
              'فسيفساء / موزاييك',
              'خشب مطعّم بالصدف',
              'زجاج منفوخ',
              'بروكار حريري',
              'نحاسيات',
              'أخرى',
            ]}
            placeholder="اختر نوع المنتج"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <div className={styles.twoCol}>
            <InputField
              label="الأبعاد التقريبية"
              placeholder="مثلاً: ٦٠×٤٠ سم"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <InputField
              label="الميزانية التقريبية ($)"
              placeholder="مثلاً: ٥٠٠"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <InputField
            label="الألوان والتفاصيل المفضلة"
            placeholder="مثلاً: أزرق، ذهبي، تصاميم هندسية"
            name="variants"
            value={formData.variants}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <InputField
            label="وصف القطعة المطلوبة"
            textarea
            placeholder="صف لنا بالتفصيل ما تريده: التصميم، الألوان، الاستخدام..."
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <div className={styles.uploadZone} onClick={handleUploadClick} role="button" tabIndex={0}>
            <Paperclip size={28} className={styles.uploadIcon} />
            <span className={styles.uploadText}>
              {photoFileName ? `تم اختيار: ${photoFileName}` : 'ارفع صورة مرجعية (اختياري)'}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <Button
            variant="primary"
            full
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CustomOrderPage;
