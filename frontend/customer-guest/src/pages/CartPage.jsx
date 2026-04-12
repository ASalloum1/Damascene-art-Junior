import { useState } from 'react';
import { Trash2, ImageIcon } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { QuantitySelector } from '../components/QuantitySelector.jsx';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { products } from '../data/index.js';
import styles from './CartPage.module.css';

export function CartPage({ onNavigate }) {
  const [qty0, setQty0] = useState(1);
  const [qty1, setQty1] = useState(1);

  const cartItems = [
    { product: products[0], qty: qty0, setQty: setQty0 },
    { product: products[1], qty: qty1, setQty: setQty1 },
  ];

  const summaryItems = [
    { name: products[0].name, price: '١,٢٠٠', qty: qty0 },
    { name: products[1].name, price: '٤٠٠', qty: qty1 },
  ];

  return (
    <div className={styles.page}>
      <SectionHeader title="سلة المشتريات" />

      <div className={styles.grid}>
        {/* Left: Items */}
        <div>
          {cartItems.map(({ product, qty, setQty }) => (
            <div key={product.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <ImageIcon size={28} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{product.name}</p>
                <p className={styles.itemCat}>{product.cat}</p>
                <QuantitySelector value={qty} onChange={setQty} />
              </div>
              <span className={styles.itemPrice}>{product.price} $</span>
              <button type="button" className={styles.deleteBtn} aria-label="حذف المنتج">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <OrderSummary
          showCoupon
          items={summaryItems}
          subtotal="١,٦٠٠"
          discount="١٦٠"
          shipping="٣٥"
          total="١,٤٧٥"
          actionLabel="متابعة الشراء ←"
          onAction={() => onNavigate?.('checkout')}
        />
      </div>
    </div>
  );
}

export default CartPage;
