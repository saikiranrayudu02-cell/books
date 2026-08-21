'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SUPPORT_EMAIL } from '@/lib/data';

export default function OrderConfirmationPage(): React.JSX.Element {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      {/* Success Animation */}
      <div style={{
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'var(--color-success-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '2.5rem',
        animation: 'checkmark 0.5s ease',
      }}>
        ✅
      </div>

      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '8px',
        color: 'var(--color-text-primary)',
      }}>
        Order Confirmed!
      </h1>

      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: '1rem',
        marginBottom: '8px',
      }}>
        Thank you for your order. We&apos;ll start processing it right away.
      </p>

      {/* Order ID */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'var(--color-bg-hover)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '32px',
        fontSize: '0.9rem',
      }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
        <strong>{orderId}</strong>
      </div>

      {/* Order Summary Card */}
      <div className="card" style={{ padding: '28px', textAlign: 'left', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Payment Status</span>
            <span className="badge badge-success">Paid</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Order Status</span>
            <span className="badge badge-info">Processing</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        <Link href="/track-order" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
          Track My Order
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/account/orders" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            View My Orders
          </Link>
          <Link href="/study-materials" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Support */}
      <div style={{
        padding: '24px',
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
          Need help with your order?
        </h3>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{
          color: 'var(--color-pastel-blue-deeper)',
          fontWeight: 500, fontSize: '0.9rem',
        }}>
          {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  );
}
