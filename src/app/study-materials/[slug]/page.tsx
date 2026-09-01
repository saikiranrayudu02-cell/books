'use client';
import { useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, getLanguageDisplay } from '@/lib/utils';
import { Truck, ShieldCheck, PackageCheck, Mail, Heart, Check, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import SyllabusModal from '@/components/ui/SyllabusModal';
import styles from './product-detail.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { product, loading } = useProduct(slug);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const [selectedLang, setSelectedLang] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [langError, setLangError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const mediumSectionRef = useRef<HTMLDivElement | null>(null);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <div style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', left: '20px', top: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Home
        </Link>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📖</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '8px' }}>Product Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>The product you are looking for does not exist.</p>
        <Link href="/study-materials" className="btn btn-primary">Browse Study Materials</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleScroll = () => {
    if (galleryRef.current) {
      const scrollLeft = galleryRef.current.scrollLeft;
      const width = galleryRef.current.offsetWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex >= 0 && newIndex < imageList.length && newIndex !== currentSlide) {
          setCurrentSlide(newIndex);
        }
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (galleryRef.current) {
      const width = galleryRef.current.offsetWidth;
      galleryRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
      setCurrentSlide(index);
    }
  };

  const getProductLanguages = () => {
    let raw: any = product?.languages;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
        if (typeof raw === 'string') raw = JSON.parse(raw);
      } catch (e) { raw = []; }
    }
    return Array.isArray(raw) ? raw : [];
  };

  const productLangs = getProductLanguages();

  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  const handleAddToCart = () => {
    if (productLangs.length > 0 && !selectedLang) {
      setLangError(true);
      mediumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLangError(false);
    addItem(product, selectedLang, quantity);
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (productLangs.length > 0 && !selectedLang) {
      setLangError(true);
      mediumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLangError(false);
    addItem(product, selectedLang, quantity);
    router.push('/cart');
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbWrap} style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border-light)', marginBottom: '24px', background: 'var(--color-bg-page)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={18} style={{ color: '#2563eb' }} />
            <span>Back to Home Page</span>
          </button>

          <div className={styles.breadcrumb} style={{ margin: 0 }}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span>/</span>
            <Link href="/study-materials" className={styles.breadcrumbLink}>Study Materials</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.productLayout}>
          {/* Side-by-Side Scrolling Gallery */}
          <div className={styles.imageCol}>
            <div className={styles.galleryContainer}>
              <div
                ref={galleryRef}
                onScroll={handleScroll}
                className={styles.galleryScrollTrack}
              >
                {imageList.map((imgSrc, idx) => (
                  <div key={idx} className={styles.gallerySlide}>
                    <img
                      src={imgSrc}
                      alt={`${product.name} image ${idx + 1}`}
                      className={styles.galleryProductImg}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>

              {/* Scroll Counter Badge & Navigation Buttons */}
              {imageList.length > 1 && (
                <>
                  <span className={styles.galleryCounterBadge}>
                    {currentSlide + 1}/{imageList.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => scrollToSlide(currentSlide > 0 ? currentSlide - 1 : imageList.length - 1)}
                    className={`${styles.galleryNavBtn} ${styles.galleryPrevBtn}`}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSlide(currentSlide < imageList.length - 1 ? currentSlide + 1 : 0)}
                    className={`${styles.galleryNavBtn} ${styles.galleryNextBtn}`}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            {/* Badge */}
            {product.badge && (
              <span className={`badge badge-blue ${styles.badge}`}>
                {product.badge}
              </span>
            )}

            <h1 className={styles.productTitle}>
              {product.name}
            </h1>

            <p className={styles.category}>
              {product.bundleTitle || product.category}
            </p>

            {/* Price */}
            <div className={styles.price}>
              {formatPrice(product.price)}
            </div>

            {/* Bundle Specification Overview */}
            <div className={styles.bundleSummaryBox}>
              <div className={styles.bundleSummaryGrid}>
                <div className={styles.bundleSummaryItem}>
                  <span className={styles.bundleSummaryLabel}>Bundle Details</span>
                  <span className={styles.bundleSummaryValue}>Includes {product.booksIncluded || 2} Books</span>
                </div>
                <div className={styles.bundleSummaryItem}>
                  <span className={styles.bundleSummaryLabel}>Edition</span>
                  <span className={styles.bundleSummaryValue}>{product.edition || 'First Edition'}</span>
                </div>
                {product.examCoverage && (
                  <div className={styles.bundleSummaryItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.bundleSummaryLabel}>Exam Coverage</span>
                    <span className={styles.bundleSummaryValue}>{product.examCoverage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className={styles.description}>
              {product.description}
            </p>

            {/* Features */}
            {product.features && (
              <div className={styles.featuresWrap}>
                <h3 className={styles.featuresTitle}>
                  What&apos;s Included in This {product.booksIncluded || 2}-Book Bundle
                </h3>
                <ul className={styles.featuresList}>
                  {product.features
                    .filter((f) => !/previous/i.test(f))
                    .map((f, i) => (
                      <li key={i} className={styles.featureItem}>
                        <span className={styles.featureCheck}>✓</span> {f}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Exam Syllabus Section */}
            <div style={{
              marginTop: '20px',
              padding: '18px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      Exam Syllabus Coverage
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Complete Official India Post Syllabus & Topics
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSyllabusOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={16} />
                  <span>View Detailed Exam Syllabus</span>
                </button>
              </div>

              {/* Short & Clean Syllabus Overview Pills */}
              {product.slug === 'mts-postman-mg' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'var(--color-bg-card)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📘 MTS Syllabus Overview</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
                      Post Office Guide Part-I • Postal Rules • Post Offices • Postage & Stamps • Packing & Posting • Addressing • Post Boxes & Post Bags • Postal Articles • Postal Services • Banking & Remittances • Insurance • General Knowledge • Indian Geography • Civics • Indian Culture & Freedom Struggle • Ethics & Moral Studies • BODMAS • Percentage • Profit & Loss • Simple Interest • Average • Time & Work • Time & Distance • Unitary Method
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-bg-card)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📗 Postman Syllabus Overview</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
                      Post Office Guide Part-I • General Knowledge • Mathematics • Postal Operations • Mail Delivery • Refusal of Articles • e-Money Orders • Redirection • Address Change • Deceased Person Articles • Rural Postman Facilities • Postal Manual Volume VI Part III • Head Postman • Postal Business • Sale of Stamps • Postman&apos;s Book • Delivery Procedures • Registered & Insured Articles • e-MO Payments • Village Postman Duties • Postal Manual Volume VII • Stamps & Seals • Stationery • Mail Abstract • Exchange of Mails • Transit Bags • Mail Guard/Agent Duties • A & B Orders
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-bg-card)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📙 Mail Guard (MG) Syllabus Overview</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
                      Post Office Guide Part-I • General Knowledge • Mathematics • Postal Operations • Mail Handling • Delivery & Refusal of Articles • e-Money Orders • Redirection • Address Change • Postal Manual Volume VI Part III • Postal Business • Postman&apos;s Book • Delivery Procedures • Registered & Insured Articles • Postal Manual Volume VII • Stamps & Seals • Mail Abstract • Exchange of Mails • Transit Bags • Duties & Responsibilities of Mail Guard/Agent • Final Duties Before Leaving Van/Office • A & B Orders
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--color-bg-card)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                    📘 PA & SA Complete Syllabus Overview
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    PA & SA Complete Syllabus • Departmental Rules • Post Office Guide Part I & II • IT Modernization Terminology • Postal Products & Services • Mails • Banking & Remittances • Insurance • Stamps & Business • Postal Manual Volume VI Part I • Postal Manual Volume VI Part III Chapters 1 & 2 • Updated SB Orders • Postal Manual Volume VII • Foreign Post Manual • Indian Geography • Civics • General Knowledge • Indian Culture & Freedom Struggle • Ethics & Moral Study • BODMAS • Percentage • Profit & Loss • Simple Interest • Average • Time & Work • Time & Distance • Unitary Method • Reasoning & Analytical Ability • Non-Verbal / Pictorial Reasoning • Data Entry Skill Test (DEST) – 1200 Key Depressions (+5%)
                  </p>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* Language Selection */}
            <div className={styles.sectionBlock} ref={mediumSectionRef}>
              <h3
                className={styles.sectionLabel}
                style={{
                  color: langError ? 'var(--color-error)' : 'var(--color-text-primary)',
                }}
              >
                Select Medium <span style={{ color: 'var(--color-error)' }}>*</span>
              </h3>
              <div className={styles.langButtons}>
                {(productLangs.length > 0 ? productLangs : [{ code: 'en', name: 'English' }]).map(lang => {
                  return (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang.code); setLangError(false); }}
                      className={styles.langBtn}
                      style={{
                        border: `2px solid ${selectedLang === lang.code ? 'var(--color-text-primary)' : langError ? 'var(--color-error)' : 'var(--color-border)'}`,
                        background: selectedLang === lang.code ? 'var(--color-text-primary)' : 'var(--color-white)',
                        color: selectedLang === lang.code ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                    >
                      <span>{getLanguageDisplay(lang.code)}</span>
                    </button>
                  );
                })}
              </div>
              {langError && (
                <p className={styles.langErrorText}>
                  Please select a medium to continue
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionLabel}>
                Quantity
              </h3>
              <div className={styles.quantityWrap}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={styles.qtyBtn}
                  style={{ opacity: quantity <= 1 ? 0.4 : 1 }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className={styles.qtyVal}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={styles.qtyBtn}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionRow}>
              <button
                onClick={handleAddToCart}
                className={`btn btn-primary btn-lg ${styles.actionBtn}`}
                style={{
                  background: addedToCartSuccess ? '#10b981' : undefined,
                  borderColor: addedToCartSuccess ? '#10b981' : undefined,
                  transition: 'all 0.2s ease'
                }}
              >
                {addedToCartSuccess ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} className={`btn btn-accent btn-lg ${styles.actionBtn}`}>
                Buy Now
              </button>
            </div>

            <button onClick={handleWishlist} className={`btn btn-ghost ${styles.wishlistBtn}`}>
              {inWishlist ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E53935" stroke="#E53935" strokeWidth="1"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Remove from Wishlist
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Add to Wishlist
                </>
              )}
            </button>

            {/* Delivery & Payment Trust Strip (#4) */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <Truck size={18} color="var(--color-primary)" />
                <span>Speed Post Delivery across India</span>
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} color="#10B981" />
                <span>100% Secure UPI / Card Payment</span>
              </div>
              <div className={styles.trustItem}>
                <PackageCheck size={18} color="var(--color-primary)" />
                <span>Transit Damage Replacement</span>
              </div>
            </div>

            {/* Support */}
            <div className={styles.supportBox}>
              <Mail size={18} color="var(--color-pastel-blue-deeper)" />
              <div>
                <strong>Need help?</strong>{' '}
                <a href="mailto:tenaliexampublishers@gmail.com" style={{ color: 'var(--color-pastel-blue-deeper)', fontWeight: 500 }}>
                  tenaliexampublishers@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky "Buy Now" Action Bar (#1) */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.stickyPriceGroup}>
          <div className={styles.stickyPrice}>{formatPrice(product.price)}</div>
          <div className={styles.stickyMediumTag}>
            {selectedLang ? `Medium: ${getLanguageDisplay(selectedLang)}` : 'Select Medium'}
          </div>
        </div>

        <div className={styles.stickyActions}>
          <button
            onClick={handleAddToCart}
            className={`btn btn-secondary ${styles.stickyCartBtn}`}
            style={{
              background: addedToCartSuccess ? '#10b981' : undefined,
              color: addedToCartSuccess ? '#ffffff' : undefined,
              borderColor: addedToCartSuccess ? '#10b981' : undefined,
              transition: 'all 0.2s ease'
            }}
          >
            {addedToCartSuccess ? '✓ Added!' : '+ Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            className={`btn btn-accent ${styles.stickyBuyBtn}`}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Syllabus Modal */}
      <SyllabusModal
        productSlug={product.slug}
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
      />
    </div>
  );
}
