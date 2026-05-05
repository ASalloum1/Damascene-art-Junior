import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { Button } from '../components/Button.jsx';
import { mapApiProduct, readJsonSafely } from '../utils/customerApi.js';
import styles from './SearchPage.module.css';

export function SearchPage({ onNavigate }) {
  const { baseUrl, endpoints, searchQuery, setSearchQuery, setSelectedProductId } = useApi();
  const [query, setQuery] = useState(searchQuery || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (nextQuery = query) => {
    const trimmedQuery = nextQuery.trim();
    setSearchQuery(trimmedQuery);
    setIsLoading(true);
    setError('');

    try {
      const url = new URL(`${baseUrl}${endpoints.search}`);
      if (trimmedQuery) {
        url.searchParams.set('q', trimmedQuery);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل نتائج البحث');
      }

      setResults((data?.data?.products || []).map(mapApiProduct));
    } catch (searchError) {
      setError(searchError.message || 'تعذر تنفيذ البحث');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      runSearch(searchQuery);
    }
  }, []);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                runSearch(e.currentTarget.value);
              }
            }}
          />
          <Button variant="primary" onClick={() => runSearch()}>
            {isLoading ? 'جاري البحث...' : 'بحث'}
          </Button>
        </div>
      </div>

      {/* Results info */}
      <p className={styles.resultsMeta}>
        نتائج البحث عن:{' '}
        <span className={styles.resultsKeyword}>"{searchQuery || query || '...' }"</span>
        {' '}— {results.length} نتائج
      </p>

      {error ? <p className={styles.resultsMeta} style={{ color: 'var(--color-red)' }}>{error}</p> : null}
      {!isLoading && !error && results.length === 0 ? (
        <p className={styles.resultsMeta}>لا توجد نتائج مطابقة حالياً.</p>
      ) : null}

      {/* Grid */}
      <div className={styles.grid}>
        {results.map((product) => (
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
  );
}

export default SearchPage;
