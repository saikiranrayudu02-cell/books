'use client';
import { useState } from 'react';
import { SUPPORT_EMAIL } from '@/lib/data';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  category: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  { category: 'Purchasing', items: [
    { q: 'How can I purchase books from Tenali Exam Publisher?', a: 'You can browse our Study Materials page, select the books you need, choose your preferred language, add them to your cart, and proceed to checkout. We accept various online payment methods through Razorpay.' },
    { q: 'What languages are available?', a: 'Our study materials are available in three languages: English, Telugu (తెలుగు), and Hindi (हिंदी). You can select your preferred medium when adding a book to your cart.' },
  ]},
  { category: 'Payment', items: [
    { q: 'What payment methods do you accept?', a: 'We accept UPI, Credit Cards, Debit Cards, and Net Banking through our secure Razorpay payment gateway.' },
    { q: 'Is the payment process secure?', a: 'Yes, all payments are processed through Razorpay, which uses bank-grade security and encryption. We never store your payment details on our servers.' },
    { q: 'What should I do if my payment fails?', a: `If your payment fails, you can retry the payment from your order details. If the amount was deducted but the order wasn't confirmed, the refund will be processed automatically within 5-7 business days. Contact us at ${SUPPORT_EMAIL} for assistance.` },
  ]},
  { category: 'Delivery', items: [
    { q: 'How long does delivery take?', a: 'Delivery typically takes 5-10 business days depending on your location. You will receive tracking information once your order is dispatched.' },
    { q: 'Do you deliver all over India?', a: 'Yes, we deliver across India through our courier partners.' },
    { q: 'What are the delivery charges?', a: 'Delivery charges are ₹50 per order. This is a flat rate regardless of the number of books ordered.' },
  ]},
  { category: 'Order Tracking', items: [
    { q: 'How can I track my order?', a: 'You can track your order from the "Track Order" page using your Order ID and email or mobile number. If you are logged in, your orders will appear automatically in your account.' },
    { q: 'I haven\'t received a dispatch notification yet. What should I do?', a: `After you place an order, it goes through processing and packing stages. You will receive an email and WhatsApp notification once your order is dispatched. If you haven't received any update, please contact us at ${SUPPORT_EMAIL}.` },
  ]},
  { category: 'Returns & Cancellations', items: [
    { q: 'Can I cancel my order?', a: `Orders can be cancelled before they are dispatched. Please contact us at ${SUPPORT_EMAIL} with your Order ID to request a cancellation.` },
    { q: 'What is your return policy?', a: `If you receive a damaged or defective product, please contact us at ${SUPPORT_EMAIL} within 7 days of delivery with photos of the issue. We will arrange a replacement or refund.` },
    { q: 'How are refunds processed?', a: 'Refunds are processed to the original payment method within 5-10 business days after approval.' },
  ]},
  { category: 'Support', items: [
    { q: 'How can I contact customer support?', a: `You can reach us at ${SUPPORT_EMAIL} for any queries related to orders, payments, delivery, or products. We aim to respond within 24 hours.` },
  ]},
];

export default function FAQPage(): React.JSX.Element {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (key: string): void => {
    setOpenItem(openItem === key ? null : key);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-subtitle">Find answers to common questions</p>
      </div>

      <div className="container-narrow" style={{ maxWidth: '760px' }}>
        {FAQ_DATA.map((section, si) => (
          <div key={si} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
              fontWeight: 700, marginBottom: '12px',
              color: 'var(--color-text-primary)',
            }}>
              {section.category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {section.items.map((item, qi) => {
                const key = `${si}-${qi}`;
                const isOpen = openItem === key;
                return (
                  <div key={key} className="card" style={{ overflow: 'hidden' }}>
                    <button
                      onClick={() => toggle(key)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '16px 20px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', gap: '16px',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {item.q}
                      </span>
                      <span style={{
                        fontSize: '1.2rem', color: 'var(--color-text-muted)',
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                      }}>
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 20px 16px',
                        fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                        lineHeight: 1.7,
                        animation: 'fadeIn 0.2s ease',
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div style={{
          textAlign: 'center', marginTop: '40px', padding: '32px',
          background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-light)',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Still have questions?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            We&apos;re here to help. Reach out to us anytime.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-primary">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
