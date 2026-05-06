// Real reports API client. Talks to the Laravel backend.
//
// Every endpoint scopes by the authenticated manager's store via the bearer
// token — clients send NO `store_id` parameter.

import { apiFetch } from './_client.js';

const BASE = '/api/store-manager/reports';

/**
 * Build the query object for a date range.
 * @param {{ from?: string, to?: string }} range — ISO date strings
 */
function rangeQuery(range = {}) {
  const { from, to } = range;
  return { from, to };
}

export function getKpis({ from, to, token, signal }) {
  return apiFetch(`${BASE}/kpis`, { query: rangeQuery({ from, to }), token, signal });
}

export function getSalesTrend({ from, to, granularity = 'month', token, signal }) {
  return apiFetch(`${BASE}/sales-trend`, {
    query: { ...rangeQuery({ from, to }), granularity },
    token,
    signal,
  });
}

export function getSalesByCategory({ from, to, token, signal }) {
  return apiFetch(`${BASE}/sales-by-category`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}

export function getGeographic({ from, to, token, signal }) {
  return apiFetch(`${BASE}/geographic`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}

export function getCustomerAcquisition({ from, to, token, signal }) {
  return apiFetch(`${BASE}/customer-acquisition`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}

export function getProducts({ from, to, token, signal }) {
  return apiFetch(`${BASE}/products`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}

export function getCustomers({ from, to, token, signal }) {
  return apiFetch(`${BASE}/customers`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}

export function getOrders({ from, to, token, signal }) {
  return apiFetch(`${BASE}/orders`, {
    query: rangeQuery({ from, to }),
    token,
    signal,
  });
}
