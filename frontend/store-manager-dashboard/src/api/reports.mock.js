// Mock reports API. Derives plausible data from mockData.js filtered to one
// store. Every export returns a Promise so the call sites are identical to
// the real fetch path.
//
// Filtering is by store **name** because the mock fixture stores name on
// products/orders, not store id. The auth context still resolves the
// matching id so the rest of the surface treats the result as live data.

import { mockProducts, mockOrders, mockUsers, mockStores } from '../data/mockData.js';

// Tiny artificial delay so spinners and Suspense boundaries don't flash.
const NETWORK_DELAY_MS = 220;

function delay(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), NETWORK_DELAY_MS);
  });
}

function findStoreName(storeId) {
  const store = mockStores.find((s) => s.id === storeId);
  return store ? store.name : null;
}

function withinRange(iso, from, to) {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  if (from) {
    const fromT = new Date(from).getTime();
    if (!Number.isNaN(fromT) && t < fromT) return false;
  }
  if (to) {
    const toT = new Date(to).getTime();
    if (!Number.isNaN(toT) && t > toT + 24 * 60 * 60 * 1000 - 1) return false;
  }
  return true;
}

// ── KPIs ─────────────────────────────────────────────────────────────
export function getKpis({ from, to, storeId } = {}) {
  const storeName = findStoreName(storeId);
  const orders = mockOrders.filter(
    (o) => (!storeName || o.store === storeName) && withinRange(o.date, from, to),
  );
  const products = mockProducts.filter((p) => !storeName || p.store === storeName);

  const revenue = orders
    .filter((o) => o.status !== 'ملغي' && o.status !== 'مرتجع')
    .reduce((sum, o) => sum + o.amount, 0);
  const ordersCount = orders.length;
  const avgOrderValue = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;
  const ratingSum = products.reduce((sum, p) => sum + (p.rating || 0), 0);
  const avgRating =
    products.length > 0 ? Number((ratingSum / products.length).toFixed(1)) : 0;

  return delay({ revenue, ordersCount, avgOrderValue, avgRating });
}

// ── Sales trend (last 12 months) ────────────────────────────────────
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export function getSalesTrend({ storeId } = {}) {
  // Deterministic synthetic sales curve seeded from store id so different
  // managers see different shapes.
  const seed =
    String(storeId || 's0')
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) || 1;
  const data = MONTHS_AR.map((name, i) => {
    const base = 18000 + ((seed * (i + 3)) % 28000);
    const swing = Math.round(Math.sin((i + seed) * 0.7) * 6000);
    return { name, sales: Math.max(8000, base + swing) };
  });
  return delay(data);
}

// ── Sales by category ────────────────────────────────────────────────
export function getSalesByCategory({ storeId } = {}) {
  const storeName = findStoreName(storeId);
  const products = mockProducts.filter((p) => !storeName || p.store === storeName);
  const totals = new Map();
  for (const p of products) {
    const revenue = (p.price || 0) * (p.reviewCount || 0);
    totals.set(p.category, (totals.get(p.category) || 0) + revenue);
  }
  const sumAll = [...totals.values()].reduce((s, v) => s + v, 0) || 1;
  const data = [...totals.entries()]
    .map(([name, value]) => ({
      name,
      value: Math.max(1, Math.round((value / sumAll) * 100)),
    }))
    .sort((a, b) => b.value - a.value);
  return delay(data);
}

// ── Geographic distribution (synthetic) ─────────────────────────────
export function getGeographic({ storeId } = {}) {
  const cities = [
    { name: 'دمشق', weight: 5 },
    { name: 'حلب', weight: 3 },
    { name: 'اللاذقية', weight: 2 },
    { name: 'حمص', weight: 1.5 },
    { name: 'دير الزور', weight: 1 },
  ];
  const seed =
    String(storeId || 's0')
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) || 1;
  const totalW = cities.reduce((s, c) => s + c.weight, 0);
  const data = cities.map((c, i) => {
    const base = Math.round((c.weight / totalW) * 100);
    const jitter = ((seed + i * 7) % 6) - 3;
    return { name: c.name, value: Math.max(1, base + jitter) };
  });
  // Re-normalize so the bars feel like a percentage breakdown.
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  for (const d of data) {
    d.value = Math.round((d.value / sum) * 100);
  }
  return delay(data);
}

// ── Customer acquisition ────────────────────────────────────────────
export function getCustomerAcquisition({ storeId } = {}) {
  const seed =
    String(storeId || 's0')
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) || 1;
  const data = MONTHS_AR.map((name, i) => {
    const fresh = 20 + ((seed + i * 11) % 90);
    const repeat = 60 + ((seed * 2 + i * 13) % 160);
    return { name, new: fresh, returning: repeat };
  });
  return delay(data);
}

// ── Product report ───────────────────────────────────────────────────
export function getProducts({ storeId } = {}) {
  const storeName = findStoreName(storeId);
  const data = mockProducts
    .filter((p) => !storeName || p.store === storeName)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      sold: p.reviewCount || 0,
      revenue: (p.price || 0) * (p.reviewCount || 0),
      rating: p.rating || 0,
    }));
  return delay(data);
}

// ── Customer report ──────────────────────────────────────────────────
export function getCustomers({ storeId, from, to } = {}) {
  const storeName = findStoreName(storeId);
  const orders = mockOrders.filter(
    (o) => (!storeName || o.store === storeName) && withinRange(o.date, from, to),
  );

  // Aggregate per email so the same shopper across orders collapses.
  const map = new Map();
  for (const o of orders) {
    const key = o.email;
    const prev = map.get(key) || {
      id: key,
      fullName: o.customer,
      email: o.email,
      ordersCount: 0,
      totalSpend: 0,
    };
    prev.ordersCount += 1;
    if (o.status !== 'ملغي' && o.status !== 'مرتجع') {
      prev.totalSpend += o.amount;
    }
    map.set(key, prev);
  }

  // Enrich any missing names from mockUsers.
  for (const u of mockUsers) {
    const entry = map.get(u.email);
    if (entry) {
      entry.fullName = `${u.firstName} ${u.lastName}`;
    }
  }

  const data = [...map.values()].map((c) => ({
    ...c,
    // Naive LTV projection — keeps the shape lifelike without inventing data.
    ltv: Math.round(c.totalSpend * 1.6),
  }));

  data.sort((a, b) => b.totalSpend - a.totalSpend);
  return delay(data);
}

// ── Order report ─────────────────────────────────────────────────────
export function getOrders({ storeId, from, to } = {}) {
  const storeName = findStoreName(storeId);
  const data = mockOrders
    .filter((o) => (!storeName || o.store === storeName) && withinRange(o.date, from, to))
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer,
      amount: o.amount,
      paymentMethod: o.paymentMethod,
      status: o.status,
      date: o.date,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return delay(data);
}
