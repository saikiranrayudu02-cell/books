import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Tenali Exam Publisher — our mission to provide accessible and high-quality exam preparation materials.',
};

interface OfferItem {
  icon: string;
  title: string;
  desc: string;
}

export default function AboutPage(): React.JSX.Element {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <h1 className="page-title">About Tenali Exam Publisher</h1>
        <p className="page-subtitle">
          Your trusted partner for exam preparation materials
        </p>
      </div>

      <div className="container-narrow">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card p-6 md:p-8">
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Our Mission</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              To provide accessible and high-quality exam preparation materials that help aspirants prepare with confidence.
            </p>
          </div>
          <div className="card p-6 md:p-8">
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🌟</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Our Vision</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              To become a trusted educational publishing platform supporting students and competitive examination aspirants.
            </p>
          </div>
        </div>

        {/* Founder Section */}
        <div className="card p-6 md:p-12 mb-12 text-center">
          <div style={{
            width: '120px', height: '120px',
            borderRadius: '50%',
            background: 'var(--color-pastel-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '3rem',
            border: '4px solid var(--color-white)',
            boxShadow: 'var(--shadow-md)',
          }}>
            👨‍💼
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
            Founder &amp; Publisher
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Tenali Exam Publisher
          </p>
          <p style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.8,
            fontSize: '0.95rem',
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Driven by a passion for quality education and a deep understanding of competitive examination requirements,
            Tenali Exam Publisher was founded to bridge the gap between aspirants and comprehensive, well-structured
            study materials. Our focus is on delivering value through carefully curated content available in multiple languages.
          </p>
        </div>

        {/* What We Offer */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '28px' }}>
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {([
              { icon: '📚', title: 'Quality Content', desc: 'Carefully researched and compiled study materials.' },
              { icon: '🌐', title: 'Multilingual', desc: 'Materials in English, Telugu, and Hindi.' },
              { icon: '📦', title: 'Doorstep Delivery', desc: 'Reliable shipping across India.' },
            ] as OfferItem[]).map((item, i) => (
              <div key={i} className="card p-6 text-center">
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="p-6 md:p-8 text-center bg-(--color-bg-card) border border-[color:var(--color-border-light)] rounded-2xl">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Get in Touch</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Have questions? We&apos;d love to hear from you.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

    </div>
  );
}
