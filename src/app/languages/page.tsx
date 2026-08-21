import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Choose Your Medium',
  description: 'Study materials available in English, Telugu, and Hindi. Choose your preferred language.',
};

interface LanguageOption {
  code: string;
  name: string;
  native: string;
  desc: string;
  bg: string;
  icon: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', desc: 'Exam preparation materials in English medium', bg: '#D4E4F7', icon: '📘' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', desc: 'తెలుగు మాధ్యమంలో పరీక్షా ప్రిపరేషన్ మెటీరియల్స్', bg: '#E8E0F0', icon: '📗' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', desc: 'हिंदी माध्यम में परीक्षा की तैयारी सामग्री', bg: '#FDDEC0', icon: '📙' },
];

export default function LanguagesPage(): React.JSX.Element {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <h1 className="page-title">Choose Your Medium</h1>
        <p className="page-subtitle">
          Our study materials are available in your preferred language
        </p>
      </div>

      <div className="container px-4" style={{ maxWidth: '860px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANGUAGES.map(lang => (
            <Link key={lang.code} href={`/study-materials?lang=${lang.code}`} className="card card-interactive" style={{
              padding: '40px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textDecoration: 'none',
            }}>
              <div style={{
                width: '72px', height: '72px',
                borderRadius: '50%', background: lang.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>
                {lang.icon}
              </div>

              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                {lang.name}
              </h2>

              <div style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
                {lang.native}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {lang.desc}
              </p>

              <span className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                Browse {lang.name} Books →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
