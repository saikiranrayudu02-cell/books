import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/data';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage(): React.JSX.Element {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <h1 className="page-title">Terms &amp; Conditions</h1>
        <p className="page-subtitle">Last updated: August 2026</p>
      </div>
      <div className="container-narrow" style={{ maxWidth: '760px' }}>
        <div className="card" style={{ padding: '40px', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px', marginTop: '0' }}>1. General</h2>
          <p style={{ marginBottom: '20px' }}>By using Tenali Exam Publisher&apos;s website and services, you agree to these terms and conditions. These terms apply to all users and customers of our website.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>2. Products &amp; Pricing</h2>
          <p style={{ marginBottom: '20px' }}>All prices are displayed in Indian Rupees (₹) and include applicable taxes. We reserve the right to modify prices without prior notice. Product availability is subject to stock.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>3. Orders &amp; Payment</h2>
          <p style={{ marginBottom: '20px' }}>Orders are confirmed only after successful payment verification. We accept payments through Razorpay (UPI, Credit/Debit Cards, Net Banking). All payments are processed securely.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>4. Shipping &amp; Delivery</h2>
          <p style={{ marginBottom: '20px' }}>We deliver across India. Delivery timelines vary based on location and typically take 5-10 business days. A flat delivery charge of ₹50 is applicable per order.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>5. Returns &amp; Cancellations</h2>
          <p style={{ marginBottom: '20px' }}>Cancellations are accepted before the order is dispatched. Returns are accepted for damaged or defective products within 7 days of delivery. Contact us at {SUPPORT_EMAIL} for returns or cancellations.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>6. Contact</h2>
          <p>For questions about these terms, contact us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-pastel-blue-deeper)', fontWeight: 500 }}>{SUPPORT_EMAIL}</a></p>
        </div>
      </div>
    </div>
  );
}
