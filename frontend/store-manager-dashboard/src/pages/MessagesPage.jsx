import { useEffect, useMemo, useState } from 'react';
import styles from './pages.module.css';
import messageStyles from './MessagesPage.module.css';
import SectionTitle from '../components/SectionTitle';
import PageCard from '../components/PageCard';
import Badge from '../components/Badge';
import ActionBtn from '../components/ActionBtn';
import { Icon } from '../components/SvgIcons';
import { useToast } from '../components/ui/Toast';
import { API_CONFIG } from '../config/api.config.js';
import { apiRequest } from '../utils/storeApi.js';
import { relativeTime } from '../utils/formatters.js';

function getKindLabel(kind) {
  return kind === 'special-order' ? 'طلب مخصص' : 'رسالة';
}

function getStatusVariant(status) {
  if (status === 'closed') return 'neutral';
  if (status === 'replied') return 'success';
  if (status === 'in_progress') return 'info';
  return 'warning';
}

export function MessagesPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');

  async function loadMessages() {
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.messages);
      setMessages(data?.data?.messages || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل الرسائل', type: 'error' });
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function updateMessageStatus(message, status, reply) {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.messageStatus(message.kind, message.id), {
        method: 'POST',
        body: {
          status,
          reply,
        },
      });
      await loadMessages();
      showToast({ message: 'تم تحديث حالة الرسالة', type: 'success' });
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث الرسالة', type: 'error' });
    }
  }

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return messages;
    }

    return messages.filter((message) =>
      [
        message.sender,
        message.subject,
        message.preview,
        message.store,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [messages, search]);

  return (
    <div className={`${styles.page} page-enter`}>
      <SectionTitle title="الرسائل وطلبات التواصل" />
      <div className="stagger-1">
        <PageCard>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم المرسل أو الموضوع..."
              style={{
                width: '100%',
                border: '1px solid var(--color-line)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {filteredMessages.map((message, index) => {
            const rowClass = [
              styles.messageRow,
              messageStyles.messageRow,
              message.unread ? styles.unread : '',
              message.unread ? messageStyles.messageRowUnread : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={message.id || index} className={rowClass}>
                <div
                  className={`${styles.messageAvatar} ${messageStyles.messageAvatar}`}
                  aria-hidden="true"
                >
                  {message.sender?.[0] || 'ر'}
                </div>
                <div className={styles.messageBody}>
                  <div className={styles.messageTopRow}>
                    <span className={`${styles.messageSender} ${message.unread ? styles.bold : ''}`}>
                      {message.sender}
                    </span>
                    <span className={styles.messageTime}>{relativeTime(message.timestamp || message.created_at)}</span>
                  </div>
                  <div className={`${styles.messageSubject} ${message.unread ? styles.bold : ''}`}>
                    {message.subject}
                  </div>
                  <div className={styles.messagePreview}>{message.preview}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                    <Badge text={getKindLabel(message.kind)} variant={message.kind === 'special-order' ? 'warning' : 'info'} />
                    <Badge text={message.status_label || message.status} variant={getStatusVariant(message.status)} />
                    {message.urgent ? <Badge text="عاجلة" variant="error" /> : null}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <ActionBtn
                      text="قيد المتابعة"
                      variant="info"
                      onClick={() => updateMessageStatus(message, 'in_progress', message.reply || 'تم استلام الرسالة وجارٍ متابعتها.')}
                      icon={<Icon name="reply" size={14} />}
                    />
                    <ActionBtn
                      text="تم الرد"
                      variant="success"
                      onClick={() => updateMessageStatus(message, 'replied', message.reply || 'تم الرد على الطلب من قبل مدير المتجر.')}
                      icon={<Icon name="check" size={14} />}
                    />
                    <ActionBtn
                      text="إغلاق"
                      variant="ghost"
                      onClick={() => updateMessageStatus(message, 'closed', message.reply || 'تم إغلاق المحادثة.')}
                      icon={<Icon name="x" size={14} />}
                    />
                  </div>
                </div>
                {message.unread ? (
                  <div
                    className={messageStyles.messageDotUnread}
                    aria-label="رسالة غير مقروءة"
                  />
                ) : null}
              </div>
            );
          })}
        </PageCard>
      </div>
    </div>
  );
}

export default MessagesPage;
