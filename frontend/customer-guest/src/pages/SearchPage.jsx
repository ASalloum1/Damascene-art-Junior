import { Search } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { Button } from '../components/Button.jsx';
import { products } from '../data/index.js';
import styles from './SearchPage.module.css';

const mosaic = products.filter((p) => p.cat.includes('فسيفساء'));
const filler = products.slice(0, 4);
const results = [...new Map([...mosaic, ...filler].map((p) => [p.id, p])).values()];

export function SearchPage({ onNavigate }) {
  return (
    <div className={styles.container}>
      {/* Search Hero */}
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>
          <Search size={24} className={styles.heroIcon} />
          البحث في المتجر
        </h2>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="ابحث عن منتج، تصنيف، حرفي..."
            dir="rtl"
          />
          <Button variant="primary">بحث</Button>
        </div>
      </div>

      {/* Results info */}
      <p className={styles.resultsMeta}>
        نتائج البحث عن:{' '}
        <span className={styles.resultsKeyword}>"موزاييك"</span>
        {' '}— ٦ نتائج
      </p>

      {/* Grid */}
      <div className={styles.grid}>
        {results.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={() => onNavigate?.('product')}
            onAddToCart={() => onNavigate?.('cart')}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
