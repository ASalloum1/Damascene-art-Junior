import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart2,
  ClipboardList,
  MessageSquare,
  Bell,
  Star,
  Settings,
  UserCircle,
} from 'lucide-react';

// Navigation items for the admin sidebar
// 13 items matching the spec exactly, all Arabic labels
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
  },
  {
    id: 'users',
    label: 'إدارة المستخدمين',
    icon: Users,
  },
  {
    id: 'stores',
    label: 'إدارة المتاجر',
    icon: Store,
  },
  {
    id: 'products',
    label: 'إدارة المنتجات',
    icon: Package,
  },
  {
    id: 'orders',
    label: 'إدارة الطلبات',
    icon: ShoppingCart,
  },
  {
    id: 'finance',
    label: 'الإدارة المالية',
    icon: DollarSign,
  },
  {
    id: 'analytics',
    label: 'التقارير والتحليلات',
    icon: BarChart2,
  },
  {
    id: 'activity-log',
    label: 'سجل النشاطات',
    icon: ClipboardList,
  },
  {
    id: 'messages',
    label: 'الرسائل والطلبات',
    icon: MessageSquare,
    badge: 'messages',
  },
  {
    id: 'notifications',
    label: 'إدارة الإشعارات',
    icon: Bell,
    badge: 'notifications',
  },
  {
    id: 'reviews',
    label: 'إدارة التقييمات',
    icon: Star,
    badge: 'reviews',
  },
  {
    id: 'site-settings',
    label: 'إعدادات الموقع',
    icon: Settings,
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: UserCircle,
  },
];
