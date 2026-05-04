import { Button } from './Button.jsx';
import { InputField } from './InputField.jsx';
import styles from './OrderSummary.module.css';

export function OrderSummary({
  items = [],
  subtotal,
  discount,
  shipping,
  wrapping,
  total,
  showCoupon = false,
  onAction,
  actionLabel,
  totalItems,
  couponCode = '',
  onCouponChange,
  onApplyCoupon,
  isApplyingCoupon = false,
  couponMessage = '',
}) {
  return (
    <aside className={styles.card}>
      <h3 className={styles.heading}>ملخص الطلب</h3>

      {totalItems !== undefined && (
        <div style={{
          padding: 'var(--space-2) 0',
          marginBottom: 'var(--space-3)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-stone)',
          borderBottom: '1px solid var(--color-cream-dark)',
        }}>
          إجمالي العناصر: <strong>{totalItems}</strong>
        </div>
      )}

      {items.length > 0 ? (
        <>
          <ul className={styles.itemsList}>
            {items.map((item, idx) => (
              <li key={idx} className={styles.itemRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <span className={styles.itemName}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-stone)' }}>
                    {item.unitPrice} $ ×{item.qty} = {item.subtotal} $
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {total !== undefined && (
            <div style={{
              padding: 'var(--space-3) 0',
              marginBottom: 'var(--space-3)',
              borderTop: '1px solid var(--color-cream-dark)',
              borderBottom: '1px solid var(--color-cream-dark)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-navy)' }}>
                الإجمالي
              </span>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--color-navy)' }}>
                $ {total}
              </span>
            </div>
          )}
        </>
      ) : null}

      {showCoupon ? (
        <div>
          <div className={styles.couponRow}>
            <InputField
              placeholder="كوبون الخصم"
              value={couponCode}
              onChange={(e) => onCouponChange?.(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={onApplyCoupon}
              disabled={isApplyingCoupon}
            >
              {isApplyingCoupon ? 'جاري...' : 'تطبيق'}
            </Button>
          </div>
          {couponMessage && (
            <p style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-2)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: couponMessage.includes('خطأ') ? '#fee' : '#f0fdf4',
              color: couponMessage.includes('خطأ') ? 'var(--color-red)' : 'var(--color-green)',
              fontSize: 'var(--font-size-xs)',
              margin: '0',
              marginTop: 'var(--space-2)',
            }}>
              {couponMessage}
            </p>
          )}
        </div>
      ) : null}

      <div className={styles.lineItems}>
        {subtotal !== undefined ? (
          <div className={styles.lineItem}>
            <span>المجموع الفرعي</span>
            <span>{subtotal} $</span>
          </div>
        ) : null}
        {discount !== undefined ? (
          <div className={styles.lineItem}>
            <span>الخصم</span>
            <span className={styles.discount}>−{discount} $</span>
          </div>
        ) : null}
        {shipping !== undefined ? (
          <div className={styles.lineItem}>
            <span>الشحن</span>
            <span>{shipping} $</span>
          </div>
        ) : null}
        {wrapping !== undefined ? (
          <div className={styles.lineItem}>
            <span>التغليف</span>
            <span>{wrapping} $</span>
          </div>
        ) : null}
      </div>

      {total !== undefined ? (
        <div className={styles.totalRow}>
          <span>الإجمالي</span>
          <span>{total} $</span>
        </div>
      ) : null}

      {actionLabel ? (
        <Button variant="primary" full onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </Button>
      ) : null}
    </aside>
  );
}

export default OrderSummary;
