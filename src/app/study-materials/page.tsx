'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ui/ProductCard';

interface ExamItem {
  name: string;
  bundleId: string;
}

const EXAM_ITEMS: ExamItem[] = [
  { name: 'MTS', bundleId: 'p1' },
  { name: 'POSTMAN / MG', bundleId: 'p1' },
  { name: 'PA / SA', bundleId: 'p2' },
];

function StudyMaterialsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const { products, loading } = useProducts();

  const getInitialExam = (): string | null => {
    if (!initialCategory) return null;
    const cat = initialCategory.toUpperCase();
    if (cat.includes('POSTMAN') || cat.includes('MAIL') || cat.includes('MG')) return 'POSTMAN / MG';
    if (cat.includes('PA') || cat.includes('SA') || cat.includes('SORTING') || cat.includes('ASSISTANT')) return 'PA / SA';
    if (cat.includes('MTS')) return 'MTS';
    return null;
  };

  const [selectedExam, setSelectedExam] = useState<string | null>(getInitialExam);

  const handleExamClick = (examName: string) => {
    if (selectedExam === examName) {
      setSelectedExam(null); // toggle off to show all
    } else {
      setSelectedExam(examName);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!selectedExam) return products;
    const item = EXAM_ITEMS.find(e => e.name === selectedExam);
    if (item) {
      return products.filter(p => p.id === item.bundleId);
    }
    return products;
  }, [selectedExam, products]);

  return (
    <div className="container">
      {/* Back Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="btn btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            minHeight: '44px',
            color: 'var(--color-text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
          aria-label="Back to previous page"
        >
          ← Back
        </button>
      </div>

      {/* Interactive Highlight Border Boxes for Available Exams */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        {EXAM_ITEMS.map((item) => {
          const isSelected = selectedExam === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleExamClick(item.name)}
              style={{
                flex: '0 0 auto',
                minWidth: '76px',
                background: isSelected ? 'var(--color-primary)' : 'var(--color-white)',
                border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                textAlign: 'center',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.80rem',
                color: isSelected ? 'var(--color-white)' : 'var(--color-text-secondary)',
                boxShadow: isSelected
                  ? '0 2px 6px rgba(26, 43, 76, 0.15)'
                  : '0 1px 2px rgba(0, 0, 0, 0.03)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.01em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: '34px',
                outline: 'none',
                touchAction: 'manipulation',
              }}
              aria-pressed={isSelected}
            >
              {isSelected ? `✓ ${item.name}` : item.name}
            </button>
          );
        })}
      </div>

      {/* Available Products Section Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {selectedExam ? `Suggested Book Set for ${selectedExam}` : 'Available Book Bundles'}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedExam && (
            <button
              onClick={() => setSelectedExam(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px 8px',
              }}
            >
              Show All Books
            </button>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Bundle' : 'Bundles'} Available
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Loading...</div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}

export default function StudyMaterialsPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Study Materials</h1>
        <p className="page-subtitle">
          Quality examination preparation books and comprehensive bundles
        </p>
      </div>
      
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Loading study materials...</div>}>
        <StudyMaterialsContent />
      </Suspense>
    </div>
  );
}
