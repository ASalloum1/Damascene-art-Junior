import { useState, useCallback } from 'react';

const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;

export function validateCouponForm(form, existingCodes = []) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'اسم الكوبون مطلوب';
  }

  const code = form.code?.trim().toUpperCase() ?? '';
  if (!code) {
    errors.code = 'رمز الكوبون مطلوب';
  } else if (!CODE_PATTERN.test(code)) {
    errors.code = 'يجب أن يحتوي الرمز على أحرف إنجليزية أو أرقام (3-20 حرف)';
  } else if (existingCodes.some((c) => c.toUpperCase() === code)) {
    errors.code = 'هذا الرمز مستخدم بالفعل، اختر رمزاً آخر';
  }

  if (form.type !== 'fixed' && form.type !== 'percentage') {
    errors.type = 'نوع الكوبون مطلوب';
  }

  const valueNum = Number(form.value);
  if (form.value === '' || form.value === null || form.value === undefined || Number.isNaN(valueNum)) {
    errors.value = 'القيمة مطلوبة ويجب أن تكون رقماً';
  } else if (valueNum <= 0) {
    errors.value = 'يجب أن تكون القيمة أكبر من صفر';
  } else if (form.type === 'percentage' && valueNum > 100) {
    errors.value = 'النسبة المئوية لا يمكن أن تتجاوز ١٠٠٪';
  }

  if (form.audience !== 'public' && form.audience !== 'vip') {
    errors.audience = 'يرجى اختيار نوع الجمهور';
  } else if (form.audience === 'vip' && (!Array.isArray(form.customerIds) || form.customerIds.length === 0)) {
    errors.customerIds = 'اختر عميل VIP واحداً على الأقل';
  }

  return errors;
}

function normalize(form) {
  const audience = form.audience === 'vip' ? 'vip' : 'public';
  return {
    name:        form.name.trim(),
    code:        form.code.trim().toUpperCase(),
    type:        form.type,
    value:       Number(form.value),
    audience,
    customerIds: audience === 'vip' ? [...(form.customerIds ?? [])] : [],
  };
}

export function useCoupons(initial = []) {
  const [coupons, setCoupons] = useState(initial);

  const addCoupon = useCallback((form) => {
    const data = normalize(form);
    const newCoupon = {
      id:        crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    return newCoupon;
  }, []);

  const updateCoupon = useCallback((id, form) => {
    const data = normalize(form);
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteCoupon = useCallback((id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
  };
}
