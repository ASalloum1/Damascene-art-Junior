// Side-effecting font registration for @react-pdf/renderer.
//
// Tajawal is the brand Arabic typeface. We pull the raw .ttf files from
// Google's CDN at module evaluation and register both regular (400) and bold
// (700) weights so PDF documents can render Arabic glyphs without falling
// back to a Latin-only default.
//
// Idempotent: multiple imports across the bundle do not re-register.

import { Font } from '@react-pdf/renderer';

const TAJAWAL_REGULAR_URL =
  'https://fonts.gstatic.com/s/tajawal/v12/Iura6YBj_oCad4k1rzY.ttf';
const TAJAWAL_BOLD_URL =
  'https://fonts.gstatic.com/s/tajawal/v12/Iurf6YBj_oCad4k1l4qkLrY.ttf';

let registered = false;

export function ensureFontsRegistered() {
  if (registered) return;

  Font.register({
    family: 'Tajawal',
    fonts: [
      { src: TAJAWAL_REGULAR_URL, fontWeight: 400 },
      { src: TAJAWAL_BOLD_URL, fontWeight: 700 },
    ],
  });

  // @react-pdf's hyphenation engine assumes Latin word boundaries and breaks
  // Arabic ligatures. Disable it by returning the word as a single chunk.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}

// Auto-register on import for ergonomic use: any module that imports a PDF
// document or this file will trigger registration once.
ensureFontsRegistered();
