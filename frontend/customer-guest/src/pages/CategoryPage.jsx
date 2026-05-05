import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { PageHero } from '../components/PageHero.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { mapApiProduct, readJsonSafely } from '../utils/customerApi.js';
import styles from './CategoryPage.module.css';

export function CategoryPage({ onNavigate }) {
  const { baseUrl, endpoints, selectedCategory, setSelectedProductId } = useApi();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategoryProducts() {
      if (!selectedCategory?.id) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${baseUrl}${endpoints.categoryProducts(selectedCategory.id)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await readJsonSafely(response);

        if (!response.ok) {
          throw new Error(data.message || 'فشل تحميل منتجات الفئة');
        }

        setProducts((data?.data?.products || []).map(mapApiProduct));
      } catch (categoryError) {
        setError(categoryError.message || 'تعذر تحميل منتجات الفئة');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoryProducts();
  }, [baseUrl, endpoints, selectedCategory]);

  return (
    <div className={styles.page}>
      <PageHero
        icon={Layers}
        title={selectedCategory?.name || 'الفئة المختارة'}
        subtitle="استكشف المنتجات المتاحة ضمن هذه الفئة مباشرة من قاعدة البيانات."
      />
      <div className={styles.container}>
        {isLoading ? <p>جاري تحميل منتجات الفئة...</p> : null}
        {error ? <p style={{ color: 'var(--color-red)' }}>{error}</p> : null}
        {!isLoading && !error && products.length === 0 ? <p>لا توجد منتجات في هذه الفئة حالياً.</p> : null}
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={(productId) => {
                setSelectedProductId(productId);
                onNavigate?.('product');
              }}
              onAddToCart={() => onNavigate?.('cart')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
