'use client';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { Heart, BookOpen, ArrowRight, Globe, Sparkles } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const inWishlist = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className={styles.card}>
      {/* Product Image Section */}
      <Link href={`/study-materials/${product.slug}`} className={styles.imageWrap}>
        {/* Soft background glow */}
        <div className={styles.glowBg} />
        
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          width={400}
          height={533}
        />
        
        {/* Premium Badge Overlay */}
        {product.badge && (
          <span className={styles.badgeOverlay}>
            <Sparkles size={11} className={styles.sparkleIcon} />
            {product.badge}
          </span>
        )}
        
        {/* Glassmorphic Wishlist Button */}
        <button
          className={`${styles.wishBtn} ${inWishlist ? styles.active : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </Link>

      {/* Product Info Body */}
      <div className={styles.body}>
        {/* Category & Bundle Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span className={styles.categoryTag}>
            {product.category || 'Books'}
          </span>
          <span className={styles.bundleTitleText}>
            {product.bundleTitle || 'Study Kit'}
          </span>
        </div>

        {/* Product Title */}
        <Link href={`/study-materials/${product.slug}`} className={styles.name} title={product.name}>
          {product.name}
        </Link>

        {/* Features / Spec row */}
        <div className={styles.highlightsContainer}>
          <div className={styles.highlightItem}>
            <BookOpen size={13} className={styles.highlightIcon} />
            <span>Includes {product.booksIncluded || 2} Books</span>
          </div>
          <div className={styles.highlightItem}>
            <Globe size={13} className={styles.highlightIcon} />
            <div className={styles.langPills}>
              {product.languages && product.languages.length > 0 
                ? product.languages.map(l => (
                    <span key={l.code} className={styles.langPill}>
                      {l.name}
                    </span>
                  ))
                : <span className={styles.langPill}>English</span>
              }
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.cardDivider} />

        {/* Price & Stock Status */}
        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            <span className={styles.editionBadge}>{product.edition || 'First Edition'}</span>
          </div>
          
          <span className={`${styles.stockStatus} ${isOutOfStock ? styles.outOfStock : ''}`}>
            <span className={`${styles.stockDot} ${isOutOfStock ? styles.outOfStockDot : styles.inStockDot}`} />
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Premium Interactive Action Button */}
        <div className={styles.actions}>
          <Link href={`/study-materials/${product.slug}`} className={styles.viewDetailsBtn}>
            View Details & Order
            <ArrowRight size={16} className={styles.btnArrow} />
          </Link>
        </div>
      </div>
    </div>
  );
}
