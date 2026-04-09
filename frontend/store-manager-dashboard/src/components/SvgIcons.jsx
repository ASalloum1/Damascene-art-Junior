/**
 * Damascene Art — Icon System
 * Now unified to use 'lucide-react' as requested.
 * Usage: <Icon name="dashboard" size={20} />
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Home, 
  ShoppingCart, 
  BarChart2, 
  Star, 
  Bell, 
  Settings, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Edit,
  Trash2,
  Eye,
  Check,
  RotateCcw,
  User,
  DollarSign,
  Box,
  Users,
  TrendingUp,
  Globe,
  Store,
  AlertTriangle,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

const iconsMap = {
  dashboard: LayoutDashboard,
  products: Package,
  inventory: Home,
  orders: ShoppingCart,
  reports: BarChart2,
  reviews: Star,
  notifications: Bell,
  settings: Settings,
  messages: MessageSquare,
  bell: Bell,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  menu: Menu,
  close: X,
  edit: Edit,
  trash: Trash2,
  eye: Eye,
  check: Check,
  x: X,
  reply: RotateCcw,
  warning: AlertTriangle,
  image: ImageIcon,
  plus: Plus,
  user: User,
  dollar: DollarSign,
  box: Box,
  users: Users,
  trendUp: TrendingUp,
  globe: Globe,
  store: Store,
};

export function Icon({ name, size = 18, className = '', style = {}, 'aria-hidden': ariaHidden = true }) {
  const IconComponent = iconsMap[name];
  if (!IconComponent) return null;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={ariaHidden}
    >
      <IconComponent size={size} strokeWidth={2} />
    </span>
  );
}

export default Icon;
