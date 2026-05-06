import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './pages.module.css';
import reviewStyles from './ReviewsPage.module.css';
import textareaStyles from '../components/ui/TextArea.module.css';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Icon } from '../components/SvgIcons';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import InputField from '../components/ui/InputField.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { apiBaseUrl } from '../config/index.js';

const reviews = [
  {
    id: 1,
    customer: 'أحمد الشامي',
    email: 'ahmad@example.com',
    product: 'طاولة موزاييك',
    rating: 5,
    text: 'قطعة فنية رائعة! التفاصيل مذهلة والجودة عالية جداً.',
    status: 'منشور',
    date: '٠٢/٠٤/٢٠٢٦',
  },
  {
    id: 2,
    customer: 'سارة مولر',
    email: 'sara.muller@example.com',
    product: 'صندوق صدف',
    rating: 4,
    text: 'جميل جداً لكن التوصيل تأخر قليلاً.',
    status: 'بانتظار',
    date: '٠١/٠٤/٢٠٢٦',
  },
  {
    id: 3,
    customer: 'جون سميث',
    email: 'john.smith@example.com',
    product: 'مزهرية زجاج',
    rating: 5,
    text: 'Absolutely stunning! A true piece of art.',
    status: 'منشور',
    date: '٣٠/٠٣/٢٠٢٦',
  },
];

export function ReviewsPage() {
  const { showToast } = useToast();
  const [replyTarget, setReplyTarget] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [sending, setSending] = useState(false);

  function openReply(review) {
    setReplyTarget(review);
    setSubject(`رد من الفن الدمشقي على تقييمك للمنتج: ${review.product}`);
    setMessage('');
    setMessageError('');
  }

  function closeReply() {
    if (sending) return;
    setReplyTarget(null);
    setSubject('');
    setMessage('');
    setMessageError('');
  }

  async function sendReply() {
    if (!replyTarget) return;
    const subj = subject.trim();
    const msg = message.trim();
    if (!subj) {
      setMessageError('');
      showToast({ message: 'يرجى إدخال موضوع الرسالة', type: 'warning' });
      return;
    }
    if (msg.length < 10) {
      setMessageError(
        msg.length === 0
          ? 'يرجى كتابة نص الرد'
          : 'يجب أن يحتوي الرد على ١٠ أحرف على الأقل'
      );
      return;
    }
    setMessageError('');
    setSending(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/store-manager/reviews/${replyTarget.id}/reply`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject: subj, message: msg }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast({ message: 'تم إرسال الرد بنجاح', type: 'success' });
      setReplyTarget(null);
      setSubject('');
      setMessage('');
    } catch {
      showToast({
        message: 'فشل إرسال الرد، يرجى المحاولة لاحقاً',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="التقييمات والمراجعات" />
      <div className={styles.statRow}>
        <div className="stagger-1"><StatCard icon="star"     label="متوسط التقييم"  value="٤.٧ / ٥" accentVariant="primary" sub="إجمالي" /></div>
        <div className="stagger-2"><StatCard icon="fileText" label="تقييمات جديدة"  value="٨"        accentVariant="info"    sub="بانتظار المراجعة" /></div>
      </div>
      <div className="stagger-2">
        <PageCard>
          {reviews.map((r) => (
            <div key={r.id} className={`${styles.reviewCard} ${reviewStyles.reviewCard}`}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewAuthor}>{r.customer}</span>
                  <span className={styles.reviewProduct}> — {r.product}</span>
                </div>
                <div className={styles.reviewMeta}>
                  <span
                    className={`${styles.stars} ${reviewStyles.stars}`}
                    aria-label={`تقييم ${r.rating} من ٥`}
                  >
                    {[...Array(5)].map((_, si) => (
                      <Icon
                        key={si}
                        name="star"
                        size={14}
                        style={{
                          color: si < r.rating ? 'var(--color-gold)' : 'var(--color-ivory-dark)',
                          fill: si < r.rating ? 'var(--color-gold)' : 'none'
                        }}
                      />
                    ))}
                  </span>
                  <Badge
                    text={r.status}
                    variant={r.status === 'منشور' ? 'success' : 'warning'}
                  />
                </div>
              </div>
              <p className={`${styles.reviewText} ${reviewStyles.reviewText}`}>{r.text}</p>
              <div className={`${styles.reviewFooter}`}>
                <span className={styles.reviewDate}>{r.date}</span>
                <div className={`${styles.reviewActions} ${reviewStyles.reviewActions}`}>
                  {r.status === 'بانتظار' ? (
                    <>
                      <span className={reviewStyles.btnApprove}>
                        <ActionBtn text="موافقة" variant="success" onClick={() => {}} icon={<Icon name="check" size={14} />} />
                      </span>
                      <span className={reviewStyles.btnReject}>
                        <ActionBtn text="رفض" variant="error" onClick={() => {}} icon={<Icon name="x" size={14} />} />
                      </span>
                    </>
                  ) : null}
                  <span className={reviewStyles.btnReply}>
                    <ActionBtn text="رد" variant="info" onClick={() => openReply(r)} icon={<Icon name="reply" size={14} />} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </PageCard>
      </div>

      <Modal
        isOpen={!!replyTarget}
        onClose={closeReply}
        title="الرد على التقييم"
        size="md"
        closeOnBackdrop={!sending}
        footer={
          <>
            <Button variant="ghost" onClick={closeReply} disabled={sending}>إلغاء</Button>
            <Button variant="primary" icon={Send} loading={sending} onClick={sendReply}>إرسال الرد</Button>
          </>
        }
      >
        {replyTarget ? (
          <div className={reviewStyles.replyForm}>
            <div className={reviewStyles.replyInfoBlock}>
              <div className={reviewStyles.replyInfoRow}>
                <span className={reviewStyles.replyInfoLabel}>العميل</span>
                <span className={reviewStyles.replyInfoValue}>{replyTarget.customer}</span>
              </div>
              <div className={reviewStyles.replyInfoRow}>
                <span className={reviewStyles.replyInfoLabel}>البريد الإلكتروني</span>
                <span className={reviewStyles.replyInfoValue}>{replyTarget.email}</span>
              </div>
              <div className={reviewStyles.replyInfoRow}>
                <span className={reviewStyles.replyInfoLabel}>المنتج</span>
                <span className={reviewStyles.replyInfoValue}>{replyTarget.product}</span>
              </div>
              <div className={reviewStyles.replyInfoRow}>
                <span className={reviewStyles.replyInfoLabel}>نص التقييم</span>
                <p className={reviewStyles.replyInfoText}>{replyTarget.text}</p>
              </div>
            </div>

            <InputField
              label="الموضوع"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={sending}
            />

            <div className={textareaStyles.fieldGroup}>
              <label htmlFor="reply-message" className={textareaStyles.label}>
                نص الرد <span className={textareaStyles.required} aria-hidden="true"> *</span>
              </label>
              <textarea
                id="reply-message"
                rows={6}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (messageError) setMessageError('');
                }}
                disabled={sending}
                aria-invalid={!!messageError}
                className={[
                  textareaStyles.textarea,
                  messageError ? textareaStyles.textareaError : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                placeholder="اكتب رسالتك للعميل (١٠ أحرف على الأقل)"
              />
              <div className={textareaStyles.footer}>
                {messageError ? (
                  <span className={textareaStyles.errorMsg} role="alert">{messageError}</span>
                ) : (
                  <span />
                )}
                <span className={textareaStyles.counter}>{message.length} حرف</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default ReviewsPage;
