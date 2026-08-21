'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, getLanguageDisplay, isValidEmail, isValidMobile, isValidPinCode, generateOrderId } from '@/lib/utils';
import { DELIVERY_CHARGE, ORIGINAL_DELIVERY_CHARGE, INDIAN_STATES } from '@/lib/data';
import { Address, Order } from '@/types';
import styles from './checkout.module.css';

const STEPS = ['Delivery Address', 'Order Review'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<Address>({
    fullName: '',
    mobile: '',
    email: '',
    houseOrFlat: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Auto-populate user details when authenticated
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        mobile: prev.mobile || user.phone || '',
      }));
    }
  }, [user]);

  // Auth Protection Gate: Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.info('Please sign in to proceed with checkout');
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router, toast]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '8px' }}>
          Authentication Required
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Please log in or create an account to proceed with your order.
        </p>
        <Link href="/login?redirect=/checkout" className="btn btn-primary btn-lg">
          Sign In to Continue Checkout
        </Link>
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '8px' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Add items to continue with checkout</p>
        <Link href="/study-materials" className="btn btn-primary btn-lg">Browse Study Materials</Link>
      </div>
    );
  }

  const total = subtotal + DELIVERY_CHARGE;

  const validateAddress = (): boolean => {
    const e: Record<string, string> = {};
    if (!address.fullName.trim()) e.fullName = 'Full name is required';
    if (!address.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!isValidMobile(address.mobile)) e.mobile = 'Invalid mobile number';
    if (!address.email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(address.email)) e.email = 'Invalid email address';
    if (!address.houseOrFlat.trim()) e.houseOrFlat = 'House/Flat number is required';
    if (!address.street.trim()) e.street = 'Street is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state) e.state = 'State is required';
    if (!address.pinCode.trim()) e.pinCode = 'PIN code is required';
    else if (!isValidPinCode(address.pinCode)) e.pinCode = 'Invalid 6-digit PIN code';
    setAddressErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressContinue = () => {
    if (validateAddress()) setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    let finalOrderId = generateOrderId();

    try {
      // 1. Save directly to Neon Database
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          items,
          subtotal,
          deliveryCharge: DELIVERY_CHARGE,
          total,
          deliveryAddress: address,
        }),
      });
      const data = await res.json();
      if (data?.success && data.orderId) {
        finalOrderId = data.orderId;
      }
    } catch (err) {
      console.warn('Could not post to Neon DB API, fallback to local storage:', err);
    }

    // 2. Local cache fallback
    const newOrder: Order = {
      id: finalOrderId,
      orderNumber: finalOrderId,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        price: item.price,
        language: item.language,
        quantity: item.quantity,
        bundleTitle: item.bundleTitle,
        booksIncluded: item.booksIncluded,
      })),
      subtotal,
      deliveryCharge: DELIVERY_CHARGE,
      total,
      deliveryAddress: address,
      status: 'payment_confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('tep_orders');
      const ordersList: Order[] = existing ? JSON.parse(existing) : [];
      ordersList.unshift(newOrder);
      localStorage.setItem('tep_orders', JSON.stringify(ordersList));
    } catch {}

    clearCart();
    toast.success('Order placed successfully!');
    router.push(`/order-confirmation/${finalOrderId}`);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (addressErrors[field]) setAddressErrors(prev => ({ ...prev, [field]: '' }));
  };

  const renderField = (id: string, label: string, field: keyof Address, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label} *</label>
      {field === 'state' ? (
        <select id={id} className={`form-select ${addressErrors[field] ? 'error' : ''}`} value={address[field]} onChange={e => handleAddressChange(field, e.target.value)}>
          <option value="">Select State</option>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input id={id} type={type} className={`form-input ${addressErrors[field] ? 'error' : ''}`} placeholder={placeholder} value={address[field]} onChange={e => handleAddressChange(field, e.target.value)} />
      )}
      {addressErrors[field] && <span className="form-error">{addressErrors[field]}</span>}
    </div>
  );

  return (
    <div className={styles.checkoutContainer}>
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
      </div>

      <div className={`container ${styles.checkoutInner}`}>
        {/* Progress Steps */}
        <div className={styles.stepsWrap}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.stepItem}>
              <button
                type="button"
                className={`${styles.stepBtn} ${i < step ? styles.stepBtnActive : ''}`}
                onClick={() => i < step && setStep(i)}
                aria-label={`Step ${i + 1}: ${s}`}
              >
                <div
                  className={styles.stepNumber}
                  style={{
                    background: i <= step ? 'var(--color-text-primary)' : 'var(--color-border-light)',
                    color: i <= step ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={styles.stepLabel}
                  style={{
                    fontWeight: i === step ? 600 : 400,
                    color: i <= step ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  {s}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={styles.stepDivider}
                  style={{
                    background: i < step ? 'var(--color-text-primary)' : 'var(--color-border-light)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 0 && (
          <div className={`card ${styles.card}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                Delivery Address
              </h2>
              {user && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-page)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  Logged in as <strong>{user.name}</strong>
                </span>
              )}
            </div>

            <div className={styles.formGrid}>
              {renderField('fullName', 'Full Name', 'fullName', 'text', 'Your full name')}
              {renderField('mobile', 'Mobile Number', 'mobile', 'tel', '10-digit mobile number')}
              {renderField('email', 'Email Address', 'email', 'email', 'your@email.com')}
              {renderField('houseOrFlat', 'House / Flat Number', 'houseOrFlat', 'text', 'House/Flat number')}
              {renderField('street', 'Street', 'street', 'text', 'Street name')}
              {renderField('area', 'Area / Locality', 'area', 'text', 'Area / Locality')}
              {renderField('city', 'City', 'city', 'text', 'City')}
              {renderField('state', 'State', 'state')}
              {renderField('pinCode', 'PIN Code', 'pinCode', 'text', '6-digit PIN code')}
            </div>
            <div className={styles.formActions}>
              <button onClick={handleAddressContinue} className={`btn btn-primary btn-lg ${styles.continueBtn}`}>
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className={`card ${styles.card}`} style={{ marginBottom: '24px' }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitleInHeader}>
                  Delivery Address
                </h2>
                <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm" style={{ minHeight: '36px' }}>
                  Edit
                </button>
              </div>
              <div className={styles.addressReviewText}>
                <strong>{address.fullName}</strong><br />
                {address.houseOrFlat}, {address.street}<br />
                {address.area && <>{address.area}<br /></>}
                {address.city}, {address.state} — {address.pinCode}<br />
                📱 {address.mobile} &nbsp; 📧 {address.email}
              </div>
            </div>

            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>
                Order Summary
              </h2>

              {items.map(item => (
                <div key={item.id} className={styles.reviewItem}>
                  <img src={item.productImage} alt="" className={styles.reviewItemImg} />
                  <div className={styles.reviewItemDetails}>
                    <div className={styles.reviewItemName}>{item.productName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {item.bundleTitle || (item.productId === 'p1' ? '2-Book Preparation Set' : '3-Book Preparation Set')} (Includes {item.booksIncluded || (item.productId === 'p1' ? 2 : 3)} Books)
                    </div>
                    <div className={styles.reviewItemMeta}>
                      Medium: {getLanguageDisplay(item.language)} · Qty: {item.quantity} {item.quantity > 1 && `(${(item.booksIncluded || (item.productId === 'p1' ? 2 : 3)) * item.quantity} books total)`}
                    </div>
                  </div>
                  <div className={styles.reviewItemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery Charges</span>
                  <div className={styles.deliveryFeeCol}>
                    <span className={styles.strikethroughFee}>{formatPrice(ORIGINAL_DELIVERY_CHARGE)}</span>
                    <span className={styles.freeFee}>FREE</span>
                  </div>
                </div>
                <div className={styles.freeDeliveryBanner}>
                  🎉 <strong>Special Offer:</strong> Free Postal Delivery Applied!
                </div>
                <hr className="divider" style={{ margin: '4px 0' }} />
                <div className={styles.summaryTotal}>
                  <span>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <div className={styles.reviewActions}>
                <button onClick={() => setStep(0)} className={`btn btn-secondary btn-lg ${styles.backBtn}`}>
                  ← Back
                </button>
                <button onClick={handlePlaceOrder} disabled={loading} className={`btn btn-primary btn-lg ${styles.payBtn}`}>
                  {loading ? 'Processing Order...' : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
