'use client';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, getLanguageDisplay } from '@/lib/utils';
import { WishlistItem } from '@/types';
import { Heart } from 'lucide-react';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();

  const handleMoveToCart = (item: WishlistItem) => {
    const lang = item.languages?.[0]?.code || 'en';
    addItem({
      id: item.productId,
      slug: item.productSlug,
      name: item.productName,
      image: item.productImage,
      price: item.price,
      badge: item.badge,
      description: '',
      category: '',
      languages: item.languages || [],
      stock: 100,
    }, lang);
    removeItem(item.productId);
    toast.success(`${item.productName} moved to cart`);
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={`container ${styles.breadcrumbWrap}`}>
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span>/</span>
          <Link href="/study-materials" className={styles.breadcrumbLink}>Study Materials</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>My Wishlist</span>
        </div>
      </div>

      <div className="container">
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>My Wishlist</h1>
            <p className={styles.subtitle}>
              {items.length === 0
                ? 'Your saved books and study materials'
                : `You have ${items.length} item${items.length > 1 ? 's' : ''} saved in your wishlist`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clearWishlist();
                toast.info('Wishlist cleared');
              }}
              className={styles.clearBtn}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <Heart size={36} />
              </div>
            </div>
            <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
            <p className={styles.emptyText}>
              Explore our comprehensive departmental exam books and tap the heart icon to save items for later.
            </p>
            <Link href="/study-materials" className={`btn btn-primary btn-lg ${styles.exploreBtn}`}>
              Explore Study Materials →
            </Link>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {items.map((item) => (
              <div key={item.id} className={styles.wishlistCard}>
                <Link href={`/study-materials/${item.productSlug}`} className={styles.imageWrap}>
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className={styles.image}
                  />
                  {item.badge && (
                    <span className={styles.badgeOverlay}>{item.badge}</span>
                  )}
                </Link>

                <div className={styles.cardBody}>
                  <Link href={`/study-materials/${item.productSlug}`} className={styles.productName}>
                    {item.productName}
                  </Link>

                  <div className={styles.languagesRow}>
                    <span className={styles.langLabel}>Mediums:</span>
                    {item.languages?.map((l) => (
                      <span key={l.code} className={styles.langTag}>
                        {getLanguageDisplay(l.code)}
                      </span>
                    ))}
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(item.price)}</span>
                    <span className={styles.stockStatus}>In Stock</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className={styles.moveCartBtn}
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeItem(item.productId);
                        toast.info('Removed from wishlist');
                      }}
                      className={styles.removeBtn}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
