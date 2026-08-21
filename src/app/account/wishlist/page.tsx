'use client';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, getLanguageDisplay } from '@/lib/utils';
import { WishlistItem } from '@/types';
import { Heart } from 'lucide-react';

export default function WishlistPage(): React.JSX.Element {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();

  const handleMoveToCart = (item: WishlistItem): void => {
    // Add with first available language
    const lang = item.languages?.[0]?.code || 'en';
    addItem({
      id: item.productId,
      name: item.productName,
      slug: item.productSlug,
      image: item.productImage,
      price: item.price,
      badge: item.badge,
    } as any, lang);
    removeItem(item.productId);
    toast.success(`${item.productName} moved to cart`);
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg-page)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'var(--color-white)', borderRadius: '50%', marginBottom: '24px', color: '#E53935', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Heart size={48} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Save products you like to your wishlist
        </p>
        <Link href="/study-materials" className="btn btn-primary">Browse Study Materials</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
        Wishlist ({items.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} className="card" style={{
            display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '16px',
          }}>
            <Link href={`/study-materials/${item.productSlug}`}>
              <img src={item.productImage} alt="" style={{ width: '64px', height: '85px', objectFit: 'cover', borderRadius: '8px' }} />
            </Link>
            <div style={{ flex: 1 }}>
              <Link href={`/study-materials/${item.productSlug}`} style={{
                fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)',
              }}>
                {item.productName}
              </Link>
              {item.badge && <span className="badge badge-blue" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>{item.badge}</span>}
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {item.languages?.map(l => (
                  <span key={l.code} style={{
                    fontSize: '0.7rem', padding: '2px 8px',
                    background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-full)',
                    color: 'var(--color-text-muted)',
                  }}>{getLanguageDisplay(l.code)}</span>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginRight: '16px' }}>
              {formatPrice(item.price)}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleMoveToCart(item)} className="btn btn-primary btn-sm">
                Move to Cart
              </button>
              <button onClick={() => { removeItem(item.productId); toast.info('Removed from wishlist'); }} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
