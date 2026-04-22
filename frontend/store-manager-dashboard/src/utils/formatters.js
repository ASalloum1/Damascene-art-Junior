// Formatters — Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) for all displayed data

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Western Arabic digits (0-9) to Eastern Arabic numerals (٠-٩)
 * @param {number|string} num
 * @returns {string}
 */
export function toArabicNum(num) {
  return String(num).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d, 10)]);
}

/**
 * Formats a number with commas (Eastern Arabic numerals)
 * @param {number} num
 * @returns {string}  e.g. ١,٢٤٥
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const formatted = Number(num).toLocaleString('en-US');
  return toArabicNum(formatted);
}

/**
 * Formats currency with Arabic numerals + $ suffix
 * @param {number} amount
 * @returns {string}  e.g. ١٢٥,٤٣٠ $
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const formatted = Number(amount).toLocaleString('en-US');
  return `${toArabicNum(formatted)} $`;
}

/**
 * Formats a date string as DD/MM/YYYY in Eastern Arabic numerals
 * @param {string} dateStr — ISO date string
 * @returns {string}  e.g. ٠٣/٠٤/٢٠٢٦
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return toArabicNum(`${day}/${month}/${year}`);
  } catch {
    return '—';
  }
}

/**
 * Formats a date string as time with Arabic AM/PM indicator
 * @param {string} dateStr — ISO date string
 * @returns {string}  e.g. ١٠:٣٢ ص or ٠٤:٤٥ م
 */
export function formatTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const isPM = hours >= 12;
    const displayHour = String(hours % 12 || 12).padStart(2, '0');
    const ampm = isPM ? 'م' : 'ص';
    return `${toArabicNum(displayHour)}:${toArabicNum(minutes)} ${ampm}`;
  } catch {
    return '—';
  }
}

/**
 * Returns a relative time string in Arabic
 * Breakpoints: <1min → "الآن", <60min → minutes, <24h → hours, yesterday → "أمس", else full date
 * @param {string} dateStr — ISO date string
 * @returns {string}
 */
export function relativeTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'الآن';

    if (diffMin < 60) {
      const n = toArabicNum(diffMin);
      if (diffMin === 1) return 'منذ دقيقة';
      if (diffMin === 2) return 'منذ دقيقتين';
      if (diffMin <= 10) return `منذ ${n} دقائق`;
      return `منذ ${n} دقيقة`;
    }

    if (diffHours < 24) {
      const n = toArabicNum(diffHours);
      if (diffHours === 1) return 'منذ ساعة';
      if (diffHours === 2) return 'منذ ساعتين';
      if (diffHours <= 10) return `منذ ${n} ساعات`;
      return `منذ ${n} ساعة`;
    }

    if (diffDays === 1) return 'أمس';

    return formatDate(dateStr);
  } catch {
    return '—';
  }
}

/**
 * Truncates text to maxLength characters with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
}
