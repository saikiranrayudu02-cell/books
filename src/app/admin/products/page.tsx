'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} color="var(--color-primary)" />
          Manage Products
        </h2>
        <Link href="/admin/products/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border-light)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>ID / Slug</th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Stock Status</th>
                <th style={{ padding: '12px 16px' }}>Units Sold</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{product.id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{product.slug}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{product.category}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatPrice(product.price)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: product.stock > 0 ? 'var(--color-success, #10b981)' : 'var(--color-error, #ef4444)' 
                        }} />
                        <span style={{ 
                          color: product.stock > 0 ? 'var(--color-success, #10b981)' : 'var(--color-error, #ef4444)',
                          fontWeight: 500, fontSize: '0.85rem'
                        }}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock (0)'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      <span className="badge" style={{ 
                        backgroundColor: (product.totalSold || 0) > 0 ? 'var(--color-primary-light, #e0f2fe)' : 'var(--color-neutral-light, #f3f4f6)',
                        color: (product.totalSold || 0) > 0 ? 'var(--color-primary, #0284c7)' : 'var(--color-text-muted, #6b7280)',
                        padding: '4px 8px', borderRadius: '4px', fontWeight: 600
                      }}>
                        {product.totalSold || 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link href={`/admin/products/${product.id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px', color: 'var(--color-primary)' }}>
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-ghost btn-sm" style={{ padding: '6px', color: 'var(--color-error)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
