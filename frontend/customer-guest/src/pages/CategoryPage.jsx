import { Layers } from 'lucide-react';
import { PageHero } from '../components/PageHero.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { products } from '../data/index.js';
import styles from './CategoryPage.module.css';

export function CategoryPage({ onNavigate }) {
  const mosaicProducts = products.filter((p) => p.cat === 'فسيفساء');
  const fillerProducts = products.slice(0, 2);
  const displayProducts = [...mosaicProducts, ...fillerProducts].slice(0, 8);

  return (
    <div className={styles.page}>
      <PageHero
        icon={Layers}
        title="فسيفساء / موزاييك"
        subtitle="فن الفسيفساء الدمشقي — آلاف القطع الصغيرة تتحد لتشكل تحفة فنية خالدة"
      />
      <div className={styles.container}>
        <div className={styles.grid}>
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={() => onNavigate?.('product')}
              onAddToCart={() => onNavigate?.('cart')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
