import { useState } from "react";

const C = {
  gold: "#C8A45A", goldLight: "#E8D5A3", goldDark: "#9A7B3C",
  navy: "#1A1F3A", navyLight: "#252B4A",
  cream: "#FFF9F1", creamDark: "#F3EBE0",
  brown: "#5C3D2E", brownLight: "#8B6F5E",
  red: "#C0392B", green: "#27AE60", blue: "#2980B9", orange: "#E67E22",
  white: "#FFFFFF", text: "#2C2C2C", textLight: "#888",
  overlay: "rgba(26,31,58,0.7)",
};

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

const products = [
  { id: 1, name: "طاولة موزاييك دمشقية", cat: "فسيفساء", price: 1200, oldPrice: 1400, rating: 5, reviews: 48, badge: "الأكثر مبيعاً", img: "🪑" },
  { id: 2, name: "صندوق خشب مطعّم بالصدف", cat: "خشب مطعّم", price: 400, rating: 4, reviews: 35, img: "📦" },
  { id: 3, name: "مزهرية زجاج منفوخ يدوي", cat: "زجاج منفوخ", price: 350, rating: 5, reviews: 28, badge: "جديد", img: "🏺" },
  { id: 4, name: "وشاح بروكار حريري", cat: "بروكار", price: 150, rating: 4, reviews: 22, img: "🧣" },
  { id: 5, name: "طبق نحاس محفور يدوياً", cat: "نحاسيات", price: 280, rating: 5, reviews: 19, img: "🍽️" },
  { id: 6, name: "مرآة موزاييك صغيرة", cat: "فسيفساء", price: 180, rating: 4, reviews: 31, img: "🪞" },
  { id: 7, name: "فانوس نحاسي مخرّم", cat: "نحاسيات", price: 320, rating: 5, reviews: 15, badge: "خصم ٢٠%", img: "🏮" },
  { id: 8, name: "سجادة حرير دمشقية", cat: "بروكار", price: 890, rating: 5, reviews: 12, img: "🟫" },
];

const categories = [
  { name: "فسيفساء / موزاييك", icon: "🔶", count: 42 },
  { name: "خشب مطعّم بالصدف", icon: "🪵", count: 28 },
  { name: "زجاج منفوخ", icon: "🫧", count: 18 },
  { name: "بروكار حريري", icon: "🧵", count: 24 },
  { name: "نحاسيات", icon: "⚱️", count: 31 },
  { name: "فخار وخزف", icon: "🏺", count: 15 },
];

const Pattern = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.04, pointerEvents: "none" }}>
    <defs>
      <pattern id="dp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke={C.gold} strokeWidth="0.5" />
        <circle cx="30" cy="30" r="4" fill="none" stroke={C.gold} strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dp)" />
  </svg>
);

const Badge = ({ text, color }) => (
  <span style={{ background: color || C.gold, color: C.white, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{text}</span>
);

const Btn = ({ children, primary, small, outline, onClick, full }) => (
  <button onClick={onClick} style={{
    background: outline ? "transparent" : primary ? C.gold : C.navy,
    color: outline ? C.gold : C.white,
    border: outline ? `2px solid ${C.gold}` : "none",
    borderRadius: 8, padding: small ? "6px 14px" : "12px 28px",
    cursor: "pointer", fontSize: small ? 12 : 14, fontWeight: 700,
    fontFamily: "Tajawal", width: full ? "100%" : "auto",
    transition: "all 0.2s",
  }}>{children}</button>
);

const ProductCard = ({ p, onView }) => (
  <div onClick={() => onView?.(p)} style={{ background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", position: "relative" }}>
    {p.badge && <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}><Badge text={p.badge} color={p.badge.includes("خصم") ? C.red : p.badge === "جديد" ? C.green : C.gold} /></div>}
    <div style={{ height: 180, background: `linear-gradient(135deg, ${C.creamDark}, ${C.cream})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>{p.img}</div>
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginBottom: 4 }}>{p.cat}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8, lineHeight: 1.5 }}>{p.name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ color: C.gold, fontSize: 13 }}>{stars(p.rating)}</span>
        <span style={{ fontSize: 11, color: C.textLight }}>({p.reviews})</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{p.price} $</span>
          {p.oldPrice && <span style={{ fontSize: 13, color: C.textLight, textDecoration: "line-through", marginRight: 8 }}>{p.oldPrice} $</span>}
        </div>
        <Btn small primary>أضف للسلة</Btn>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, sub, light }) => (
  <div style={{ textAlign: "center", marginBottom: 36 }}>
    <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>✦ ✦ ✦</div>
    <h2 style={{ fontSize: 28, fontWeight: 800, color: light ? C.white : C.navy, margin: "0 0 8px" }}>{title}</h2>
    {sub && <p style={{ fontSize: 14, color: light ? C.goldLight : C.textLight, margin: 0 }}>{sub}</p>}
  </div>
);

const InputField = ({ label, type = "text", placeholder, textarea, select, options }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{label}</label>
    {textarea ? <textarea placeholder={placeholder} rows={4} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.creamDark}`, borderRadius: 8, fontSize: 13, fontFamily: "Tajawal", direction: "rtl", resize: "vertical", boxSizing: "border-box" }} />
      : select ? <select style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.creamDark}`, borderRadius: 8, fontSize: 13, fontFamily: "Tajawal", boxSizing: "border-box" }}>{options.map((o, i) => <option key={i}>{o}</option>)}</select>
        : <input type={type} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.creamDark}`, borderRadius: 8, fontSize: 13, fontFamily: "Tajawal", direction: "rtl", boxSizing: "border-box" }} />}
  </div>
);

