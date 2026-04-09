import { useState, useMemo } from 'react';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import Tabs from '../../components/ui/Tabs.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockMessages } from '../../data/mockData.js';
import { messageStatusMap } from '../../constants/statusMaps.js';
import { relativeTime, formatDate } from '../../utils/formatters.js';
import styles from './Messages.module.css';

const TYPE_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'طلبات مخصصة', label: 'طلبات مخصصة' },
  { id: 'استفسارات', label: 'استفسارات' },
  { id: 'شكاوى', label: 'شكاوى' },
  { id: 'اقتراحات', label: 'اقتراحات' },
];

function getTypeVariant(type) {
  const map = {
    'طلبات مخصصة': 'gold',
    'استفسارات': 'info',
    'شكاوى': 'danger',
    'اقتراحات': 'success',
  };
  return map[type] || 'default';
}

function AvatarCircle({ name }) {
  return (
    <div className={styles.avatar}>
      {name ? name.charAt(0) : '؟'}
    </div>
  );
}

export default function MessagesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return messages.filter((m) => {
      const matchSearch =
        !q ||
        m.sender.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q);
      const matchTab = activeTab === 'all' || m.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [messages, search, activeTab]);

  const tabsWithCounts = TYPE_TABS.map((t) => ({
    ...t,
    count:
      t.id === 'all'
        ? messages.filter((m) => m.unread).length || undefined
        : messages.filter((m) => m.type === t.id && m.unread).length || undefined,
  }));

  function handleSelect(msg) {
    setSelectedMessage(msg);
    setReplyText('');
    if (msg.unread) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
      );
    }
  }

  function handleReply() {
    if (!replyText.trim()) {
      showToast({ message: 'يرجى كتابة رد أولاً', type: 'warning' });
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessage?.id ? { ...m, status: 'تم الرد' } : m
      )
    );
    showToast({ message: 'تم إرسال الرد بنجاح', type: 'success' });
    setReplyText('');
  }

  const currentMsg = selectedMessage
    ? messages.find((m) => m.id === selectedMessage.id)
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <MessageSquare size={22} strokeWidth={1.8} />
        </div>
        <h1 className={styles.pageTitle}>الرسائل والطلبات</h1>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarSearch}>
            <SearchInput
              placeholder="بحث في الرسائل..."
              onSearch={setSearch}
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className={styles.sidebarTabs}>
            <Tabs
              tabs={tabsWithCounts}
              activeTab={activeTab}
              onChange={(id) => { setActiveTab(id); setSelectedMessage(null); }}
              variant="underline"
            />
          </div>
          <div className={styles.messageList}>
            {filtered.length === 0 ? (
              <div className={styles.emptyList}>
                <EmptyState
                  icon={MessageSquare}
                  title="سكون في صندوق الوارد"
                  description="لا توجد رسائل بانتظار المراجعة. كل الاستفسارات والطلبات المخصصة قد تمت إدارتها بعناية."
                />
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  className={[
                    styles.messageItem,
                    selectedMessage?.id === msg.id ? styles.messageItemActive : '',
                    msg.unread ? styles.messageItemUnread : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelect(msg)}
                >
                  <div className={styles.msgItemTop}>
                    <AvatarCircle name={msg.sender} />
                    <div className={styles.msgItemInfo}>
                      <div className={styles.msgItemHeader}>
                        <span className={styles.msgSender}>{msg.sender}</span>
                        <span className={styles.msgTime}>{relativeTime(msg.date)}</span>
                      </div>
                      <div className={styles.msgSubjectRow}>
                        <span className={msg.unread ? styles.msgSubjectUnread : styles.msgSubject}>
                          {msg.subject}
                        </span>
                        {msg.unread ? <span className={styles.unreadDot} aria-label="غير مقروء" /> : null}
                      </div>
                      <p className={styles.msgPreview}>{msg.preview}</p>
                      <div className={styles.msgMeta}>
                        <span className={styles.msgStore}>{msg.store}</span>
                        {msg.urgent ? (
                          <Badge text="عاجل" variant="danger" size="sm" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className={styles.detail}>
          {!currentMsg ? (
            <div className={styles.detailEmpty}>
              <EmptyState
                icon={MessageSquare}
                title="تأمل في التفاصيل"
                description="يرجى اختيار رسالة من القائمة لعرض تفاصيل الحوار وبدء الرد بأناقة تليق بحرفيتنا."
              />
            </div>
          ) : (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <div className={styles.detailHeaderTop}>
                  <h2 className={styles.detailSubject}>{currentMsg.subject}</h2>
                  <Badge
                    text={currentMsg.status}
                    variant={messageStatusMap[currentMsg.status]?.variant || 'default'}
                  />
                </div>
                <div className={styles.detailMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>من:</span>
                    <span className={styles.metaValue}>{currentMsg.sender}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>التاريخ:</span>
                    <span className={styles.metaValue}>{formatDate(currentMsg.date)}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>المتجر:</span>
                    <span className={styles.metaValue}>{currentMsg.store}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>النوع:</span>
                    <Badge text={currentMsg.type} variant={getTypeVariant(currentMsg.type)} size="sm" />
                  </div>
                </div>
              </div>

              <div className={styles.detailBody}>
                <p>{currentMsg.preview}</p>
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
