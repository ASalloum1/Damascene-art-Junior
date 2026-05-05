import { useState, useEffect } from 'react';
import { Trash2, ImageIcon, ShoppingCart } from 'lucide-react';
import { useApi } from '../context/ApiContext.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';
import { QuantitySelector } from '../components/QuantitySelector.jsx';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { Button } from '../components/Button.jsx';
import styles from './CartPage.module.css';

export function CartPage({ onNavigate }) {
  const { baseUrl, bearerToken } = useApi();
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantityMap, setQuantityMap] = useState({});
  const [quantityError, setQuantityError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  // Fetch cart data on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/customers/carts/in-progres`, {
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
      console.log('Cart data received:', data);

      setCartData(data.data);

      // Initialize quantity map
      const qtyMap = {};
      data.data.product_carts?.forEach((item) => {
        qtyMap[item.id] = item.count;
      });
      setQuantityMap(qtyMap);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'فشل تحميل السلة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId, newQtyOrFn) => {
    const currentQty = quantityMap[cartItemId] || 0;
    // QuantitySelector passes a function, so we need to evaluate it
    const newQty = typeof newQtyOrFn === 'function' ? newQtyOrFn(currentQty) : newQtyOrFn;

    console.log('handleQuantityChange called:', { cartItemId, currentQty, newQty });

    // Handle + button (increment)
    if (newQty > currentQty) {
      try {
        setQuantityError('');
        console.log('Calling plus-one API with product_cart_id:', cartItemId);

        const response = await fetch(`${baseUrl}/api/customers/product-carts/plus-one`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            product_cart_id: cartItemId,
          }),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `خطأ: ${response.status}`);
        }

        const data = await response.json();
        console.log('Quantity increased successfully:', data);

        // Update cartData with new cart and product_carts
        setCartData((prev) => ({
          ...prev,
          cart: data.data.cart,
          product_carts: prev.product_carts.map((item) =>
            item.id === cartItemId ? data.data.product_cart : item
          ),
        }));

        // Update quantityMap with new count from API response
        setQuantityMap((prev) => ({
          ...prev,
          [cartItemId]: data.data.product_cart.count,
        }));
      } catch (err) {
        console.error('Error increasing quantity:', err);
        setQuantityError(`خطأ: ${err.message}`);
        setTimeout(() => setQuantityError(''), 3000);
      }
    } else if (newQty < currentQty) {
      // Handle - button (decrement)
      try {
        setQuantityError('');
        console.log('Calling minus-one API with product_cart_id:', cartItemId);

        const response = await fetch(`${baseUrl}/api/customers/product-carts/minus-one`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            product_cart_id: cartItemId,
          }),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `خطأ: ${response.status}`);
        }

        const data = await response.json();
        console.log('Quantity decreased successfully:', data);

        // Update cartData with new cart and product_carts
        setCartData((prev) => ({
          ...prev,
          cart: data.data.cart,
          product_carts: prev.product_carts.map((item) =>
            item.id === cartItemId ? data.data.product_cart : item
          ),
        }));

        // Update quantityMap with new count from API response
        setQuantityMap((prev) => ({
          ...prev,
          [cartItemId]: data.data.product_cart.count,
        }));
      } catch (err) {
        console.error('Error decreasing quantity:', err);
        setQuantityError(`خطأ: ${err.message}`);
        setTimeout(() => setQuantityError(''), 3000);
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('برجاء إدخال كود الخصم');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage('');

    try {
      console.log('Applying coupon:', couponCode);

      const response = await fetch(`${baseUrl}/api/customers/carts/apply-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          code: couponCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ: ${response.status}`);
      }

      const data = await response.json();
      console.log('Coupon applied successfully:', data);

      // Update cartData with new totals
      setCartData(data.data);
      setCouponCode('');
      setCouponMessage('✓ تم تطبيق الكود بنجاح');
      setTimeout(() => setCouponMessage(''), 2000);
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponMessage(`خطأ: ${err.message}`);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleDeleteItem = async (cartItemId) => {
    try {
      setQuantityError('');
      console.log('Deleting item:', cartItemId);

      const response = await fetch(`${baseUrl}/api/customers/product-carts/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          id: cartItemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ: ${response.status}`);
      }

      const data = await response.json();
      console.log('Item deleted successfully:', data);

      // Update cartData - remove the deleted item and update cart totals
      setCartData((prev) => ({
        ...prev,
        cart: data.data.cart,
        product_carts: prev.product_carts.filter((item) => item.id !== cartItemId),
      }));

      // Remove from quantityMap
      setQuantityMap((prev) => {
        const updated = { ...prev };
        delete updated[cartItemId];
        return updated;
      });

      setQuantityError('تم حذف المنتج من السلة بنجاح');
      setTimeout(() => setQuantityError(''), 2000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setQuantityError(`خطأ: ${err.message}`);
    }
  };

  // Format number to Arabic numerals
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!cartData?.product_carts) return { subtotal: 0, discount: 0, total: 0 };

    const subtotal = parseFloat(cartData.cart.total_price_before_coupon) || 0;
    const total = parseFloat(cartData.cart.total_price_after_coupon) || 0;
    const discount = subtotal - total;

    return { subtotal, discount, total };
  };

  const totals = calculateTotals();
  const isEmpty = !cartData?.product_carts || cartData.product_carts.length === 0;

  // Calculate total item count
  const totalItemsCount = cartData?.product_carts?.reduce((sum, item) => {
    return sum + (quantityMap[item.id] || item.count);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-stone)' }}>
        جاري تحميل السلة...
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

  // Prepare summary items from cart data
  const summaryItems = cartData?.product_carts?.map((item) => {
    const qty = quantityMap[item.id] || item.count;
    const unitPrice = parseFloat(item.product.new_price);
    const subtotal = unitPrice * qty;
    return {
      name: item.product.name,
      unitPrice: formatPrice(unitPrice),
      qty: qty,
      subtotal: formatPrice(subtotal),
    };
  }) || [];

  return (
    <div className={styles.page}>
      <SectionHeader title="سلة المشتريات" />

      {isEmpty ? (
        <div className={styles.emptyState}>
          <ShoppingCart
            className={styles.emptyIcon}
            size={72}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className={styles.emptyTitle}>سلة المشتريات فارغة</p>
          <p className={styles.emptyDesc}>لم تُضف أي قطعة بعد إلى سلتك. تصفّح مجموعتنا واختر ما يناسبك.</p>
          <Button variant="primary" onClick={() => onNavigate?.('shop')}>
            تصفّح المتجر
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {quantityError && (
            <div style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-3)',
              backgroundColor: '#fee',
              color: 'var(--color-red)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              gridColumn: '1 / -1',
            }}>
              {quantityError}
            </div>
          )}

          {/* Left: Items */}
          <div>
            {cartData?.product_carts?.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageIcon size={28} />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.product.name}</p>
                  <p className={styles.itemCat}>
                    السعر: {item.product.new_price} $
                  </p>
                  <QuantitySelector
                    value={quantityMap[item.id] || item.count}
                    onChange={(newQty) => handleQuantityChange(item.id, newQty)}
                  />
                </div>
                <span className={styles.itemPrice}>
                  {formatPrice(item.sum_price)} $
                </span>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label="حذف المنتج"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <OrderSummary
            showCoupon
            items={summaryItems}
            totalItems={totalItemsCount}
            subtotal={formatPrice(totals.subtotal)}
            discount={totals.discount > 0 ? formatPrice(totals.discount) : undefined}
            total={formatPrice(totals.total)}
            actionLabel="متابعة الشراء ←"
            onAction={() => onNavigate?.('checkout')}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            isApplyingCoupon={isApplyingCoupon}
            couponMessage={couponMessage}
          />
        </div>
      )}
    </div>
  );
}

export default CartPage;
