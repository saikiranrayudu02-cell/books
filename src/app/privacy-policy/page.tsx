import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/data';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-subtitle">Last updated: August 2026</p>
      </div>
      <div className="container-narrow" style={{ maxWidth: '760px' }}>
        <div className="card" style={{ padding: '40px', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px', marginTop: '0' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '20px' }}>We collect information you provide directly to us, including your name, email address, mobile number, delivery address, and payment information when you make a purchase. We use this information solely to process your orders and provide customer support.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: '20px' }}>Your information is used to: process and fulfill orders, send order confirmations and shipping updates, respond to customer service requests, and improve our services.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>3. Payment Security</h2>
          <p style={{ marginBottom: '20px' }}>All payments are processed securely through Razorpay. We do not store your credit card, debit card, or banking details on our servers. Razorpay handles all payment processing with bank-grade security and encryption.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>4. Data Protection</h2>
          <p style={{ marginBottom: '20px' }}>We implement appropriate security measures to protect your personal information. Access to customer data is restricted to authorized personnel only.</p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>5. Contact</h2>
          <p>For privacy-related queries, please contact us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-pastel-blue-deeper)', fontWeight: 500 }}>{SUPPORT_EMAIL}</a></p>
        </div>
      </div>
    </div>
  );
}
