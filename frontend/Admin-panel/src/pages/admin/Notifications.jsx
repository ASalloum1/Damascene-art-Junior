import { useState, useMemo } from 'react';
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  UserPlus,
  Settings,
  CheckCheck,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mockNotifications } from '../../data/mockData.js';
import { relativeTime } from '../../utils/formatters.js';
import styles from './Notifications.module.css';

const MAIN_TABS = [
  { id: 'center', label: 'مركز الإشعارات' },
  { id: 'settings', label: 'إعدادات الإشعارات' },
];

const FILTER_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'unread', label: 'غير مقروءة' },
  { id: 'order', label: 'طلبات' },
  { id: 'alert', label: 'تنبيهات' },
  { id: 'message', label: 'رسائل' },
  { id: 'financial', label: 'مالية' },
];

const NOTIFICATION_EVENTS = [
  { id: 'new_order', label: 'طلب جديد' },
  { id: 'cancelled_order', label: 'طلب ملغي' },
  { id: 'low_stock', label: 'مخزون منخفض' },
  { id: 'new_review', label: 'تقييم جديد' },
  { id: 'new_message', label: 'رسالة جديدة' },
  { id: 'new_user', label: 'مستخدم جديد' },
  { id: 'large_transaction', label: 'عملية مالية كبيرة' },
  { id: 'suspicious_login', label: 'محاولة دخول مشبوهة' },
];

/**
 * Initial state for notification settings.
 * Memoized outside the component or used in lazy initialization.
 */
const INITIAL_SETTINGS = () =>
  NOTIFICATION_EVENTS.reduce((acc, ev) => {
    acc[ev.id] = { email: true, site: true, push: false };
    return acc;
  }, {});

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

function getNotifTypeLabel(type) {
  const map = {
    order: 'طلب',
    alert: 'تنبيه',
    message: 'رسالة',
    financial: 'مالية',
    user: 'مستخدم',
  };
  return map[type] || type;
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[styles.toggle, checked ? styles.toggleOn : ''].filter(Boolean).join(' ')}
      aria-label="تغيير حالة الإشعار"
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [mainTab, setMainTab] = useState('center');
  const [filterTab, setFilterTab] = useState('all');
  const [notifications, setNotifications] = useState(() => mockNotifications);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

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

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => n.read ? n : { ...n, read: true }));
    showToast({ message: 'تم تحديد جميع الإشعارات كمقروءة', type: 'success' });
  }

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n))
    );
  }

  function updateSetting(eventId, channel, value) {
    setSettings((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [channel]: value },
    }));
  }

  function saveSettings() {
    showToast({ message: 'تم حفظ إعدادات الإشعارات بنجاح', type: 'success' });
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

        {mainTab === 'settings' ? (
          <div className={styles.settingsContent}>
            <p className={styles.settingsDesc}>
              حدد القنوات التي تريد تلقي الإشعارات عبرها لكل نوع من الأحداث.
            </p>
            <div className={styles.settingsTable}>
              <div className={styles.settingsHeader}>
                <span className={styles.settingsEventCol}>الحدث</span>
                <span className={styles.settingsChannelCol}>البريد الإلكتروني</span>
                <span className={styles.settingsChannelCol}>الموقع</span>
                <span className={styles.settingsChannelCol}>الجوال</span>
              </div>
              {NOTIFICATION_EVENTS.map((ev) => (
                <div key={ev.id} className={styles.settingsRow}>
                  <span className={styles.settingsEventName}>{ev.label}</span>
                  <div className={styles.settingsChannelCol}>
                    <ToggleSwitch
                      checked={settings[ev.id]?.email ?? false}
                      onChange={(v) => updateSetting(ev.id, 'email', v)}
                    />
                  </div>
                  <div className={styles.settingsChannelCol}>
                    <ToggleSwitch
                      checked={settings[ev.id]?.site ?? false}
                      onChange={(v) => updateSetting(ev.id, 'site', v)}
                    />
                  </div>
                  <div className={styles.settingsChannelCol}>
                    <ToggleSwitch
                      checked={settings[ev.id]?.push ?? false}
                      onChange={(v) => updateSetting(ev.id, 'push', v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.settingsFooter}>
              <Button variant="primary" icon={Settings} onClick={saveSettings}>
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
