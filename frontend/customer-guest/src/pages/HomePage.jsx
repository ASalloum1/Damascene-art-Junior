import { useEffect, useState } from 'react';
import { Layers, TreePine, Sparkles, Scissors, Flame, CircleDot, Diamond } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Button } from '../components/Button.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { CategoryCard } from '../components/CategoryCard.jsx';
import { TestimonialCard } from '../components/TestimonialCard.jsx';
import { Ornament } from '../components/Ornament.jsx';
import { products, categories as defaultCategories, testimonials } from '../data/index.js';
import { useApi } from '../context/ApiContext.jsx';
import { API_CONFIG } from '../config/api.config.js';
import styles from './HomePage.module.css';

const categoryIconMap = {
  mosaic: Layers,
  wood: TreePine,
  glass: Sparkles,
  brocade: Scissors,
  brass: Flame,
  pottery: CircleDot,
};

const getCategoryKey = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('wood') || lower.includes('خشب')) return 'wood';
  if (lower.includes('glass') || lower.includes('زجاج')) return 'glass';
  if (lower.includes('mosaic') || lower.includes('فسيفساء') || lower.includes('موزاييك')) return 'mosaic';
  if (lower.includes('brocade') || lower.includes('بروكار')) return 'brocade';
  if (lower.includes('brass') || lower.includes('نحاس')) return 'brass';
  if (lower.includes('pottery') || lower.includes('فخار') || lower.includes('خزف')) return 'pottery';
  return 'mosaic';
};

export function HomePage({ onNavigate }) {
  const { baseUrl, endpoints, setSelectedCategory, setSelectedProductId } = useApi();
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      setFetchError(false);
      const url = `${baseUrl}${endpoints.categories}`;
      console.log('[HomePage] fetching categories from', url);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: API_CONFIG.DEFAULT_HEADERS,
        });

        console.log('[HomePage] categories response status', response.status);
        const data = await response.json();
        console.log('[HomePage] categories response body', data);

        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        if (data?.data?.categories?.length) {
          setCategoriesData(data.data.categories);
          return;
        }

        setCategoriesData(defaultCategories);
      } catch (error) {
        console.error('[HomePage] Category fetch failed:', error);
        setFetchError(true);
        setCategoriesData(defaultCategories);
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, [baseUrl, endpoints.categories]);

  return (
    <div>
      {/* ── 1. Hero ── */}
      <section className={styles.hero}>
        <Ornament />
        <div className={styles.heroContent}>
          <div className={styles.heroOrnament}>
            <Diamond size={10} />
            <Diamond size={10} />
            <Diamond size={10} />
          </div>
          <p className={styles.heroTagline}>✦ أناقة التاريخ تتجلى في منزلك ✦</p>
          <h1 className={styles.heroTitle}>
            روائع دمشقية تروي حكايا الإبداع بأنامل كبار الحرفيين
          </h1>
          <p className={styles.heroSubtitle}>
            انغمس في سحر الموزاييك والبروكار والزجاج المنفوخ والخشب المطعّم بعرق اللؤلؤ
          </p>
          <div className={styles.heroBtns}>
            <Button variant="primary" onClick={() => onNavigate?.('shop')}>
              استكشف المجموعة
            </Button>
            <Button variant="outline" onClick={() => onNavigate?.('about')}>
              رحلتنا مع الأصالة
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. Categories ── */}
      <section className={styles.categories}>
        <div className={styles.container}>
          <SectionHeader
            title="روافد الإبداع الشامي"
            subtitle="تجوّل بين روائع الفنون التي تأسر الحواس"
          />
          <div className={styles.categoryGrid}>
            {isLoadingCategories ? (
              <p className={styles.loading}>جاري تحميل الفئات...</p>
            ) : categoriesData.length > 0 ? (
              categoriesData.map((cat) => {
                const iconKey = getCategoryKey(cat.name);
                return (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    count={cat.count ?? 0}
                    icon={categoryIconMap[iconKey]}
                    onClick={() => {
                      setSelectedCategory({ id: cat.id, name: cat.name });
                      onNavigate?.('category');
                    }}
                  />
                );
              })
            ) : (
              <p className={styles.empty}>
                {fetchError
                  ? 'تعذر تحميل الفئات. الرجاء المحاولة لاحقاً.'
                  : 'لا توجد فئات متاحة حالياً.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Products ── */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <SectionHeader
            title="مقتنيات مختارة"
            subtitle="جواهر فنية نُسجت بعناية لتليق بذوقكم الرفيع"
          />
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product) => (
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
          <div className={styles.featuredCta}>
            <Button variant="outline" onClick={() => onNavigate?.('shop')}>
              مشاهدة المجموعة الكاملة ←
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Story ── */}
      <section className={styles.story}>
        <Ornament />
        <div className={styles.storyContent}>
          <SectionHeader
            title="سيمفونية الإبداع الدمشقي"
            subtitle="حكايات خُلّدت عبر آلاف السنين من الفن والأصالة"
            light
          />
          <p className={styles.storyText}>
            منذ فجر التاريخ، أبدعت أيدي الحرفيين في دمشق أجمل الفنون التي حاكت الشمس ببريقها. من الموزاييك الذي يزيّن قصور الشرق إلى البروكار الذي كان خياراً للملوك، نحمل هذا الإرث العريق ليكون جزءاً من تفاصيل يومكم.
          </p>
          <Button variant="primary" onClick={() => onNavigate?.('about')}>
            اكتشف المزيد عن إرثنا
          </Button>
        </div>
      </section>

      {/* ── 5. Testimonials ── */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <SectionHeader title="أصداء الرضا من مقتني أعمالنا" />
          <div className={styles.testimonialGrid}>
            {testimonials.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                text={t.text}
                rating={t.rating}
                location={t.location}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
