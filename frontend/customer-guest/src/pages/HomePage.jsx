import { Layers, TreePine, Sparkles, Scissors, Flame, CircleDot, Diamond } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { Button } from '../components/Button.jsx';
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
            title="مقتنيات مختارة"
            subtitle="جواهر فنية نُسجت بعناية لتليق بذوقكم الرفيع"
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
            <Button variant="outline" onClick={() => onNavigate?.('shop')}>
              مشاهدة المجموعة الكاملة ←
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Story ── */}
      <section className={styles.story}>
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
