import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { products } from '../data/index.js';
import styles from './WishlistPage.module.css';

export function WishlistPage({ onNavigate }) {
  const wishlistItems = products.slice(0, 4);

  return (
    <div className={styles.container}>
      <SectionHeader title="قائمة المفضلة" subtitle="المنتجات التي نالت إعجابكم" />
      
      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>معرض تفضيلاتكم فارغ حالياً</p>
          <p className={styles.emptyDesc}>قد تجدون ضالتكم في مجموعتنا المختارة من الموزاييك والصدف. احفظوا القطع التي تلامس ذوقكم لتجدوها هنا دائماً.</p>
          <Button variant="primary" onClick={() => onNavigate?.('shop')}>
            استكشاف المجموعة
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={() => onNavigate?.('product')}
              onAddToCart={() => onNavigate?.('cart')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
