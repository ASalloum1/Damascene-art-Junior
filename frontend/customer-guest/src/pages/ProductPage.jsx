import { useState } from 'react';
import { ImageIcon, Heart, ShoppingCart, Check } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { Badge } from '../components/Badge.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { QuantitySelector } from '../components/QuantitySelector.jsx';
import { Btn } from '../components/Btn.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { products } from '../data/index.js';
import styles from './ProductPage.module.css';

const breadcrumbItems = [
  { label: 'الرئيسية', pageId: 'home' },
  { label: 'المتجر', pageId: 'shop' },
  { label: 'فسيفساء', pageId: 'category' },
  { label: 'طاولة موزاييك دمشقية', pageId: null },
];

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
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={styles.page}>
      <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />

      <div className={styles.productGrid}>
        {/* ── Gallery ── */}
        <div>
          <div className={styles.mainImage}>
            <ImageIcon size={80} />
          </div>
          <div className={styles.thumbnails}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${styles.thumb} ${i === 0 ? styles.thumbActive : ''}`}>
                <ImageIcon size={24} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Details ── */}
        <div>
          <div className={styles.badgeWrap}>
            <Badge text="الأكثر مبيعاً" variant="primary" />
          </div>

          <h1 className={styles.productTitle}>طاولة موزاييك دمشقية</h1>

          <div className={styles.ratingWrap}>
            <StarRating rating={5} reviewCount={48} size="md" />
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>١,٢٠٠ $</span>
            <span className={styles.oldPrice}>١,٤٠٠ $</span>
            <Badge text="خصم ١٤%" variant="sale" />
          </div>

          <p className={styles.description}>
            طاولة موزاييك دمشقية مصنوعة يدوياً بالكامل من خشب الجوز المعتّق، مطعّمة بآلاف القطع
            من الصدف الطبيعي والخشب الملوّن. كل قطعة فريدة وتحمل لمسة الحرفي الشامي.
          </p>

          <div className={styles.specs}>
            <dl>
              <dt>المواد</dt>
              <dd>خشب جوز + صدف طبيعي</dd>
              <dt>الأبعاد</dt>
              <dd>٦٠×٦٠×٤٥ سم</dd>
              <dt>الوزن</dt>
              <dd>٨ كغ</dd>
              <dt>الحرفي</dt>
              <dd>الأسطى أبو خالد — ورشة الحميدية</dd>
            </dl>
          </div>

          <div className={styles.actions}>
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Btn
              variant="primary"
              icon={<ShoppingCart size={16} />}
              onClick={() => onNavigate?.('cart')}
            >
              أضف للسلة
            </Btn>
            <Btn variant="outline" icon={<Heart size={16} />}>
              أضف للمفضلة
            </Btn>
          </div>

          <p className={styles.availability}>
            <Check size={16} />
            متوفر — يُشحن خلال ٣-٥ أيام عمل
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
              onAddToCart={() => onNavigate?.('cart')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
