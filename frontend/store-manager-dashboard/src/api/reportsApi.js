// Selector glue for the reports surface. Picks live or mock implementation
// at module evaluation time based on `VITE_REPORTS_USE_MOCK`.
//
// Default is mock-mode UNLESS the env var is explicitly 'false'. This lets
// the page render meaningfully even before the backend ships (per spec).
//
//   VITE_REPORTS_USE_MOCK !== 'false' → mock (default)
//   VITE_REPORTS_USE_MOCK === 'false' → live
//
// The flag is intentionally inverted (default to mock) because the live
// endpoints aren't implemented yet — see the spec backend section.

import * as liveApi from './reports.js';
import * as mockApi from './reports.mock.js';

const useLive = import.meta.env.VITE_REPORTS_USE_MOCK === 'false';
const impl = useLive ? liveApi : mockApi;

export const isMockMode = !useLive;

/**
 * getReports — single boundary that fans out parallel fetches for the
 * entire reports surface. Returns a typed shape so callers can destructure
 * without juggling promise order.
 *
 * @param {{ from: string, to: string, storeId?: string|null, token?: string|null, signal?: AbortSignal }} args
 */
export async function getReports(args) {
  const [
    kpis,
    salesTrend,
    salesByCategory,
    geographic,
    customerAcquisition,
    products,
    customers,
    orders,
  ] = await Promise.all([
    impl.getKpis(args),
    impl.getSalesTrend(args),
    impl.getSalesByCategory(args),
    impl.getGeographic(args),
    impl.getCustomerAcquisition(args),
    impl.getProducts(args),
    impl.getCustomers(args),
    impl.getOrders(args),
  ]);

  return {
    kpis,
    salesTrend,
    salesByCategory,
    geographic,
    customerAcquisition,
    products,
    customers,
    orders,
  };
}
