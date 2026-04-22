import { useState, useEffect } from 'react';
import { ImageIcon, Heart, ShoppingCart, Check } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { Badge } from '../components/Badge.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { QuantitySelector } from '../components/QuantitySelector.jsx';
import { Button } from '../components/Button.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { products } from '../data/index.js';
import styles from './ProductPage.module.css';

const reviews = [
  {
    name: 'أحمد الشامي',
    rating: 5,
    text: 'تحفة فنية حقيقية! التفاصيل مذهلة والقطعة أجمل من الصور.',
    date: '٠٢/٠٤/٢٠٢٦',
  },
  {
    name: 'Sarah M.',
    rating: 5,
    text: 'Beautiful craftsmanship. It\'s the centerpiece of our living room now.',
    date: '٢٥/٠٣/٢٠٢٦',
  },
];

export function ProductPage({ onNavigate }) {
  const { baseUrl, endpoints, selectedProductId, bearerToken } = useApi();
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  useEffect(() => {
    if (!selectedProductId) {
      setError('No product selected');
      setIsLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError('');

      try {
        const apiUrl = `${baseUrl}${endpoints.productDetails}`;
        console.log('Fetching product details from:', apiUrl, 'Product ID:', selectedProductId);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ product_id: selectedProductId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Product details received:', data);

        // Map API response
        const product = data.data.product;
        let imageUrl = product.image;

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

        setProductData({
          id: product.id,
          name: product.name,
          price: parseFloat(product.new_price),
          oldPrice: parseFloat(product.old_price),
          image: imageUrl,
          rating: parseFloat(product.average_rate),
          category: product.category.name,
          inStock: product.amount > 0,
          amount: product.amount,
        });
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [selectedProductId, baseUrl, endpoints]);

  const handleAddToCart = async () => {
    if (!selectedProductId) {
      setAddToCartMessage('خطأ: لم يتم تحديد المنتج');
      return;
    }

    setIsAddingToCart(true);
    setAddToCartMessage('');

    try {
      const cartUrl = `${baseUrl}/api/customers/product-carts`;
      const response = await fetch(cartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          count: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product added to cart:', data);
      setAddToCartMessage('✓ تم إضافة المنتج للسلة بنجاح');

      // Reset quantity after successful add
      setTimeout(() => {
        setQuantity(1);
        setAddToCartMessage('');
      }, 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddToCartMessage(`خطأ: ${err.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedProductId) {
      setWishlistMessage('خطأ: لم يتم تحديد المنتج');
      return;
    }

    setIsAddingToWishlist(true);
    setWishlistMessage('');

    try {
      const wishlistUrl = `${baseUrl}/api/customers/wish-lists`;
      const response = await fetch(wishlistUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          product_id: selectedProductId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product added to wishlist:', data);
      setWishlistMessage('✓ تم إضافة المنتج للمفضلة بنجاح');

      // Clear message after 2 seconds
      setTimeout(() => {
        setWishlistMessage('');
      }, 2000);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setWishlistMessage(`خطأ: ${err.message}`);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-stone)' }}>
        جاري تحميل تفاصيل المنتج...
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-red)' }}>
        {error || 'Failed to load product'}
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'الرئيسية', pageId: 'home' },
    { label: 'المتجر', pageId: 'shop' },
    { label: productData.category, pageId: 'category' },
    { label: productData.name, pageId: null },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />

      <div className={styles.productGrid}>
        {/* ── Gallery ── */}
        <div>
          <div className={styles.mainImage}>
            {productData.image ? (
              <img
                src={productData.image}
                alt={productData.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            ) : (
              <ImageIcon size={80} />
            )}
          </div>
          <div className={styles.thumbnails}>
            {[0].map((i) => (
              <div key={i} className={`${styles.thumb} ${styles.thumbActive}`}>
                {productData.image ? (
                  <img
                    src={productData.image}
                    alt={productData.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                ) : (
                  <ImageIcon size={24} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Details ── */}
        <div>
          <div className={styles.badgeWrap}>
            {productData.inStock ? (
              <Badge text="متوفر" variant="primary" />
            ) : (
              <Badge text="غير متوفر" variant="sale" />
            )}
          </div>

          <h1 className={styles.productTitle}>{productData.name}</h1>

          <div className={styles.ratingWrap}>
            <StarRating rating={productData.rating} reviewCount={48} size="md" />
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{productData.price} $</span>
            <span className={styles.oldPrice}>{productData.oldPrice} $</span>
          </div>

          <div className={styles.actions}>
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button
              variant="primary"
              icon={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
            </Button>
            <Button
              variant="outline"
              icon={<Heart size={16} />}
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              {isAddingToWishlist ? 'جاري الإضافة...' : 'أضف للمفضلة'}
            </Button>
          </div>

          {addToCartMessage && (
            <p style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: addToCartMessage.includes('خطأ') ? '#fee' : '#f0fdf4',
              color: addToCartMessage.includes('خطأ') ? 'var(--color-red)' : 'var(--color-green)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {addToCartMessage}
            </p>
          )}

          {wishlistMessage && (
            <p style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: wishlistMessage.includes('خطأ') ? '#fee' : '#f0fdf4',
              color: wishlistMessage.includes('خطأ') ? 'var(--color-red)' : 'var(--color-green)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {wishlistMessage}
            </p>
          )}

          <p className={styles.availability}>
            <Check size={16} />
            {productData.inStock ? 'متوفر — يُشحن خلال ٣-٥ أيام عمل' : 'غير متوفر حالياً'}
          </p>
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className={styles.reviews}>
        <SectionHeader title="تقييمات العملاء" align="start" />
        {reviews.map((r) => (
          <div key={r.name} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <p className={styles.reviewName}>{r.name}</p>
                <StarRating rating={r.rating} size="sm" />
              </div>
              <span className={styles.reviewDate}>{r.date}</span>
            </div>
            <p className={styles.reviewText}>{r.text}</p>
          </div>
        ))}
      </div>

      {/* ── Related Products ── */}
      <div className={styles.related}>
        <SectionHeader title="منتجات مشابهة" />
        <div className={styles.relatedGrid}>
          {products.slice(1, 5).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={() => onNavigate?.('product')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
