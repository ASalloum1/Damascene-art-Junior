// Tajawal font registration for @react-pdf/renderer.
//
// Files live in /public/fonts/ and are resolved at PDF-render time via the
// page origin — NO CDN dependency. The hyphenation callback is disabled so
// Arabic words don't get split at unexpected points.
//
// This module must be imported once, before any PDF render. The
// ReportPdfDocument module imports it for that side effect.

import { Font } from '@react-pdf/renderer';

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Tajawal',
    fonts: [
      { src: '/fonts/Tajawal-Regular.ttf' },
      { src: '/fonts/Tajawal-Bold.ttf', fontWeight: 'bold' },
    ],
  });

  // Don't break Arabic words for hyphenation — there is no canonical Arabic
  // hyphenation, and the default English ruleset slices words badly.
  Font.registerHyphenationCallback((word) => [word]);
}
