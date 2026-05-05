import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  UserPlus,
  CheckCheck,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { relativeTime } from '../../utils/formatters.js';
import { useAdmin } from '../../context/AdminContext.jsx';
import { API_CONFIG } from '../../config/api.config.js';
import { apiRequest, getNotificationTypeLabel } from '../../utils/adminApi.js';
import styles from './Notifications.module.css';

const MAIN_TABS = [
  { id: 'center', label: 'مركز الإشعارات' },
];

const FILTER_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'unread', label: 'غير مقروءة' },
  { id: 'order', label: 'طلبات' },
  { id: 'alert', label: 'تنبيهات' },
  { id: 'message', label: 'رسائل' },
  { id: 'financial', label: 'مالية' },
];


function getNotifIcon(type) {
  const map = {
    order: ShoppingCart,
    alert: AlertTriangle,
    message: MessageSquare,
    financial: DollarSign,
    user: UserPlus,
  };
  return map[type] || Bell;
}

function getNotifVariant(type) {
  const map = {
    order: 'info',
    alert: 'warning',
    message: 'gold',
    financial: 'success',
    user: 'purple',
  };
  return map[type] || 'default';
}

function getNotifIconColor(type) {
  const map = {
    order: 'var(--color-blue)',
    alert: 'var(--color-orange)',
    message: 'var(--color-gold)',
    financial: 'var(--color-green)',
    user: 'var(--color-purple)',
  };
  return map[type] || 'var(--color-text-secondary)';
}

function getNotifIconBg(type) {
  const map = {
    order: 'var(--color-blue-bg)',
    alert: 'var(--color-orange-bg)',
    message: 'var(--color-gold-bg)',
    financial: 'var(--color-green-bg)',
    user: 'var(--color-purple-bg)',
  };
  return map[type] || 'var(--color-cream-dark)';
}

export default function NotificationsPage() {
  const { showToast } = useToast();
  const { notifications: contextNotifications, refreshBadgeCounts, refreshNotifications } = useAdmin();
  const [mainTab, setMainTab] = useState('center');
  const [filterTab, setFilterTab] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(contextNotifications);
  }, [contextNotifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'unread') return !n.read;
      return n.type === filterTab;
    });
  }, [notifications, filterTab]);

  const filterTabsWithCounts = useMemo(() => 
    FILTER_TABS.map((t) => ({
      ...t,
      count:
        t.id === 'all'
          ? undefined
          : t.id === 'unread'
          ? notifications.filter((n) => !n.read).length || undefined
          : undefined,
    })), [notifications]);

  async function markAllRead() {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.notificationsReadAll, {
        method: 'POST',
        body: {},
      });
      await Promise.all([refreshNotifications(), refreshBadgeCounts()]);
      showToast({ message: 'تم تحديد جميع الإشعارات كمقروءة', type: 'success' });
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث الإشعارات', type: 'error' });
    }
  }

  async function markRead(id) {
    const item = notifications.find((notification) => notification.id === id);

    if (!item || item.read) {
      return;
    }

    try {
      await apiRequest(API_CONFIG.ENDPOINTS.notificationRead(id), {
        method: 'POST',
        body: {},
      });
      await Promise.all([refreshNotifications(), refreshBadgeCounts()]);
    } catch (error) {
      showToast({ message: error.message || 'تعذر تحديث الإشعار', type: 'error' });
    }
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <header className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Bell size={35} strokeWidth={2} />
        </div>
        <h1 className={styles.pageTitle}>إدارة الإشعارات</h1>
        {unreadCount > 0 ? (
          <span className={styles.unreadBadge} aria-label={`${unreadCount} إشعارات غير مقروءة`}>
            {unreadCount}
          </span>
        ) : null}
      </header>

      <section className={styles.card}>
        <nav className={styles.mainTabsRow}>
          <Tabs tabs={MAIN_TABS} activeTab={mainTab} onChange={setMainTab} variant="underline" />
        </nav>

        {mainTab === 'center' ? (
          <div className={styles.centerContent}>
            <div className={styles.centerToolbar}>
              <Tabs
                tabs={filterTabsWithCounts}
                activeTab={filterTab}
                onChange={setFilterTab}
                variant="pills"
              />
              <Button
                variant="outline"
                size="sm"
                icon={CheckCheck}
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                تحديد الكل كمقروء
              </Button>
            </div>

            <div className={styles.notifList} role="list" aria-label="قائمة الإشعارات">
              {filtered.length === 0 ? (
                <div className={styles.notifEmpty}>
                  <EmptyState
                    icon={Bell}
                    title="سكون في الأرجاء"
                    description="لا توجد تنبيهات جديدة في الوقت الحالي. سيتم إعلامك فور حدوث أي مستجدات تتعلق بالقطع التراثية."
                  />
                </div>
              ) : (
                filtered.map((notif, index) => {
                  const Icon = getNotifIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      role="listitem"
                      className={[
                        styles.notifItem,
                        !notif.read ? styles.notifItemUnread : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => markRead(notif.id)}
                      style={{ '--item-index': index }}
                    >
                      <div
                        className={styles.notifIconCircle}
                        style={{
                          backgroundColor: getNotifIconBg(notif.type),
                          color: getNotifIconColor(notif.type),
                        }}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <div className={styles.notifBody}>
                        <div className={styles.notifTitleRow}>
                          <span className={styles.notifTitle}>{notif.title}</span>
                          <Badge
                            text={getNotifTypeLabel(notif.type)}
                            variant={getNotifVariant(notif.type)}
                            size="sm"
                          />
                        </div>
                        <p className={styles.notifDesc}>{notif.description}</p>
                        <span className={styles.notifTime}>{relativeTime(notif.timestamp)}</span>
                      </div>
                      {!notif.read ? (
                        <span className={styles.unreadDot} aria-label="غير مقروء" />
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

      </section>
    </div>
  );
}
