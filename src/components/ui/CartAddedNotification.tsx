'use client';
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { formatPrice, getLanguageDisplay } from '@/lib/utils';
import styles from './CartAddedNotification.module.css';

export default function CartAddedNotification() {
  const { lastAddedItem, clearLastAddedItem } = useCart();

  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => {
        clearLastAddedItem();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, clearLastAddedItem]);

  if (!lastAddedItem) return null;

  return (
    <div className={styles.notificationCard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <CheckCircle2 size={20} />
          <span>Added to Cart Successfully!</span>
        </div>
        <button
          onClick={clearLastAddedItem}
          className={styles.closeBtn}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>

      {/* Item Details */}
      <div className={styles.itemRow}>
        <img
          src={lastAddedItem.productImage}
          alt={lastAddedItem.productName}
          className={styles.productImg}
        />
        <div className={styles.itemInfo}>
          <div className={styles.productName}>
            {lastAddedItem.productName}
          </div>
          <div className={styles.productMeta}>
            Medium: <strong style={{ color: '#2563eb' }}>{getLanguageDisplay(lastAddedItem.language)}</strong> • Qty: {lastAddedItem.quantity}
          </div>
          <div className={styles.productPrice}>
            {formatPrice(lastAddedItem.price * lastAddedItem.quantity)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actionRow}>
        <Link
          href="/cart"
          onClick={clearLastAddedItem}
          className={styles.cartBtn}
        >
          <ShoppingBag size={16} />
          View Cart
        </Link>

        <Link
          href="/checkout"
          onClick={clearLastAddedItem}
          className={styles.checkoutBtn}
        >
          Checkout
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
