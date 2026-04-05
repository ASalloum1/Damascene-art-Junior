export const products = [
  { id: 1, name: "طاولة موزاييك دمشقية", cat: "فسيفساء", price: 1200, oldPrice: 1400, rating: 5, reviews: 48, badge: "الأكثر مبيعاً" },
  { id: 2, name: "صندوق خشب مطعّم بالصدف", cat: "خشب مطعّم", price: 400, rating: 4, reviews: 35 },
  { id: 3, name: "مزهرية زجاج منفوخ يدوي", cat: "زجاج منفوخ", price: 350, rating: 5, reviews: 28, badge: "جديد" },
  { id: 4, name: "وشاح بروكار حريري", cat: "بروكار", price: 150, rating: 4, reviews: 22 },
  { id: 5, name: "طبق نحاس محفور يدوياً", cat: "نحاسيات", price: 280, rating: 5, reviews: 19 },
  { id: 6, name: "مرآة موزاييك صغيرة", cat: "فسيفساء", price: 180, rating: 4, reviews: 31 },
  { id: 7, name: "فانوس نحاسي مخرّم", cat: "نحاسيات", price: 320, rating: 5, reviews: 15, badge: "خصم ٢٠%" },
  { id: 8, name: "سجادة حرير دمشقية", cat: "بروكار", price: 890, rating: 5, reviews: 12 },
];

export const categories = [
  { id: 'mosaic', name: "فسيفساء / موزاييك", count: 42 },
  { id: 'wood', name: "خشب مطعّم بالصدف", count: 28 },
  { id: 'glass', name: "زجاج منفوخ", count: 18 },
  { id: 'brocade', name: "بروكار حريري", count: 24 },
  { id: 'brass', name: "نحاسيات", count: 31 },
  { id: 'pottery', name: "فخار وخزف", count: 15 },
];

export const testimonials = [
  { name: "أحمد الشامي", text: "قطع فنية مذهلة! الجودة تفوق التوقعات والتغليف كان ممتازاً.", rating: 5, location: "دبي" },
  { name: "Sarah Mueller", text: "Absolutely stunning craftsmanship. Each piece tells a story.", rating: 5, location: "Berlin" },
  { name: "ليلى حسن", text: "أجمل هدية قدمتها لأمي! صندوق الصدف كان تحفة حقيقية.", rating: 5, location: "عمّان" },
];

export const navLinks = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'shop', label: 'المتجر' },
  { id: 'custom', label: 'طلب مخصص' },
  { id: 'about', label: 'من نحن' },
  { id: 'contact', label: 'تواصل' },
];

export const trackingSteps = [
  { label: "تم استلام الطلب", date: "٠٣/٠٤ — ١٠:٣٠ ص", status: 'done' },
  { label: "قيد التجهيز والتغليف", date: "٠٣/٠٤ — ٠٢:٠٠ م", status: 'done' },
  { label: "تم التغليف الخاص", date: "٠٤/٠٤", status: 'active' },
  { label: "تم الشحن", date: "—", status: 'pending' },
  { label: "في الطريق", date: "—", status: 'pending' },
  { label: "تم التسليم", date: "—", status: 'pending' },
];
