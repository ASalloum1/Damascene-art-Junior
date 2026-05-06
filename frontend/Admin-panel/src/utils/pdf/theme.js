// Shared StyleSheet for all admin PDFs.
//
// PDF rendering does not honour CSS `direction: rtl`. To get right-to-left
// flow we use `flexDirection: 'row-reverse'` on every horizontal flex row
// (see `rtlRow`) and `textAlign: 'right'` on text cells.
//
// Tokens mirror the project's design system (`COLORS` from
// `src/constants/colors.js`) so PDFs feel like the rest of the admin panel.

import { StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../../constants/colors.js';

export const PDF_COLORS = {
  navy: COLORS.navy,
  navyMid: COLORS.navyMid,
  gold: COLORS.gold,
  goldDark: COLORS.goldDark,
  goldLight: COLORS.goldLight,
  cream: COLORS.cream,
  creamDark: COLORS.creamDark,
  white: COLORS.white,
  red: COLORS.red,
  green: COLORS.green,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  divider: '#E8DFCF',
};

export const styles = StyleSheet.create({
  // ── Page ─────────────────────────────────────────────────────────────
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontFamily: 'Tajawal',
    fontSize: 10,
    color: PDF_COLORS.textPrimary,
    backgroundColor: PDF_COLORS.white,
  },

  // ── RTL helpers ──────────────────────────────────────────────────────
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlBetween: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  leftText: {
    textAlign: 'left',
  },

  // ── Headings ─────────────────────────────────────────────────────────
  h1: {
    fontSize: 20,
    fontWeight: 700,
    color: PDF_COLORS.navy,
    textAlign: 'right',
  },
  h2: {
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.navy,
    textAlign: 'right',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: PDF_COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Header brand band ────────────────────────────────────────────────
  brandBand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.gold,
    borderBottomStyle: 'solid',
  },
  brandMark: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  brandGlyph: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: PDF_COLORS.navy,
    color: PDF_COLORS.gold,
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    paddingTop: 6,
    marginLeft: 8,
  },
  brandWord: {
    fontSize: 12,
    fontWeight: 700,
    color: PDF_COLORS.navy,
    textAlign: 'right',
  },
  brandTag: {
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 1,
  },

  // ── Meta strip (date, filters) ───────────────────────────────────────
  metaStrip: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    backgroundColor: PDF_COLORS.cream,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    rowGap: 4,
    columnGap: 14,
  },
  metaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: PDF_COLORS.gold,
    marginLeft: 4,
    textAlign: 'right',
  },
  metaValue: {
    fontSize: 9,
    color: PDF_COLORS.navy,
    fontWeight: 700,
    textAlign: 'right',
  },

  // ── KPI grid ─────────────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginBottom: 18,
    marginHorizontal: -3,
  },
  kpiCard: {
    width: '25%',
    paddingHorizontal: 3,
  },
  kpiCardInner: {
    backgroundColor: PDF_COLORS.cream,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRightWidth: 0,
    borderTopWidth: 2,
    borderTopColor: PDF_COLORS.gold,
    borderTopStyle: 'solid',
  },
  kpiLabel: {
    fontSize: 8,
    color: PDF_COLORS.navy,
    fontWeight: 700,
    textAlign: 'right',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 13,
    color: PDF_COLORS.goldDark,
    fontWeight: 700,
    textAlign: 'right',
  },
  kpiSubtle: {
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Section header (bar + title) ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  sectionBar: {
    width: 3,
    height: 12,
    backgroundColor: PDF_COLORS.gold,
    marginLeft: 6,
    borderRadius: 1,
  },

  // ── Tables ───────────────────────────────────────────────────────────
  table: {
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: PDF_COLORS.divider,
    borderStyle: 'solid',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: PDF_COLORS.navy,
    color: PDF_COLORS.white,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 9,
    color: PDF_COLORS.white,
    fontWeight: 700,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.divider,
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    backgroundColor: PDF_COLORS.cream,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 9,
    color: PDF_COLORS.textPrimary,
    textAlign: 'right',
    paddingHorizontal: 4,
  },

  // ── Pills (status chips) ─────────────────────────────────────────────
  pill: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 8,
    fontWeight: 700,
  },
  pillSuccess: {
    backgroundColor: '#E6F5EC',
    color: PDF_COLORS.green,
  },
  pillDanger: {
    backgroundColor: '#FCEAE7',
    color: PDF_COLORS.red,
  },
  pillWarning: {
    backgroundColor: '#FCF3DA',
    color: '#8A6D1A',
  },
  pillNeutral: {
    backgroundColor: PDF_COLORS.cream,
    color: PDF_COLORS.navy,
  },

  // ── Amounts ──────────────────────────────────────────────────────────
  amountPositive: {
    color: PDF_COLORS.green,
    fontWeight: 700,
  },
  amountNegative: {
    color: PDF_COLORS.red,
    fontWeight: 700,
  },

  // ── Definition list (single-tx PDF) ──────────────────────────────────
  defList: {
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.divider,
    borderTopStyle: 'solid',
  },
  defRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.divider,
    borderBottomStyle: 'solid',
  },
  defLabel: {
    width: '38%',
    fontSize: 9,
    color: PDF_COLORS.gold,
    fontWeight: 700,
    textAlign: 'right',
  },
  // Value cell wrapper: takes remaining width, aligns its inner content to
  // the visual left (where the value naturally sits in an RTL row). The
  // wrapper is a View — not a row-reverse flex container — so the inner
  // <Text> handles its own bidi without an extra layout flip.
  defValueWrap: {
    width: '62%',
    paddingLeft: 4,
  },
  defValue: {
    fontSize: 11,
    color: PDF_COLORS.navy,
    fontWeight: 700,
    // textAlign: 'right' keeps the value flush against the visual divide
    // between label and value. Mixed-content strings (TXN-2026-0001, +١٥,٨٠٠ $)
    // get bidi-processed inside this single Text and render in correct
    // visual order.
    textAlign: 'right',
  },

  // ── Footer ───────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 24,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.divider,
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
  },
  footerPager: {
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
  },
});

export default styles;
