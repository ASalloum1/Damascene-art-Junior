// Code-split entry for the financial report download link.
//
// Bundling @react-pdf/renderer + the document into the main chunk would add
// hundreds of KB to the initial admin bundle. By isolating both behind this
// component, Vite emits them in their own chunk that only loads when the
// admin actually opens the financial page (and the link mounts).

import { PDFDownloadLink } from '@react-pdf/renderer';
import FinancialReportDocument from './FinancialReportDocument.jsx';

/**
 * Thin wrapper around <PDFDownloadLink> that lives in its own module so it
 * can be `React.lazy()`-imported from FinancialManagement.jsx.
 *
 * Props: { documentProps, fileName, children }
 *   - documentProps: { kpis, stores, transactions, filters, generatedAt }
 *   - children: render prop or node passed to PDFDownloadLink
 */
export default function LazyFinancialReportLink({
  documentProps,
  fileName,
  children,
  className,
  ariaLabel,
}) {
  return (
    <PDFDownloadLink
      document={<FinancialReportDocument {...documentProps} />}
      fileName={fileName}
      className={className}
      aria-label={ariaLabel}
      style={{ textDecoration: 'none' }}
    >
      {children}
    </PDFDownloadLink>
  );
}
