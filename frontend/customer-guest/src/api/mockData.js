// Placeholder products used by the visual-search mock client.
//
// The mock cycles these six entries to fill 27 results across 3 pages.
// Thumbnail URLs use Lorem Picsum so the dev environment shows real images
// without any backend running. The shape mirrors the contract documented
// in visual-search-FRONTEND-spec-v2.md §3.1 (the `product` object).
//
// Once the catalogue is seeded, swap these for live products — the rest of
// the mock client does not depend on any specific id/slug.

export const mockProducts = [
  {
    id: 101,
    slug: 'damascene-box-classic',
    name: 'صندوق دمشقي كلاسيكي',
    price: 850,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/box1/400/400',
    category: { id: 1, name: 'صناديق' },
  },
  {
    id: 102,
    slug: 'damascene-tray-mother-of-pearl',
    name: 'صينية مطعّمة بالصدف',
    price: 1200,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/tray1/400/400',
    category: { id: 2, name: 'صواني' },
  },
  {
    id: 103,
    slug: 'damascene-mirror-frame',
    name: 'إطار مرآة دمشقي',
    price: 1450,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/mirror1/400/400',
    category: { id: 3, name: 'مرايا' },
  },
  {
    id: 104,
    slug: 'damascene-jewelry-box',
    name: 'علبة مجوهرات دمشقية',
    price: 620,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/jewel1/400/400',
    category: { id: 1, name: 'صناديق' },
  },
  {
    id: 105,
    slug: 'damascene-wall-plate',
    name: 'طبق جداري مزخرف',
    price: 980,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/plate1/400/400',
    category: { id: 4, name: 'ديكور' },
  },
  {
    id: 106,
    slug: 'damascene-coffee-set',
    name: 'طقم قهوة دمشقي',
    price: 1750,
    currency: 'SAR',
    thumbnail_url: 'https://picsum.photos/seed/coffee1/400/400',
    category: { id: 5, name: 'أطقم تقديم' },
  },
];

export default mockProducts;