/* ============ NAVBAR ============ */
const Navbar = ({ page, setPage, cartCount }) => (
  <header style={{ background: C.navy, position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
      <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <span style={{ fontSize: 28 }}>🏺</span>
        <div>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 16 }}>الفن الدمشقي</div>
          <div style={{ color: C.goldLight, fontSize: 9, opacity: 0.7 }}>Damascene Art</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 6 }}>
        {[
          { id: "home", label: "الرئيسية" }, { id: "shop", label: "المتجر" },
          { id: "custom", label: "طلب مخصص" },
          { id: "about", label: "من نحن" }, { id: "contact", label: "تواصل" },
        ].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ background: page === n.id ? C.navyLight : "transparent", border: "none", color: page === n.id ? C.gold : C.goldLight, padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "Tajawal" }}>{n.label}</button>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span onClick={() => setPage("search")} style={{ cursor: "pointer", fontSize: 18, color: C.goldLight }}>🔍</span>
        <span onClick={() => setPage("wishlist")} style={{ cursor: "pointer", fontSize: 18, color: C.goldLight }}>♡</span>
        <span onClick={() => setPage("cart")} style={{ cursor: "pointer", fontSize: 18, color: C.goldLight, position: "relative" }}>
          🛒{cartCount > 0 && <span style={{ position: "absolute", top: -8, right: -8, background: C.red, color: C.white, fontSize: 10, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
        </span>
        <Btn small primary onClick={() => setPage("login")}>تسجيل الدخول</Btn>
      </div>
    </div>
  </header>
);

/* ============ FOOTER ============ */
const Footer = ({ setPage }) => (
  <footer style={{ background: C.navy, color: C.goldLight, padding: "48px 24px 24px", position: "relative" }}>
    <Pattern />
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, position: "relative", zIndex: 1 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 32 }}>🏺</span>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 20 }}>الفن الدمشقي</div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.8, margin: 0 }}>نحمل إرث دمشق العريق إلى العالم من خلال قطع فنية أصيلة مصنوعة بأيدي أمهر الحرفيين السوريين.</p>
      </div>
      <div>
        <h4 style={{ color: C.gold, marginBottom: 14, fontSize: 14 }}>روابط سريعة</h4>
        {["المتجر", "من نحن"].map((l, i) => (
          <div key={i} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer", opacity: 0.8 }}>{l}</div>
        ))}
      </div>
      <div>
        <h4 style={{ color: C.gold, marginBottom: 14, fontSize: 14 }}>المساعدة</h4>
        {[["faq", "الأسئلة الشائعة"], ["return", "سياسة الإرجاع"], ["privacy", "الخصوصية"], ["contact", "تواصل معنا"]].map(([id, l], i) => (
          <div key={i} onClick={() => setPage(id)} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer", opacity: 0.8 }}>{l}</div>
        ))}
      </div>
      <div>
        <h4 style={{ color: C.gold, marginBottom: 14, fontSize: 14 }}>تواصل معنا</h4>
        <div style={{ fontSize: 13, lineHeight: 2, opacity: 0.8 }}>
          📧 info@damascene-art.com<br />📞 +963 11 XXX XXXX<br />📍 دمشق — سوق الحميدية<br />
          <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 20 }}>
            <span style={{ cursor: "pointer" }}>📘</span>
            <span style={{ cursor: "pointer" }}>📸</span>
            <span style={{ cursor: "pointer" }}>🐦</span>
          </div>
        </div>
      </div>
    </div>
    <div style={{ maxWidth: 1200, margin: "32px auto 0", paddingTop: 20, borderTop: `1px solid ${C.navyLight}`, textAlign: "center", fontSize: 12, opacity: 0.5, position: "relative", zIndex: 1 }}>
      © ٢٠٢٦ الفن الدمشقي — جميع الحقوق محفوظة
    </div>
  </footer>
);

/* ============ PAGES ============ */

