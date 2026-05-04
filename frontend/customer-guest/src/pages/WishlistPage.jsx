import { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { Button } from '../components/Button.jsx';
import styles from './WishlistPage.module.css';

export function WishlistPage({ onNavigate }) {
  const { baseUrl, bearerToken } = useApi();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/customers/wish-lists`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ: ${response.status}`);
      }

      const data = await response.json();
      console.log('Wishlist retrieved:', data);

      // Transform wish_lists into products format for ProductCard
      const transformedItems = data.data.wish_lists.map((item) => {
        let imageUrl = item.product.image;

        if (imageUrl) {
          // If it's a full ngrok URL, extract just the /storage/... part
          if (imageUrl.includes('ngrok') && imageUrl.includes('/storage/')) {
            const storageIndex = imageUrl.indexOf('/storage/');
            imageUrl = imageUrl.substring(storageIndex);
          }
          // If it's just a filename, add the /storage/ prefix
          else if (imageUrl && !imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
            imageUrl = `/storage/${imageUrl}`;
          }

          // Decode URI-encoded characters
          try {
            imageUrl = decodeURIComponent(imageUrl);
          } catch (e) {
            // If decoding fails, use original URL
          }
        }

        return {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category_id,
          price: parseFloat(item.product.new_price),
          oldPrice: parseFloat(item.product.old_price),
          rating: parseFloat(item.product.average_rate),
          image: imageUrl,
          wishlistId: item.id, // Store wishlist entry id for delete operations
        };
      });

      setWishlistItems(transformedItems);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message || 'فشل تحميل قائمة المفضلة');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-stone)' }}>
        جاري تحميل قائمة المفضلة...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-red)' }}>
        {error}
      </div>
    );
  }

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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
