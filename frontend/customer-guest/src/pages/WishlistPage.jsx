import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { products } from '../data/index.js';
import styles from './WishlistPage.module.css';

export function WishlistPage({ onNavigate }) {
  return (
    <div className={styles.container}>
      <SectionHeader title="قائمة المفضلة" subtitle="المنتجات التي أعجبتك" />
      <div className={styles.grid}>
        {products.slice(0, 4).map((product) => (
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

export default WishlistPage;