const HomePage = ({ setPage }) => (
  <>
    {/* Hero */}
    <section style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.brown} 100%)`, padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <Pattern />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, letterSpacing: 3, marginBottom: 16 }}>✦ إرث دمشق في بيتك ✦</div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.white, margin: "0 0 16px", lineHeight: 1.3 }}>قطع فنية دمشقية أصيلة<br />مصنوعة بأيدي أمهر الحرفيين</h1>
        <p style={{ fontSize: 16, color: C.goldLight, margin: "0 0 32px", maxWidth: 600, marginInline: "auto" }}>اكتشف جمال الفسيفساء والبروكار والزجاج المنفوخ والخشب المطعّم بالصدف</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Btn primary onClick={() => setPage("shop")}>تصفّح المتجر</Btn>
          <Btn outline onClick={() => setPage("about")}>اكتشف قصتنا</Btn>
        </div>
      </div>
    </section>

    {/* Categories */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <SectionHeader title="تصنيفات الفن الدمشقي" sub="اختر الحرفة التي تسحر قلبك" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {categories.map((cat, i) => (
          <div key={i} onClick={() => setPage("category")} style={{ background: C.white, borderRadius: 14, padding: "28px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1px solid ${C.creamDark}`, transition: "all 0.2s" }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 10 }}>{cat.icon}</span>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{cat.name}</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>{cat.count} منتج</div>
          </div>
        ))}
      </div>
    </section>

    {/* Featured Products */}
    <section style={{ background: C.creamDark, padding: "60px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader title="منتجات مميزة" sub="قطع فنية مختارة بعناية" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {products.slice(0, 4).map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Btn outline onClick={() => setPage("shop")}>عرض كل المنتجات ←</Btn>
        </div>
      </div>
    </section>

    {/* Story Banner */}
    <section style={{ background: `linear-gradient(135deg, ${C.brown}, ${C.navy})`, padding: "60px 24px", position: "relative" }}>
      <Pattern />
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <SectionHeader title="قصة الفن الدمشقي" sub="آلاف السنين من الإبداع والأصالة" light />
        <p style={{ fontSize: 15, color: C.goldLight, lineHeight: 2, margin: "0 0 24px" }}>
          منذ أكثر من ٥٠٠٠ عام، أبدعت أيدي الحرفيين في دمشق أجمل الفنون. من الفسيفساء التي تزيّن القصور إلى البروكار الذي كان يُهدى للملوك، نحمل هذا الإرث ونوصله إلى بيتك.
        </p>
        <Btn primary onClick={() => setPage("about")}>اقرأ المزيد</Btn>
      </div>
    </section>

    {/* Testimonials */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <SectionHeader title="ماذا يقول عملاؤنا" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {[
          { name: "أحمد الشامي", text: "قطع فنية مذهلة! الجودة تفوق التوقعات والتغليف كان ممتازاً.", rating: 5, location: "دبي" },
          { name: "Sarah Mueller", text: "Absolutely stunning craftsmanship. Each piece tells a story.", rating: 5, location: "Berlin" },
          { name: "ليلى حسن", text: "أجمل هدية قدمتها لأمي! صندوق الصدف كان تحفة حقيقية.", rating: 5, location: "عمّان" },
        ].map((t, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", borderTop: `3px solid ${C.gold}` }}>
            <div style={{ color: C.gold, fontSize: 14, marginBottom: 10 }}>{stars(t.rating)}</div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, margin: "0 0 14px" }}>"{t.text}"</p>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{t.name}</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{t.location}</div>
          </div>
        ))}
      </div>
    </section>
  </>
);

const ShopPage = ({ setPage }) => (
  <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
    <SectionHeader title="المتجر" sub="تصفّح جميع منتجاتنا الفنية" />
    <div style={{ display: "flex", gap: 24 }}>
      {/* Filters Sidebar */}
      <aside style={{ width: 240, flexShrink: 0 }}>
        <div style={{ background: C.white, borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", position: "sticky", top: 84 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginTop: 0 }}>🔍 الفلاتر</h3>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>التصنيف</div>
            {categories.map((c, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6, cursor: "pointer" }}>
                <input type="checkbox" /> {c.name} <span style={{ color: C.textLight, fontSize: 11 }}>({c.count})</span>
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>نطاق السعر</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input placeholder="من" style={{ width: "100%", padding: "6px 10px", border: `1px solid ${C.creamDark}`, borderRadius: 6, fontSize: 12, fontFamily: "Tajawal", boxSizing: "border-box" }} />
              <span>—</span>
              <input placeholder="إلى" style={{ width: "100%", padding: "6px 10px", border: `1px solid ${C.creamDark}`, borderRadius: 6, fontSize: 12, fontFamily: "Tajawal", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>التقييم</div>
            {[5, 4, 3].map(r => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 4, cursor: "pointer", color: C.gold }}>
                <input type="checkbox" /> {stars(r)}
              </label>
            ))}
          </div>
          <Btn primary full small>تطبيق الفلاتر</Btn>
        </div>
      </aside>
      {/* Product Grid */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 13, color: C.textLight }}>عرض ١-٨ من ١٥٤ منتج</span>
          <select style={{ padding: "8px 14px", border: `1px solid ${C.creamDark}`, borderRadius: 8, fontSize: 13, fontFamily: "Tajawal" }}>
            <option>الترتيب: الأكثر مبيعاً</option>
            <option>الأحدث</option>
            <option>السعر: من الأقل</option>
            <option>السعر: من الأعلى</option>
            <option>التقييم</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {products.map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 32 }}>
          {[1, 2, 3, "...", 12].map((n, i) => (
            <button key={i} style={{ width: 36, height: 36, borderRadius: 8, border: n === 1 ? "none" : `1px solid ${C.creamDark}`, background: n === 1 ? C.gold : C.white, color: n === 1 ? C.white : C.text, cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 13 }}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const CategoryPage = ({ setPage }) => (
  <section>
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.brown})`, padding: "48px 24px", textAlign: "center", position: "relative" }}><Pattern />
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 48 }}>🔶</span>
        <h1 style={{ fontSize: 32, color: C.white, margin: "12px 0 8px" }}>فسيفساء / موزاييك</h1>
        <p style={{ color: C.goldLight, fontSize: 14 }}>فن الفسيفساء الدمشقي — آلاف القطع الصغيرة تتحد لتشكل تحفة فنية خالدة</p>
      </div>
    </div>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        {products.filter(p => p.cat === "فسيفساء").map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
        {products.slice(0, 2).map(p => <ProductCard key={p.id + 100} p={{ ...p, cat: "فسيفساء" }} onView={() => setPage("product")} />)}
      </div>
    </div>
  </section>
);

const ProductPage = ({ setPage }) => (
  <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
    <div style={{ fontSize: 12, color: C.textLight, marginBottom: 20 }}>
      <span onClick={() => setPage("home")} style={{ cursor: "pointer" }}>الرئيسية</span> / <span onClick={() => setPage("shop")} style={{ cursor: "pointer" }}>المتجر</span> / <span onClick={() => setPage("category")} style={{ cursor: "pointer" }}>فسيفساء</span> / <span style={{ color: C.navy }}>طاولة موزاييك دمشقية</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      <div>
        <div style={{ background: C.creamDark, borderRadius: 18, height: 400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, marginBottom: 14 }}>🪑</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, background: C.creamDark, borderRadius: 10, height: 70, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, cursor: "pointer", border: i === 1 ? `2px solid ${C.gold}` : "2px solid transparent" }}>🪑</div>
          ))}
        </div>
      </div>
      <div>
        <Badge text="الأكثر مبيعاً" />
        <h1 style={{ fontSize: 28, color: C.navy, margin: "14px 0 8px" }}>طاولة موزاييك دمشقية كبيرة</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ color: C.gold }}>{stars(5)}</span>
          <span style={{ fontSize: 13, color: C.textLight }}>٤٨ تقييم</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: C.navy }}>١,٢٠٠ $</span>
          <span style={{ fontSize: 18, color: C.textLight, textDecoration: "line-through" }}>١,٤٠٠ $</span>
          <Badge text="خصم ١٤%" color={C.red} />
        </div>
        <p style={{ fontSize: 14, lineHeight: 2, color: C.text, margin: "0 0 20px" }}>طاولة موزاييك دمشقية مصنوعة يدوياً بالكامل من خشب الجوز المعتّق، مطعّمة بآلاف القطع من الصدف الطبيعي والخشب الملوّن. كل قطعة فريدة وتحمل لمسة الحرفي الشامي.</p>
        <div style={{ background: C.creamDark, borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 2, color: C.text }}>
          <strong>المواد:</strong> خشب جوز + صدف طبيعي<br />
          <strong>الأبعاد:</strong> ٦٠×٦٠×٤٥ سم<br />
          <strong>الوزن:</strong> ٨ كغ<br />
          <strong>الحرفي:</strong> الأسطى أبو خالد — ورشة الحميدية
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.creamDark}`, borderRadius: 8 }}>
            <button style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, fontFamily: "Tajawal" }}>-</button>
            <span style={{ padding: "0 14px", fontWeight: 700 }}>١</span>
            <button style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, fontFamily: "Tajawal" }}>+</button>
          </div>
          <Btn primary onClick={() => setPage("cart")}>🛒 أضف للسلة</Btn>
          <Btn outline>♡ أضف للمفضلة</Btn>
        </div>
        <div style={{ fontSize: 12, color: C.green }}>✅ متوفر — يُشحن خلال ٣-٥ أيام عمل</div>
      </div>
    </div>
    {/* Reviews */}
    <div style={{ marginTop: 48 }}>
      <SectionHeader title="تقييمات العملاء" />
      {[
        { name: "أحمد الشامي", rating: 5, text: "تحفة فنية حقيقية! التفاصيل مذهلة والقطعة أجمل من الصور.", date: "٠٢/٠٤/٢٠٢٦" },
        { name: "Sarah M.", rating: 5, text: "Beautiful craftsmanship. It's the centerpiece of our living room now.", date: "٢٥/٠٣/٢٠٢٦" },
      ].map((r, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 12, padding: 18, marginBottom: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, color: C.navy }}>{r.name}</div>
            <span style={{ fontSize: 11, color: C.textLight }}>{r.date}</span>
          </div>
          <div style={{ color: C.gold, fontSize: 13, margin: "6px 0" }}>{stars(r.rating)}</div>
          <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{r.text}</p>
        </div>
      ))}
    </div>
    {/* Related */}
    <div style={{ marginTop: 48 }}>
      <SectionHeader title="منتجات مشابهة" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        {products.slice(1, 5).map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
      </div>
    </div>
  </section>
);

