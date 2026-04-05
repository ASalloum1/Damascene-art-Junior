import { useState } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { Btn } from '../components/Btn.jsx';
import { products, categories } from '../data/index.js';
import styles from './ShopPage.module.css';

export function ShopPage({ onNavigate }) {
  const [filterOpen, setFilterOpen] = useState(false);

  const filterSidebarContent = (
    <>
      <h3 className={styles.sidebarHeading}>الفلاتر</h3>

      {/* Category */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>التصنيف</span>
        {categories.map((cat) => (
          <label key={cat.id} className={styles.checkboxRow}>
            <input type="checkbox" />
            {cat.name}
            <span className={styles.catCount}>{cat.count}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>نطاق السعر</span>
        <div className={styles.priceRow}>
          <input className={styles.priceInput} type="number" placeholder="من" />
          <span className={styles.priceSep}>—</span>
          <input className={styles.priceInput} type="number" placeholder="إلى" />
        </div>
      </div>

      {/* Rating */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>التقييم</span>
        {[5, 4, 3].map((r) => (
          <label key={r} className={styles.checkboxRow}>
            <input type="checkbox" />
            <span className={styles.starsLabel}>
              {Array.from({ length: r }, (_, i) => (
                <Star key={i} size={12} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
              ))}
              {r < 5 && ' فأكثر'}
            </span>
          </label>
        ))}
      </div>

      <Btn variant="primary" full size="sm">
        تطبيق الفلاتر
      </Btn>
    </>
  );

  return (
    <div className={styles.page}>
      <SectionHeader title="المتجر" subtitle="اكتشف كل قطع الفن الدمشقي الأصيل" />

      {/* Mobile filter button */}
      <button
        type="button"
        className={styles.mobileFilterBtn}
        onClick={() => setFilterOpen(true)}
      >
        <SlidersHorizontal size={16} />
        الفلاتر
      </button>

      {/* Mobile backdrop + bottom sheet */}
      {filterOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setFilterOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.bottomSheet} role="dialog" aria-modal="true" aria-label="الفلاتر">
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'inline-end' }}
              onClick={() => setFilterOpen(false)}
              aria-label="إغلاق الفلاتر"
            >
              <X size={20} />
            </button>
            {filterSidebarContent}
          </div>
        </>
      )}

      <div className={styles.layout}>
        {/* Desktop sidebar */}
        <aside className={styles.sidebar}>
          {filterSidebarContent}
        </aside>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.sortRow}>
            <span className={styles.resultCount}>عرض ١-٨ من ١٥٤ منتج</span>
            <select className={styles.sortSelect}>
              <option>الأكثر مبيعاً</option>
              <option>الأحدث</option>
              <option>السعر: من الأقل</option>
              <option>السعر: من الأعلى</option>
              <option>التقييم</option>
            </select>
          </div>

          <div className={styles.productGrid}>
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={() => onNavigate?.('product')}
                onAddToCart={() => onNavigate?.('cart')}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            {['1', '2', '3', '...', '12'].map((p, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.pageBtn} ${p === '1' ? styles.pageBtnActive : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
