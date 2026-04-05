import { COLORS } from './colors.js';

// Status → { color, bg, label } mappings
// Colors use COLORS constants (hex) for Badge component inline use

export const orderStatusMap = {
  pending: {
    label: 'قيد الانتظار',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
  confirmed: {
    label: 'مؤكد',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  processing: {
    label: 'قيد المعالجة',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  shipped: {
    label: 'تم الشحن',
    color: COLORS.purple,
    bg: `${COLORS.purple}22`,
    variant: 'purple',
  },
  delivered: {
    label: 'تم التسليم',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  cancelled: {
    label: 'ملغي',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  refunded: {
    label: 'مسترجع',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
};

export const userRoleMap = {
  admin: {
    label: 'مشرف',
    color: COLORS.gold,
    bg: `${COLORS.gold}26`,
    variant: 'gold',
  },
  seller: {
    label: 'بائع',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  buyer: {
    label: 'مشتري',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  moderator: {
    label: 'مشرف محتوى',
    color: COLORS.purple,
    bg: `${COLORS.purple}22`,
    variant: 'purple',
  },
};

export const userStatusMap = {
  active: {
    label: 'نشط',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  inactive: {
    label: 'غير نشط',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
  banned: {
    label: 'محظور',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  pending: {
    label: 'معلق',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
};

export const productStatusMap = {
  active: {
    label: 'نشط',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  inactive: {
    label: 'غير نشط',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
  out_of_stock: {
    label: 'نفذ من المخزن',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  draft: {
    label: 'مسودة',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
};

export const productCategoryMap = {
  calligraphy: {
    label: 'خط عربي',
    color: COLORS.gold,
    bg: `${COLORS.gold}26`,
    variant: 'gold',
  },
  mosaic: {
    label: 'فسيفساء',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  brocade: {
    label: 'برقليون',
    color: COLORS.purple,
    bg: `${COLORS.purple}22`,
    variant: 'purple',
  },
  ceramics: {
    label: 'خزفيات',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
  painting: {
    label: 'لوحات فنية',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  woodwork: {
    label: 'أعمال خشبية',
    color: COLORS.goldDark,
    bg: `${COLORS.goldDark}22`,
    variant: 'default',
  },
};

export const activityActionMap = {
  create: {
    label: 'إنشاء',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  update: {
    label: 'تعديل',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  delete: {
    label: 'حذف',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  login: {
    label: 'تسجيل دخول',
    color: COLORS.purple,
    bg: `${COLORS.purple}22`,
    variant: 'purple',
  },
  logout: {
    label: 'تسجيل خروج',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
  approve: {
    label: 'موافقة',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  reject: {
    label: 'رفض',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  export: {
    label: 'تصدير',
    color: COLORS.gold,
    bg: `${COLORS.gold}26`,
    variant: 'gold',
  },
};

export const transactionTypeMap = {
  sale: {
    label: 'بيع',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  refund: {
    label: 'استرداد',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  commission: {
    label: 'عمولة',
    color: COLORS.gold,
    bg: `${COLORS.gold}26`,
    variant: 'gold',
  },
  withdrawal: {
    label: 'سحب',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
  deposit: {
    label: 'إيداع',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
};

export const reviewStatusMap = {
  approved: {
    label: 'معتمد',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  pending: {
    label: 'قيد المراجعة',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
  rejected: {
    label: 'مرفوض',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  hidden: {
    label: 'مخفي',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
};

export const messageStatusMap = {
  unread: {
    label: 'غير مقروء',
    color: COLORS.blue,
    bg: `${COLORS.blue}22`,
    variant: 'info',
  },
  read: {
    label: 'مقروء',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
  replied: {
    label: 'تمت الإجابة',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  archived: {
    label: 'مؤرشف',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
};

export const storeStatusMap = {
  active: {
    label: 'نشط',
    color: COLORS.green,
    bg: `${COLORS.green}22`,
    variant: 'success',
  },
  inactive: {
    label: 'غير نشط',
    color: COLORS.textSecondary,
    bg: `${COLORS.textSecondary}22`,
    variant: 'default',
  },
  suspended: {
    label: 'موقوف',
    color: COLORS.red,
    bg: `${COLORS.red}22`,
    variant: 'danger',
  },
  pending: {
    label: 'قيد المراجعة',
    color: COLORS.orange,
    bg: `${COLORS.orange}22`,
    variant: 'warning',
  },
};