const CartPage = ({ setPage }) => (
  <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
    <SectionHeader title="سلة المشتريات" />
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      <div>
        {[products[0], products[1]].map((p, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 14, display: "flex", gap: 16, alignItems: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 80, height: 80, background: C.creamDark, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{p.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.textLight }}>{p.cat}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.creamDark}`, borderRadius: 6 }}>
              <button style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", fontFamily: "Tajawal" }}>-</button>
              <span style={{ padding: "0 10px", fontSize: 13, fontWeight: 700 }}>١</span>
              <button style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", fontFamily: "Tajawal" }}>+</button>
            </div>
            <div style={{ fontWeight: 800, color: C.navy, fontSize: 16, minWidth: 80, textAlign: "center" }}>{p.price} $</div>
            <span style={{ cursor: "pointer", color: C.red, fontSize: 18 }}>🗑️</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: 84 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginTop: 0 }}>ملخص الطلب</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input placeholder="كوبون الخصم" style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.creamDark}`, borderRadius: 8, fontSize: 13, fontFamily: "Tajawal" }} />
          <Btn small primary>تطبيق</Btn>
        </div>
        {[["المجموع الفرعي", "١,٦٠٠ $"], ["الخصم", "- ١٦٠ $"], ["الشحن", "٣٥ $"]].map(([l, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10, color: i === 1 ? C.green : C.text }}>
            <span>{l}</span><span>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: C.navy, borderTop: `2px solid ${C.creamDark}`, paddingTop: 14, marginTop: 10 }}>
          <span>الإجمالي</span><span>١,٤٧٥ $</span>
        </div>
        <div style={{ marginTop: 18 }}><Btn primary full onClick={() => setPage("checkout")}>متابعة الشراء ←</Btn></div>
      </div>
    </div>
  </section>
);

