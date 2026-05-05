import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { Button } from '../components/Button.jsx';
import { categories } from '../data/index.js';
import styles from './ShopPage.module.css';

export function ShopPage({ onNavigate }) {
  const { baseUrl, endpoints, setSelectedProductId } = useApi();
  const [filterOpen, setFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cache references for 2 minute debounce
  const lastFetchTime = useRef(null);
  const cachedProducts = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      const now = Date.now();
      const TWO_MINUTES = 2 * 60 * 1000; // 2 minutes in milliseconds

      // Check if we have cached data and it's less than 2 minutes old
      if (
        cachedProducts.current &&
        lastFetchTime.current &&
        now - lastFetchTime.current < TWO_MINUTES
      ) {
        console.log('Using cached products (within 2 minutes)');
        setProducts(cachedProducts.current);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data from API
      setIsLoading(true);
      setError('');
      
      try {
        // Debug: Log the configuration
        console.log('API Config:', { baseUrl, endpoints });
        
        const apiUrl = `${baseUrl}${endpoints.products}`;
        console.log('Full API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('API Response Status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `خطأ API: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('API Data received:', data);
        
        // Map API response to match ProductCard component expectations
        const mappedProducts = data.data.products.map((product) => {
          // Handle image URL - convert to use local proxy for ngrok requests
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
            
            // Decode URI-encoded characters in the URL
            try {
              imageUrl = decodeURIComponent(imageUrl);
            } catch (e) {
              // If decoding fails, use original URL
            }
          }
          
          return {
            id: product.id,
            name: product.name,
            price: parseFloat(product.new_price),
            oldPrice: parseFloat(product.old_price),
            image: imageUrl,
            rating: parseFloat(product.average_rate),
            cat: product.category.name,
            inStock: product.amount > 0,
          };
        });
        
        // Update cache and timestamp
        cachedProducts.current = mappedProducts;
        lastFetchTime.current = now;
        
        setProducts(mappedProducts);
        console.log('✅ Products fetched and cached successfully:', mappedProducts.length, 'products');
      } catch (err) {
        console.error('Error fetching products:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
        });
        
        setError(err.message || 'حدث خطأ في تحميل المنتجات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [baseUrl, endpoints]);

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
              {r < 5 ? ' فأكثر' : null}
            </span>
          </label>
        ))}
      </div>

      <Button variant="primary" full size="sm">
        تطبيق الفلاتر
      </Button>
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
      {filterOpen ? (
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
      ) : null}

      <div className={styles.layout}>
        {/* Desktop sidebar */}
        <aside className={styles.sidebar}>
          {filterSidebarContent}
        </aside>

        {/* Main */}
        <div className={styles.main}>
          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#FEE2E2',
              borderLeft: '4px solid #DC2626',
              borderRadius: '8px',
              color: '#991B1B',
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--color-stone)',
              fontSize: 'var(--font-size-base)',
            }}>
              جاري تحميل المنتجات...
            </div>
          ) : (
            <>
              <div className={styles.sortRow}>
                <span className={styles.resultCount}>
                  عرض ١-{Math.min(8, products.length)} من {products.length} منتج
                </span>
                <select className={styles.sortSelect}>
                  <option>الأكثر مبيعاً</option>
                  <option>الأحدث</option>
                  <option>السعر: من الأقل</option>
                  <option>السعر: من الأعلى</option>
                  <option>التقييم</option>
                </select>
              </div>

              {/* No Products Found */}
              {products.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--color-stone)',
                  fontSize: 'var(--font-size-base)',
                }}>
                  لا توجد منتجات متاحة
                </div>
              ) : (
                <>
                  <div className={styles.productGrid}>
                    {products.slice(0, 8).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onNavigate={() => {
                          setSelectedProductId(product.id);
                          onNavigate?.('product');
                        }}
                        onAddToCart={() => onNavigate?.('cart')}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {products.length > 8 && (
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
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
