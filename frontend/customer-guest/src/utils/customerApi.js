import { API_CONFIG } from '../config/api.config.js';

export function getDefaultHeaders() {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
  };
}

export function getAuthHeaders(token) {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

export async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function normalizeImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  let normalized = imageUrl;

  if (normalized.includes('ngrok') && normalized.includes('/storage/')) {
    const storageIndex = normalized.indexOf('/storage/');
    normalized = normalized.substring(storageIndex);
  } else if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
    normalized = `/storage/${normalized}`;
  }

  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export function mapApiProduct(product = {}) {
  const mappedPrice = parseFloat(product.new_price ?? product.price ?? 0) || 0;
  const mappedOldPrice = parseFloat(product.old_price ?? 0) || undefined;
  const mappedRating = parseFloat(product.average_rate ?? product.rating ?? 0) || 0;

  return {
    id: product.id,
    name: product.name,
    cat: product.category?.name || product.category_name || '',
    category: product.category?.name || product.category_name || '',
    price: mappedPrice,
    oldPrice: mappedOldPrice,
    originalPrice: mappedOldPrice,
    image: normalizeImageUrl(product.image),
    rating: mappedRating,
    reviews: product.review_count ?? product.reviews_count ?? 0,
    inStock: Number(product.amount ?? product.stock ?? 0) > 0,
    amount: Number(product.amount ?? product.stock ?? 0),
    status: product.status,
    badge: product.status_label ?? '',
    storeName: product.store?.name || '',
  };
}
