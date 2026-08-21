import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Tenali Exam Publisher — Quality Exam Preparation Materials',
    template: '%s | Tenali Exam Publisher',
  },
  description: 'Discover quality exam preparation books and study materials designed to help aspirants prepare with confidence. Available in English, Telugu, and Hindi.',
  keywords: ['exam preparation', 'study materials', 'MTS', 'Postman', 'MG', 'PA', 'SA', 'LGO', 'competitive exams', 'postal exams', 'books'],
  authors: [{ name: 'Tenali Exam Publisher' }],
  openGraph: {
    title: 'Tenali Exam Publisher',
    description: 'Quality exam preparation materials for competitive examinations.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Tenali Exam Publisher',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
