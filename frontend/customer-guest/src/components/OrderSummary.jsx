import { Btn } from './Btn.jsx';
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
}) {
  return (
    <aside className={styles.card}>
      <h3 className={styles.heading}>ملخص الطلب</h3>

      {items.length > 0 && (
        <ul className={styles.itemsList}>
          {items.map((item, idx) => (
            <li key={idx} className={styles.itemRow}>
              <span className={styles.itemName}>
                {item.name}
                {item.qty > 1 && (
                  <span className={styles.itemQty}> ×{item.qty}</span>
                )}
              </span>
              <span className={styles.itemPrice}>{item.price} $</span>
            </li>
          ))}
        </ul>
      )}

      {showCoupon && (
        <div className={styles.couponRow}>
          <InputField placeholder="كوبون الخصم" />
          <Btn variant="primary" size="sm">تطبيق</Btn>
        </div>
      )}

      <div className={styles.lineItems}>
        {subtotal !== undefined && (
          <div className={styles.lineItem}>
            <span>المجموع الفرعي</span>
            <span>{subtotal} $</span>
          </div>
        )}
        {discount !== undefined && (
          <div className={styles.lineItem}>
            <span>الخصم</span>
            <span className={styles.discount}>−{discount} $</span>
          </div>
        )}
        {shipping !== undefined && (
          <div className={styles.lineItem}>
            <span>الشحن</span>
            <span>{shipping} $</span>
          </div>
        )}
        {wrapping !== undefined && (
          <div className={styles.lineItem}>
            <span>التغليف</span>
            <span>{wrapping} $</span>
          </div>
        )}
      </div>

      {total !== undefined && (
        <div className={styles.totalRow}>
          <span>الإجمالي</span>
          <span>{total} $</span>
        </div>
      )}

      {actionLabel && (
        <Btn variant="primary" full onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </Btn>
      )}
    </aside>
  );
}

export default OrderSummary;
