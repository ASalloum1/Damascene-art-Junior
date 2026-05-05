import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Tabs from '../../components/ui/Tabs.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { relativeTime, formatDate } from '../../utils/formatters.js';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest } from '../../utils/adminApi.js';
import styles from './Messages.module.css';

const TYPE_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'special_order', label: 'طلبات مخصصة' },
  { id: 'inquiry', label: 'استفسارات' },
  { id: 'complaint', label: 'شكاوى' },
  { id: 'suggestion', label: 'اقتراحات' },
];

function getTypeVariant(type) {
  const map = {
    special_order: 'gold',
    inquiry: 'info',
    complaint: 'danger',
    suggestion: 'success',
  };
  return map[type] || 'default';
}

function AvatarCircle({ name }) {
  return <div className={styles.avatar}>{name ? name.charAt(0) : '؟'}</div>;
}

export default function MessagesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState([]);
  const detailBodyRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const query = new URLSearchParams();

      if (search) query.set('search', search);
      if (activeTab !== 'all') query.set('type', activeTab);

      const path = query.toString()
        ? `${API_CONFIG.ENDPOINTS.messages}?${query.toString()}`
        : API_CONFIG.ENDPOINTS.messages;

      const data = await apiRequest(path);
      setMessages(data?.data?.messages || []);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحميل الرسائل', type: 'error' });
    }
  }, [activeTab, search, showToast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (detailBodyRef.current) {
      detailBodyRef.current.scrollTop = 0;
    }
  }, [selectedMessage?.id]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return messages.filter((message) => {
      const matchSearch =
        !query ||
        message.sender?.toLowerCase().includes(query) ||
        message.subject?.toLowerCase().includes(query) ||
        message.preview?.toLowerCase().includes(query);
      const matchTab = activeTab === 'all' || message.type_key === activeTab;
      return matchSearch && matchTab;
    });
  }, [messages, search, activeTab]);

  const tabsWithCounts = TYPE_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'all'
        ? messages.filter((message) => message.unread).length || undefined
        : messages.filter((message) => message.type_key === tab.id && message.unread).length || undefined,
  }));

  const handleSelect = useCallback((message) => {
    setSelectedMessage(message);
    setReplyText(message.reply || '');
  }, []);

  const handleReply = useCallback(async () => {
    if (!selectedMessage) {
      return;
    }

    if (!replyText.trim()) {
      showToast({ message: 'يرجى كتابة رد أولاً', type: 'warning' });
      return;
    }

    try {
      const kind = selectedMessage.kind === 'special-order' ? 'special-order' : 'contact';
      await apiRequest(API_CONFIG.ENDPOINTS.messageStatus(kind, selectedMessage.id), {
        method: 'POST',
        body: {
          status: 'replied',
          reply: replyText,
        },
      });
      showToast({ message: 'تم إرسال الرد بنجاح', type: 'success' });
      await loadMessages();
      setReplyText('');
    } catch (error) {
      showToast({ message: error.message || 'تعذر إرسال الرد', type: 'error' });
    }
  }, [loadMessages, replyText, selectedMessage, showToast]);

  const currentMessage = selectedMessage
    ? messages.find((message) => message.id === selectedMessage.id) || selectedMessage
    : null;

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <MessageSquare size={35} strokeWidth={2} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>الرسائل والطلبات</h1>
          <p className={styles.pageSubtitle}>إدارة رسائل التواصل والاستفسارات الواردة من العملاء والمتاجر</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarSearch}>
            <SearchInput
              placeholder="بحث في الرسائل..."
              onSearch={(value) => setSearch(value)}
              value={search}
            />
          </div>
          <div className={styles.sidebarTabs}>
            <Tabs
              tabs={tabsWithCounts}
              activeTab={activeTab}
              onChange={(id) => {
                setActiveTab(id);
                setSelectedMessage(null);
              }}
              variant="underline"
            />
          </div>
          <div className={styles.messageList}>
            {filtered.length === 0 ? (
              <div className={styles.emptyList}>
                <EmptyState
                  icon={MessageSquare}
                  title="سكون في صندوق الوارد"
                  description="لا توجد رسائل بانتظار المراجعة حالياً."
                />
              </div>
            ) : (
              filtered.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  className={[
                    styles.messageItem,
                    selectedMessage?.id === message.id ? styles.messageItemActive : '',
                    message.unread ? styles.messageItemUnread : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelect(message)}
                >
                  <div className={styles.msgItemTop}>
                    <AvatarCircle name={message.sender} />
                    <div className={styles.msgItemInfo}>
                      <div className={styles.msgItemHeader}>
                        <span className={styles.msgSender}>{message.sender}</span>
                        <span className={styles.msgTime}>{relativeTime(message.timestamp || message.created_at)}</span>
                      </div>
                      <div className={styles.msgSubjectRow}>
                        <span className={message.unread ? styles.msgSubjectUnread : styles.msgSubject}>
                          {message.subject}
                        </span>
                        {message.unread ? <span className={styles.unreadDot} aria-label="غير مقروء" /> : null}
                      </div>
                      <p className={styles.msgPreview}>{message.preview}</p>
                      <div className={styles.msgMeta}>
                        <span className={styles.msgStore}>{message.store || '—'}</span>
                        {message.urgent ? <Badge text="عاجل" variant="danger" size="sm" /> : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.detail}>
          {!currentMessage ? (
            <div className={styles.detailEmpty}>
              <EmptyState
                icon={MessageSquare}
                title="تأمل في التفاصيل"
                description="اختر رسالة من القائمة لعرض التفاصيل وبدء الرد."
              />
            </div>
          ) : (
            <div className={styles.detailContent} ref={detailBodyRef} aria-live="polite">
              <div className={styles.detailHeader}>
                <div className={styles.detailHeaderTop}>
                  <h2 className={styles.detailSubject}>{currentMessage.subject}</h2>
                  <Badge text={currentMessage.status_label || currentMessage.status} variant="info" />
                </div>
                <div className={styles.detailMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>من:</span>
                    <span className={styles.metaValue}>{currentMessage.sender}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>التاريخ:</span>
                    <span className={styles.metaValue}>{formatDate(currentMessage.timestamp || currentMessage.created_at)}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>المتجر:</span>
                    <span className={styles.metaValue}>{currentMessage.store || '—'}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>النوع:</span>
                    <Badge text={currentMessage.type || currentMessage.type_key} variant={getTypeVariant(currentMessage.type_key)} size="sm" />
                  </div>
                </div>
              </div>

              <div className={styles.detailBody}>
                <p>{currentMessage.preview}</p>
              </div>

              <div className={styles.replyArea}>
                <h3 className={styles.replyTitle}>الرد على الرسالة</h3>
                <TextArea
                  label=""
                  placeholder="اكتب ردك هنا..."
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className={styles.replyActions}>
                  <Button variant="primary" icon={Send} onClick={handleReply}>
                    إرسال الرد
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
