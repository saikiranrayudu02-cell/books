'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    bundleTitle: '',
    booksIncluded: '',
    badge: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to load product');
        const data = await res.json();
        const p = data.product;
        setFormData({
          name: p.name || '',
          category: p.category || 'books',
          price: p.price?.toString() || '0',
          stock: p.stock?.toString() || '0',
          description: p.description || '',
          image: p.image || '',
          bundleTitle: p.bundleTitle || '',
          booksIncluded: p.booksIncluded?.toString() || '1',
          badge: p.badge || ''
        });
      } catch (err) {
        toast.error('Failed to load product details');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        booksIncluded: parseInt(formData.booksIncluded)
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('Product updated successfully');
        router.push('/admin/products');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading product details...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/products" className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
          <ArrowLeft size={20} />
        </Link>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} color="var(--color-primary)" />
          Edit Product: {id}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="form-select">
              <option value="books">Books</option>
              <option value="materials">Materials</option>
              <option value="bundles">Bundles</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Stock</label>
            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input required name="image" value={formData.image} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} className="form-input" rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label">Bundle Title (Optional)</label>
            <input name="bundleTitle" value={formData.bundleTitle} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Books Included</label>
            <input type="number" name="booksIncluded" value={formData.booksIncluded} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Badge (Optional)</label>
            <input name="badge" value={formData.badge} onChange={handleChange} className="form-input" />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