const CheckoutPage = ({ setPage }) => (
  <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
    <SectionHeader title="إتمام الطلب" />
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
      <div>
        <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>📍 معلومات الشحن</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="الاسم الأول" placeholder="أحمد" />
            <InputField label="اسم العائلة" placeholder="الشامي" />
          </div>
          <InputField label="العنوان" placeholder="الشارع، رقم المبنى" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="المدينة" placeholder="دمشق" />
            <InputField label="الرمز البريدي" placeholder="XXXXX" />
          </div>
          <InputField label="البلد" select options={["سوريا", "لبنان", "الأردن", "الإمارات", "ألمانيا", "هولندا", "أخرى"]} />
          <InputField label="رقم الهاتف" placeholder="+963 XXX XXX" />
        </div>
        <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>📦 طريقة الشحن والتغليف</h3>
          {[["شحن عادي — ٣٥$ (٧-١٢ يوم)", true], ["شحن سريع — ٦٥$ (٣-٥ أيام)", false]].map(([l, checked], i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: checked ? C.cream : "transparent", borderRadius: 8, marginBottom: 8, cursor: "pointer", border: `1px solid ${checked ? C.gold : C.creamDark}` }}>
              <input type="radio" name="shipping" defaultChecked={checked} /> <span style={{ fontSize: 13 }}>{l}</span>
            </label>
          ))}
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: C.navy }}>خيار التغليف:</div>
          {[["تغليف عادي (مجاني)", true], ["صندوق خشبي فاخر (+٢٠$)", false], ["تغليف هدايا مزخرف (+٣٠$)", false]].map(([l, checked], i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13 }}>
              <input type="radio" name="wrap" defaultChecked={checked} /> {l}
            </label>
          ))}
        </div>
        <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>💳 طريقة الدفع</h3>
          {["بطاقة ائتمان / Visa / MasterCard", "PayPal", "تحويل بنكي"].map((l, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, marginBottom: 8, cursor: "pointer", border: `1px solid ${C.creamDark}`, fontSize: 13 }}>
              <input type="radio" name="payment" defaultChecked={i === 0} /> {l}
            </label>
          ))}
          <InputField label="ملاحظات على الطلب (اختياري)" textarea placeholder="مثلاً: قطعة هدية، يرجى تغليفها بعناية..." />
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: 84 }}>
        <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>ملخص الطلب</h3>
        {[products[0], products[1]].map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.creamDark}` }}>
            <span style={{ fontSize: 28 }}>{p.img}</span>
            <div style={{ flex: 1, fontSize: 13 }}>{p.name}<br /><span style={{ color: C.textLight }}>×١</span></div>
            <span style={{ fontWeight: 700 }}>{p.price}$</span>
          </div>
        ))}
        {[["المجموع الفرعي", "١,٦٠٠ $"], ["الخصم", "- ١٦٠ $"], ["الشحن", "٣٥ $"], ["التغليف", "مجاني"]].map(([l, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span>{l}</span><span>{v}</span></div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, color: C.navy, borderTop: `2px solid ${C.creamDark}`, paddingTop: 14, marginTop: 10 }}>
          <span>الإجمالي</span><span>١,٤٧٥ $</span>
        </div>
        <div style={{ marginTop: 18 }}><Btn primary full onClick={() => setPage("confirmation")}>تأكيد الطلب ✓</Btn></div>
      </div>
    </div>
  </section>
);

const ConfirmationPage = ({ setPage }) => (
  <section style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
    <h1 style={{ fontSize: 28, color: C.navy, margin: "0 0 10px" }}>شكراً لك! تم تأكيد طلبك</h1>
    <p style={{ color: C.textLight, fontSize: 14, marginBottom: 24 }}>رقم الطلب: <strong style={{ color: C.gold }}>#1084</strong></p>
    <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "right", marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>تفاصيل الطلب</h3>
      {[["المنتجات", "طاولة موزاييك + صندوق صدف"], ["الإجمالي", "١,٤٧٥ $"], ["طريقة الدفع", "بطاقة ائتمان"], ["التوصيل المتوقع", "١٠-١٥ أبريل ٢٠٢٦"]].map(([l, v], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${C.creamDark}` }}>
          <span style={{ color: C.textLight }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <Btn primary onClick={() => setPage("tracking")}>تتبع الطلب</Btn>
      <Btn outline onClick={() => setPage("shop")}>متابعة التسوق</Btn>
    </div>
  </section>
);

