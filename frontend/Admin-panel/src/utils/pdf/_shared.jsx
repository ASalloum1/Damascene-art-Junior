// Shared PDF chrome: header (brand band + meta strip) and footer (copyright +
// page X of Y). Reused by every admin PDF document so headers and footers stay
// visually consistent.

import { Text, View } from '@react-pdf/renderer';
import { formatDate, toArabicNum } from '../formatters.js';
import { styles, PDF_COLORS } from './theme.js';
import './fonts.js';

/**
 * Brand band + optional meta strip showing the report date and any active
 * filters (date, store, type, search). Pass `meta` items as `{ label, value }`
 * pairs to render extra strip entries.
 *
 * Props:
 * - title: string (required)            — large headline (e.g. "تقرير مالي شامل")
 * - subtitle?: string                   — small line under the brand word
 * - generatedAt?: Date | string         — defaults to "now"
 * - meta?: Array<{ label, value }>      — additional meta strip entries
 * - filters?: Record<string, string>    — convenience: rendered as meta entries
 */
export function ReportHeader({
  title,
  subtitle = 'الفن الدمشقي - لوحة التحكم الإدارية',
  generatedAt,
  meta = [],
  filters,
}) {
  const generated = generatedAt ? new Date(generatedAt) : new Date();
  const generatedLabel = formatDate(generated.toISOString());

  const filterEntries = filters
    ? Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([label, value]) => ({ label, value: String(value) }))
    : [];

  const metaItems = [
    { label: 'تاريخ الإصدار', value: generatedLabel },
    ...filterEntries,
    ...meta,
  ];

  return (
    <View>
      <View style={styles.brandBand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandGlyph}>د</Text>
          <View>
            <Text style={styles.brandWord}>الفن الدمشقي</Text>
            <Text style={styles.brandTag}>{subtitle}</Text>
          </View>
        </View>
        <Text style={styles.h1}>{title}</Text>
      </View>

      {metaItems.length > 0 && (
        <View style={styles.metaStrip}>
          {metaItems.map((item, idx) => (
            <View key={`${item.label}-${idx}`} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{item.label}:</Text>
              <Text style={styles.metaValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Fixed-position page footer with a copyright line and "page X of Y" pager.
 * Renders on every page via `fixed` + the `render` callback for the page
 * counter.
 */
export function ReportFooter({ note = '© ٢٠٢٦ الفن الدمشقي - جميع الحقوق محفوظة' }) {
  return (
    <View style={styles.footer} fixed>
      <Text
        style={styles.footerPager}
        render={({ pageNumber, totalPages }) =>
          `صفحة ${toArabicNum(pageNumber)} من ${toArabicNum(totalPages)}`
        }
      />
      <Text style={styles.footerText}>{note}</Text>
    </View>
  );
}

/**
 * Section header used between tables / blocks: small gold bar + bold navy title.
 */
export function SectionHeader({ children }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.h2}>{children}</Text>
      <View style={styles.sectionBar} />
    </View>
  );
}

/**
 * Status pill — chooses a colour family from a coarse intent string.
 */
export function StatusPill({ text, intent = 'neutral' }) {
  const variantStyle =
    intent === 'success'
      ? styles.pillSuccess
      : intent === 'danger'
      ? styles.pillDanger
      : intent === 'warning'
      ? styles.pillWarning
      : styles.pillNeutral;

  return <Text style={[styles.pill, variantStyle]}>{text}</Text>;
}

export { PDF_COLORS };
