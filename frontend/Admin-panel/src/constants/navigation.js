import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart2,
  MessageSquare,
  Bell,
  Star,
  UserCircle,
  TicketPercent,
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
    id: 'profile',
    label: 'الملف الشخصي',
    icon: UserCircle,
  },
  {
    id: 'coupons',
    label: 'إدارة الكوبونات',
    icon: TicketPercent,
  },
];