const LoginPage = ({ setPage }) => (
  <section style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
    <div style={{ background: C.white, borderRadius: 18, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>🏺</span>
      <h2 style={{ fontSize: 24, color: C.navy, margin: "12px 0 24px" }}>تسجيل الدخول</h2>
      <InputField label="البريد الإلكتروني" type="email" placeholder="email@example.com" />
      <InputField label="كلمة المرور" type="password" placeholder="••••••••" />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 18 }}>
        <label style={{ cursor: "pointer" }}><input type="checkbox" /> تذكرني</label>
        <span style={{ color: C.gold, cursor: "pointer" }}>نسيت كلمة المرور؟</span>
      </div>
      <Btn primary full onClick={() => setPage("account")}>تسجيل الدخول</Btn>
      <div style={{ margin: "18px 0", fontSize: 12, color: C.textLight }}>— أو —</div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ flex: 1, padding: "10px", border: `1px solid ${C.creamDark}`, borderRadius: 8, background: C.white, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal" }}>📘 Google</button>
        <button style={{ flex: 1, padding: "10px", border: `1px solid ${C.creamDark}`, borderRadius: 8, background: C.white, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal" }}>📱 Facebook</button>
      </div>
      <p style={{ fontSize: 13, marginTop: 18, color: C.textLight }}>ليس لديك حساب؟ <span style={{ color: C.gold, cursor: "pointer", fontWeight: 700 }} onClick={() => setPage("register")}>سجّل الآن</span></p>
    </div>
  </section>
);

const RegisterPage = ({ setPage }) => (
  <section style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
    <div style={{ background: C.white, borderRadius: 18, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>🏺</span>
      <h2 style={{ fontSize: 24, color: C.navy, margin: "12px 0 24px" }}>إنشاء حساب جديد</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <InputField label="الاسم الأول" placeholder="أحمد" />
        <InputField label="اسم العائلة" placeholder="الشامي" />
      </div>
      <InputField label="البريد الإلكتروني" type="email" placeholder="email@example.com" />
      <InputField label="كلمة المرور" type="password" placeholder="٨ أحرف على الأقل" />
      <InputField label="تأكيد كلمة المرور" type="password" placeholder="••••••••" />
      <div style={{ marginBottom: 18 }}><Btn primary full>إنشاء حساب</Btn></div>
      <p style={{ fontSize: 13, color: C.textLight }}>لديك حساب؟ <span style={{ color: C.gold, cursor: "pointer", fontWeight: 700 }} onClick={() => setPage("login")}>سجّل الدخول</span></p>
    </div>
  </section>
);

const AccountPage = ({ setPage }) => (
  <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
    <SectionHeader title="حسابي" sub="مرحباً، أحمد الشامي" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {[
        { icon: "📦", label: "طلباتي", value: "١٢ طلب" },
        { icon: "♡", label: "المفضلة", value: "٨ منتجات" },
        { icon: "⭐", label: "تقييماتي", value: "٥ تقييمات" },
        { icon: "📍", label: "عناويني", value: "٢ عناوين" },
      ].map((s, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 14, padding: 20, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", cursor: "pointer" }}>
          <span style={{ fontSize: 28 }}>{s.icon}</span>
          <div style={{ fontWeight: 700, color: C.navy, marginTop: 8 }}>{s.label}</div>
          <div style={{ fontSize: 12, color: C.textLight }}>{s.value}</div>
        </div>
      ))}
    </div>
    <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>📦 آخر الطلبات</h3>
      {[
        { id: "#1084", date: "٠٣/٠٤/٢٠٢٦", total: "١,٤٧٥ $", status: "قيد التجهيز", color: C.orange },
        { id: "#1078", date: "١٥/٠٣/٢٠٢٦", total: "٣٥٠ $", status: "تم التسليم", color: C.green },
        { id: "#1065", date: "٠١/٠٣/٢٠٢٦", total: "٨٩٠ $", status: "تم التسليم", color: C.green },
      ].map((o, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.creamDark}`, fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: C.navy }}>{o.id}</span>
          <span>{o.date}</span>
          <span style={{ fontWeight: 700 }}>{o.total}</span>
          <Badge text={o.status} color={o.color} />
          <span onClick={() => setPage("tracking")} style={{ color: C.gold, cursor: "pointer", fontWeight: 600 }}>تتبع ←</span>
        </div>
      ))}
    </div>
    <div style={{ background: C.white, borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h3 style={{ fontSize: 16, color: C.navy, marginTop: 0 }}>👤 المعلومات الشخصية</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <InputField label="الاسم" placeholder="أحمد الشامي" />
        <InputField label="البريد" placeholder="ahmed@email.com" />
        <InputField label="الهاتف" placeholder="+971 XXX" />
        <InputField label="كلمة المرور" type="password" placeholder="••••••" />
      </div>
      <Btn primary>حفظ التغييرات</Btn>
    </div>
  </section>
);

const TrackingPage = () => (
  <section style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px" }}>
    <SectionHeader title="تتبع الطلب" sub="رقم الطلب: #1084" />
    <div style={{ background: C.white, borderRadius: 18, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {[
        { label: "تم استلام الطلب", date: "٠٣/٠٤ — ١٠:٣٠ ص", done: true },
        { label: "قيد التجهيز والتغليف", date: "٠٣/٠٤ — ٠٢:٠٠ م", done: true },
        { label: "تم التغليف الخاص", date: "٠٤/٠٤", done: false, active: true },
        { label: "تم الشحن", date: "—", done: false },
        { label: "في الطريق", date: "—", done: false },
        { label: "تم التسليم", date: "—", done: false },
      ].map((s, i, arr) => (
        <div key={i} style={{ display: "flex", gap: 18, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.done ? C.green : s.active ? C.gold : C.creamDark, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 14, fontWeight: 700, border: s.active ? `3px solid ${C.goldLight}` : "none" }}>
              {s.done ? "✓" : i + 1}
            </div>
            {i < arr.length - 1 && <div style={{ width: 3, height: 40, background: s.done ? C.green : C.creamDark, margin: "4px 0" }} />}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div style={{ fontWeight: 700, color: s.done ? C.green : s.active ? C.gold : C.textLight, fontSize: 14 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: C.textLight }}>{s.date}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const WishlistPage = ({ setPage }) => (
  <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
    <SectionHeader title="قائمة المفضلة" sub="المنتجات التي أعجبتك" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
      {products.slice(0, 4).map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
    </div>
  </section>
);

const AboutPage = () => (
  <section>
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.brown})`, padding: "80px 24px", textAlign: "center", position: "relative" }}>
      <Pattern />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: 36, color: C.white, margin: "0 0 12px" }}>من نحن</h1>
        <p style={{ color: C.goldLight, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>نحمل إرث دمشق إلى العالم</p>
      </div>
    </div>
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ background: C.white, borderRadius: 18, padding: 36, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", lineHeight: 2.2, fontSize: 15, color: C.text }}>
        <h2 style={{ color: C.navy, fontSize: 22 }}>قصتنا</h2>
        <p>بدأت رحلتنا من قلب دمشق القديمة — من أزقة سوق الحميدية وورش الحرفيين الذين ورثوا صنعتهم أباً عن جد. نؤمن بأن كل قطعة فنية دمشقية تحمل في طياتها قصة حضارة عمرها آلاف السنين.</p>
        <h2 style={{ color: C.navy, fontSize: 22 }}>رؤيتنا</h2>
        <p>أن نكون الجسر الذي يوصل روائع الفن الدمشقي إلى كل بيت في العالم، مع الحفاظ على أصالة الصنعة ودعم الحرفيين المحليين.</p>
        <h2 style={{ color: C.navy, fontSize: 22 }}>رسالتنا</h2>
        <p>تقديم قطع فنية دمشقية أصيلة بجودة عالية، مع ضمان وصولها سليمة إلى أي مكان في العالم، ودعم المجتمع الحرفي السوري اقتصادياً وثقافياً.</p>
      </div>
    </div>
  </section>
);



const ContactPage = () => (
  <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
    <SectionHeader title="تواصل معنا" sub="نسعد بسماع رأيك واستفساراتك" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ background: C.white, borderRadius: 14, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <InputField label="الاسم" placeholder="اسمك الكامل" />
        <InputField label="البريد الإلكتروني" type="email" placeholder="email@example.com" />
        <InputField label="الموضوع" select options={["استفسار عام", "مشكلة في طلب", "طلب مخصص", "اقتراح", "أخرى"]} />
        <InputField label="الرسالة" textarea placeholder="اكتب رسالتك هنا..." />
        <Btn primary full>إرسال الرسالة</Btn>
      </div>
      <div>
        <div style={{ background: C.navy, borderRadius: 14, padding: 28, color: C.goldLight, marginBottom: 18 }}>
          <h3 style={{ color: C.gold, marginTop: 0 }}>معلومات التواصل</h3>
          <div style={{ lineHeight: 2.4, fontSize: 14 }}>
            📧 info@damascene-art.com<br />📞 +963 11 XXX XXXX<br />📱 واتساب: +963 9XX XXX XXX<br />📍 دمشق — سوق الحميدية<br />🕐 السبت - الخميس: ٩ ص - ٦ م
          </div>
        </div>
        <div style={{ background: C.creamDark, borderRadius: 14, height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: C.textLight, fontSize: 14 }}>🗺️ خريطة الموقع — سوق الحميدية، دمشق</div>
      </div>
    </div>
  </section>
);

const FAQPage = () => (
  <section style={{ maxWidth: 750, margin: "0 auto", padding: "48px 24px" }}>
    <SectionHeader title="الأسئلة الشائعة" />
    {[
      { q: "هل المنتجات مصنوعة يدوياً بالكامل؟", a: "نعم، جميع منتجاتنا مصنوعة يدوياً بالكامل بأيدي حرفيين سوريين متخصصين. كل قطعة فريدة ومميزة." },
      { q: "هل تشحنون إلى خارج الشرق الأوسط؟", a: "نعم، نشحن إلى أغلب دول العالم. مدة الشحن تتراوح بين ٣-٢٠ يوم حسب المنطقة." },
      { q: "كيف تُغلّف القطع الحساسة؟", a: "نستخدم تغليفاً خاصاً متعدد الطبقات يشمل فقاعات هوائية وحشو مقاوم للصدمات لضمان وصول القطع سليمة." },
      { q: "ما هي سياسة الإرجاع؟", a: "يمكنك إرجاع المنتج خلال ١٤ يوماً من الاستلام بشرط أن يكون بحالته الأصلية. نتحمل تكاليف الإرجاع في حال وجود عيب." },
      { q: "هل يمكنني طلب قطعة بمقاس أو تصميم مخصص؟", a: "بالتأكيد! نقدم خدمة الطلبات المخصصة. تواصل معنا وسنعمل مع الحرفي المناسب لتنفيذ رؤيتك." },
    ].map((f, i) => (
      <div key={i} style={{ background: C.white, borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderRight: `4px solid ${C.gold}` }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: 15, marginBottom: 8 }}>❓ {f.q}</div>
        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.9 }}>{f.a}</p>
      </div>
    ))}
  </section>
);

const CustomOrderPage = () => (
  <section style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>
    <SectionHeader title="طلب مخصص" sub="صمّم قطعتك الفنية الخاصة" />
    <div style={{ background: C.white, borderRadius: 18, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: 14, lineHeight: 2, color: C.text, marginTop: 0 }}>هل تريد قطعة فنية بمواصفات خاصة؟ أخبرنا بتفاصيل حلمك وسنعمل مع حرفيينا لتحويله إلى حقيقة.</p>
      <InputField label="اسمك" placeholder="الاسم الكامل" />
      <InputField label="البريد الإلكتروني" placeholder="email@example.com" />
      <InputField label="نوع المنتج" select options={["فسيفساء / موزاييك", "خشب مطعّم بالصدف", "زجاج منفوخ", "بروكار حريري", "نحاسيات", "أخرى"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <InputField label="الأبعاد التقريبية" placeholder="مثلاً: ٦٠×٤٠ سم" />
        <InputField label="الميزانية التقريبية" placeholder="مثلاً: ٥٠٠-١٠٠٠$" />
      </div>
      <InputField label="وصف القطعة المطلوبة" textarea placeholder="صف لنا بالتفصيل ما تريده: التصميم، الألوان، الاستخدام..." />
      <div style={{ border: `2px dashed ${C.creamDark}`, borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 18, cursor: "pointer" }}>
        <span style={{ fontSize: 28 }}>📎</span>
        <div style={{ fontSize: 13, color: C.textLight, marginTop: 6 }}>ارفع صورة مرجعية (اختياري)</div>
      </div>
      <Btn primary full>إرسال الطلب</Btn>
    </div>
  </section>
);

const ReturnPolicyPage = () => (
  <section style={{ maxWidth: 750, margin: "0 auto", padding: "48px 24px" }}>
    <SectionHeader title="سياسة الإرجاع والاستبدال" />
    <div style={{ background: C.white, borderRadius: 14, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 2.2, fontSize: 14 }}>
      {[
        ["📅 مدة الإرجاع", "يمكنك طلب الإرجاع خلال ١٤ يوماً من تاريخ الاستلام."],
        ["📦 حالة المنتج", "يجب أن يكون المنتج بحالته الأصلية دون أي ضرر أو استخدام، مع التغليف الأصلي."],
        ["💰 استرداد المبلغ", "يتم استرداد المبلغ كاملاً خلال ٥-١٠ أيام عمل بنفس طريقة الدفع الأصلية."],
        ["🔄 الاستبدال", "يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو بفارق سعر."],
        ["⚠️ حالات خاصة", "القطع المصنوعة حسب الطلب (Custom Orders) غير قابلة للإرجاع إلا في حالة وجود عيب تصنيعي."],
      ].map(([title, desc], i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, color: C.navy, margin: "0 0 6px" }}>{title}</h3>
          <p style={{ margin: 0, color: C.text }}>{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const PrivacyPage = () => (
  <section style={{ maxWidth: 750, margin: "0 auto", padding: "48px 24px" }}>
    <SectionHeader title="سياسة الخصوصية والشروط" />
    <div style={{ background: C.white, borderRadius: 14, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 2.2, fontSize: 14 }}>
      {[
        ["🔒 جمع البيانات", "نجمع فقط البيانات الضرورية لمعالجة طلباتك: الاسم، البريد الإلكتروني، العنوان، ومعلومات الدفع."],
        ["🛡️ حماية البيانات", "نستخدم تشفير SSL لحماية بياناتك المالية ولا نشارك معلوماتك مع أطراف ثالثة."],
        ["🍪 ملفات الكوكيز", "نستخدم الكوكيز لتحسين تجربة التصفح وتذكر تفضيلاتك."],
        ["📜 شروط الاستخدام", "باستخدام الموقع فإنك توافق على شروطنا. جميع المنتجات محمية بحقوق الملكية الفكرية."],
      ].map(([title, desc], i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, color: C.navy, margin: "0 0 6px" }}>{title}</h3>
          <p style={{ margin: 0, color: C.text }}>{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const SearchPage = ({ setPage }) => (
  <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <h2 style={{ fontSize: 28, color: C.navy, margin: "0 0 16px" }}>🔍 البحث في المتجر</h2>
      <div style={{ display: "flex", gap: 10, maxWidth: 500, margin: "0 auto" }}>
        <input placeholder="ابحث عن منتج، تصنيف، حرفي..." style={{ flex: 1, padding: "14px 18px", border: `2px solid ${C.gold}`, borderRadius: 12, fontSize: 15, fontFamily: "Tajawal", direction: "rtl" }} />
        <Btn primary>بحث</Btn>
      </div>
    </div>
    <div style={{ fontSize: 13, color: C.textLight, marginBottom: 14 }}>نتائج البحث عن: <strong style={{ color: C.navy }}>"موزاييك"</strong> — ٦ نتائج</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
      {products.filter(p => p.cat.includes("فسيفساء")).map(p => <ProductCard key={p.id} p={p} onView={() => setPage("product")} />)}
      {products.slice(0, 4).map(p => <ProductCard key={p.id + 200} p={p} onView={() => setPage("product")} />)}
    </div>
  </section>
);

const NotFoundPage = ({ setPage }) => (
  <section style={{ textAlign: "center", padding: "100px 24px" }}>
    <div style={{ fontSize: 80, marginBottom: 16 }}>🏺</div>
    <h1 style={{ fontSize: 72, color: C.gold, margin: "0 0 10px", fontWeight: 800 }}>٤٠٤</h1>
    <h2 style={{ fontSize: 24, color: C.navy, margin: "0 0 12px" }}>الصفحة غير موجودة</h2>
    <p style={{ fontSize: 14, color: C.textLight, marginBottom: 28 }}>يبدو أن هذه الصفحة ضاعت في أزقة دمشق القديمة!</p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <Btn primary onClick={() => setPage("home")}>العودة للرئيسية</Btn>
      <Btn outline onClick={() => setPage("shop")}>تصفّح المتجر</Btn>
    </div>
  </section>
);

/* ============ MAIN APP ============ */
const pageMap = {
  home: HomePage, shop: ShopPage, category: CategoryPage, product: ProductPage,
  cart: CartPage, checkout: CheckoutPage, confirmation: ConfirmationPage,
  login: LoginPage, register: RegisterPage, account: AccountPage,
  tracking: TrackingPage, wishlist: WishlistPage, about: AboutPage,
  contact: ContactPage,
  faq: FAQPage, custom: CustomOrderPage, return: ReturnPolicyPage,
  privacy: PrivacyPage, search: SearchPage, notfound: NotFoundPage,
};

export default function DamasceneArtCustomer() {
  const [page, setPage] = useState("home");
  const PageComp = pageMap[page] || NotFoundPage;

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", background: C.cream, color: C.text, minHeight: "100vh", fontSize: 14 }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <Navbar page={page} setPage={setPage} cartCount={2} />
      <PageComp setPage={setPage} />
      <Footer setPage={setPage} />
    </div>
  );
}
