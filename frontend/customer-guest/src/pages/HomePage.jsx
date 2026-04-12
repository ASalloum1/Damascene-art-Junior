import { Layers, TreePine, Sparkles, Scissors, Flame, CircleDot, Diamond } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Btn } from '../components/Btn.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { CategoryCard } from '../components/CategoryCard.jsx';
import { TestimonialCard } from '../components/TestimonialCard.jsx';
import { products, categories, testimonials } from '../data/index.js';
import styles from './HomePage.module.css';

const categoryIconMap = {
  mosaic: Layers,
  wood: TreePine,
  glass: Sparkles,
  brocade: Scissors,
  brass: Flame,
  pottery: CircleDot,
};

export function HomePage({ onNavigate }) {
  return (
    <div>
      {/* ── 1. Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroOrnament}>
            <Diamond size={10} />
            <Diamond size={10} />
            <Diamond size={10} />
          </div>
          <p className={styles.heroTagline}>✦ إرث دمشق في بيتك ✦</p>
          <h1 className={styles.heroTitle}>
            قطع فنية دمشقية أصيلة مصنوعة بأيدي أمهر الحرفيين
          </h1>
          <p className={styles.heroSubtitle}>
            اكتشف جمال الفسيفساء والبروكار والزجاج المنفوخ والخشب المطعّم بالصدف
          </p>
          <div className={styles.heroBtns}>
            <Btn variant="primary" onClick={() => onNavigate?.('shop')}>
              تصفّح المتجر
            </Btn>
            <Btn variant="outline" onClick={() => onNavigate?.('about')}>
              اكتشف قصتنا
            </Btn>
          </div>
        </div>
      </section>

      {/* ── 2. Categories ── */}
      <section className={styles.categories}>
        <div className={styles.container}>
          <SectionHeader
            title="تصنيفات الفن الدمشقي"
            subtitle="اختر الحرفة التي تسحر قلبك"
          />
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                count={cat.count}
                icon={categoryIconMap[cat.id]}
                onClick={() => onNavigate?.('category')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Products ── */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <SectionHeader
            title="منتجات مميزة"
            subtitle="قطع فنية مختارة بعناية"
          />
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={() => onNavigate?.('product')}
                onAddToCart={() => onNavigate?.('cart')}
              />
            ))}
          </div>
          <div className={styles.featuredCta}>
            <Btn variant="outline" onClick={() => onNavigate?.('shop')}>
              عرض كل المنتجات ←
            </Btn>
          </div>
        </div>
      </section>

      {/* ── 4. Story ── */}
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <SectionHeader
            title="قصة الفن الدمشقي"
            subtitle="آلاف السنين من الإبداع والأصالة"
            light
          />
          <p className={styles.storyText}>
            منذ أكثر من ٥٠٠٠ عام، أبدعت أيدي الحرفيين في دمشق أجمل الفنون. من الفسيفساء التي
            تزيّن القصور إلى البروكار الذي كان يُهدى للملوك، نحمل هذا الإرث ونوصله إلى بيتك.
          </p>
          <Btn variant="primary" onClick={() => onNavigate?.('about')}>
            اقرأ المزيد
          </Btn>
        </div>
      </section>

      {/* ── 5. Testimonials ── */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <SectionHeader title="ماذا يقول عملاؤنا" />
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
