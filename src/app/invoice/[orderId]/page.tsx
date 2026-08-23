'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { COMPANY_ADDRESS, SUPPORT_EMAIL, COMPANY_PHONE } from '@/lib/data';
import {
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Printer,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number | string;
  language: string;
  quantity: number;
  bundleTitle?: string;
  booksIncluded?: number;
}

interface DeliveryAddress {
  fullName: string;
  mobile: string;
  email: string;
  houseOrFlat: string;
  street: string;
  area?: string;
  city: string;
  state: string;
  pinCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number | string;
  deliveryCharge: number | string;
  total: number | string;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
}

export default function InvoicePage(): React.JSX.Element {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-primary)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', padding: '20px' }}>
        <AlertCircle size={40} style={{ color: '#ef4444' }} />
        <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{error || 'Order not found'}</p>
        <Link href="/account/orders" className="btn btn-primary btn-sm">Back to Orders</Link>
      </div>
    );
  }

  const addr = order.deliveryAddress;
  const invoiceNumber = `INV-${order.orderNumber}`;
  const orderDate = new Date(order.createdAt);
  const formattedDate = formatDate(order.createdAt);
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          /* Hide everything except the invoice */
          body * { visibility: hidden !important; }
          #invoice-printable, #invoice-printable * { visibility: visible !important; }
          #invoice-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          /* Clean backgrounds for print */
          #invoice-printable {
            background: white !important;
            color: #000 !important;
          }
          @page {
            margin: 12mm;
            size: A4;
          }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px 80px 16px' }}>
        
        {/* Action Bar (hidden in print) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <Link href={`/order-confirmation/${order.orderNumber}`} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none'
          }}>
            <ArrowLeft size={16} /> Back to Order
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px', padding: '8px 18px' }}
            >
              <Download size={16} /> Download PDF
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px', padding: '8px 18px' }}
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* ======== INVOICE DOCUMENT ======== */}
        <div
          id="invoice-printable"
          ref={invoiceRef}
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2b4c 0%, #1e3a8a 100%)',
            color: '#ffffff',
            padding: '32px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src="/icon.png" alt="Tenali Exam Publisher" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>INVOICE</h1>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                    Tenali Exams Publishers
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.6, opacity: 0.8 }}>
                <div>{COMPANY_ADDRESS.line1}</div>
                <div>{COMPANY_ADDRESS.line2}</div>
                <div>{COMPANY_ADDRESS.line3}</div>
                <div style={{ marginTop: '4px' }}>Phone: {COMPANY_PHONE}</div>
                <div>Email: {SUPPORT_EMAIL}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Invoice Details
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>
                {invoiceNumber}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                Date: {formattedDate}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                Time: {formattedTime}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: order.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: order.paymentStatus === 'paid' ? '#6ee7b7' : '#fca5a5',
              }}>
                {order.paymentStatus === 'paid' ? '✓ PAID' : order.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Bill To / Ship To Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            padding: '28px 36px',
            borderBottom: '1px solid var(--color-border-light)',
            background: 'var(--color-bg-page)',
          }}>
            <div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--color-text-muted)',
                marginBottom: '10px',
              }}>
                Bill To
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {addr.fullName}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <div>{addr.houseOrFlat}, {addr.street}</div>
                {addr.area && <div>{addr.area}</div>}
                <div>{addr.city}, {addr.state} - {addr.pinCode}</div>
                <div style={{ marginTop: '6px' }}>📱 {addr.mobile}</div>
                <div>✉️ {addr.email}</div>
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--color-text-muted)',
                marginBottom: '10px',
              }}>
                Order Information
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                <div><strong style={{ color: 'var(--color-text-primary)' }}>Order No:</strong> {order.orderNumber}</div>
                <div><strong style={{ color: 'var(--color-text-primary)' }}>Order Date:</strong> {formattedDate}</div>
                <div><strong style={{ color: 'var(--color-text-primary)' }}>Status:</strong>{' '}
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    background: order.status === 'dispatched' ? '#dbeafe' : '#e0e7ff',
                    color: order.status === 'dispatched' ? '#1d4ed8' : '#4338ca',
                  }}>
                    {order.status}
                  </span>
                </div>
                <div><strong style={{ color: 'var(--color-text-primary)' }}>Carrier:</strong> {order.carrier || 'India Post Speed Post'}</div>
                {order.trackingNumber && (
                  <div><strong style={{ color: 'var(--color-text-primary)' }}>Tracking:</strong> {order.trackingNumber}</div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: '28px 36px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid var(--color-border-light)',
                }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Item Description</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Language</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const unitPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <tr key={item.id} style={{
                      borderBottom: '1px solid var(--color-border-light)',
                    }}>
                      <td style={{ padding: '14px 8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                          {item.productName}
                        </div>
                        {item.bundleTitle && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {item.bundleTitle} • {item.booksIncluded || 1} book{(item.booksIncluded || 1) > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'var(--color-bg-page)',
                          border: '1px solid var(--color-border-light)',
                          color: 'var(--color-text-secondary)',
                          textTransform: 'capitalize',
                        }}>
                          {item.language}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {formatPrice(unitPrice)}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div style={{
            padding: '0 36px 28px 36px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <div style={{ minWidth: '280px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: '0.88rem',
              }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Subtotal</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{formatPrice(order.subtotal)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: '0.88rem',
              }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Delivery Charges</span>
                <span style={{
                  fontWeight: 600,
                  color: parseFloat(String(order.deliveryCharge)) === 0 ? '#10b981' : 'var(--color-text-primary)',
                }}>
                  {parseFloat(String(order.deliveryCharge)) === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 0',
                fontSize: '1.1rem',
              }}>
                <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>Total Amount</span>
                <span style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Payment Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: order.paymentStatus === 'paid' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${order.paymentStatus === 'paid' ? '#a7f3d0' : '#fecaca'}`,
                fontSize: '0.82rem',
                fontWeight: 700,
                color: order.paymentStatus === 'paid' ? '#065f46' : '#991b1b',
              }}>
                {order.paymentStatus === 'paid' ? '✓ Payment Received' : `Payment ${order.paymentStatus}`}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div style={{
            borderTop: '2px solid var(--color-border-light)',
            padding: '24px 36px',
            background: 'var(--color-bg-page)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}>
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.68rem', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Terms & Conditions
                </div>
                <div>• This is a computer-generated invoice.</div>
                <div>• Delivery expected in 5-7 working days.</div>
                <div>• For queries, contact our support team.</div>
              </div>

              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.68rem', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Contact Support
                </div>
                <div>📱 {COMPANY_PHONE}</div>
                <div>✉️ {SUPPORT_EMAIL}</div>
                <div>🌐 www.tenaliexamspublishers.com</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.68rem', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Authorized Signatory
                </div>
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border-light)', paddingTop: '6px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Tenali Exams Publishers
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}>
              Thank you for your purchase! We appreciate your trust in Tenali Exams Publishers.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
