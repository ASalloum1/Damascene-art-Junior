// Stylesheet for ReportPdfDocument. Brand-aligned: navy + gold + cream.
//
// All numbers in points (1pt = 1/72in). A4 page = 595 x 842 pt.

import { StyleSheet } from '@react-pdf/renderer';

const GOLD = '#C8A45A';
const GOLD_DARK = '#A07830';
const NAVY = '#1A1F3A';
const NAVY_LIGHT = '#252B4A';
const CREAM = '#FFF8F0';
const CREAM_DARK = '#F5EDE0';
const STONE_MID = '#6E6660';
const STONE_DARK = '#3D3830';
const WHITE = '#FFFFFF';

export const PDF_COLORS = {
  GOLD,
  GOLD_DARK,
  NAVY,
  NAVY_LIGHT,
  CREAM,
  CREAM_DARK,
  STONE_MID,
  STONE_DARK,
  WHITE,
};

export const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    padding: 36,
    paddingBottom: 64,
    fontFamily: 'Tajawal',
    fontSize: 10,
    color: STONE_DARK,
  },

  // ── Header band ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    padding: 16,
    borderRadius: 8,
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMarkText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerBrand: {
    color: GOLD,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerMetaLabel: {
    color: CREAM_DARK,
    fontSize: 8,
  },
  headerMetaValue: {
    color: WHITE,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // ── Section title with gold rule ───────────────────────────────
  section: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: NAVY,
  },

  // ── KPI strip ──────────────────────────────────────────────────
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  kpiCell: {
    flex: 1,
    padding: 10,
    backgroundColor: CREAM,
    borderTopWidth: 2,
    borderTopColor: GOLD,
    borderRadius: 4,
  },
  kpiLabel: {
    fontSize: 8,
    color: STONE_MID,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: NAVY,
  },

  // ── Table ──────────────────────────────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: CREAM_DARK,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: NAVY_LIGHT,
  },
  tableHeadCell: {
    flex: 1,
    padding: 7,
    color: WHITE,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: CREAM_DARK,
  },
  tableRowAlt: {
    backgroundColor: CREAM,
  },
  tableCell: {
    flex: 1,
    padding: 7,
    fontSize: 9,
    color: STONE_DARK,
    textAlign: 'right',
  },
  tableEmpty: {
    padding: 16,
    textAlign: 'center',
    fontSize: 9,
    color: STONE_MID,
  },

  // ── Footer ─────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CREAM_DARK,
  },
  footerText: {
    fontSize: 8,
    color: STONE_MID,
  },
});
