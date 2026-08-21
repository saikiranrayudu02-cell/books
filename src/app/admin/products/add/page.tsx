'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    name: '',
    category: 'books',
    price: '',
    stock: '100',
    description: '',
    image: '',
    bundleTitle: '',
    booksIncluded: '1',
    badge: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      const cleanSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug: cleanSlug }));
    } else {
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        if (name === 'name') {
          next.slug = value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');
        }
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        booksIncluded: parseInt(formData.booksIncluded)
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('Product added successfully');
        router.push('/admin/products');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add product');
      }
    } catch (err) {
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/products" className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
          <ArrowLeft size={20} />
        </Link>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} color="var(--color-primary)" />
          Add New Product
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          
          <div className="form-group">
            <label className="form-label">Product ID (e.g., p1, m2)</label>
            <input required name="id" value={formData.id} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">URL Slug (e.g., mts-postman)</label>
            <input required name="slug" value={formData.slug} onChange={handleChange} className="form-input" />
          </div>

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
            <label className="form-label">Initial Stock</label>
            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input required name="image" value={formData.image} onChange={handleChange} placeholder="/images/book.jpg" className="form-input" />
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
            <label className="form-label">Badge (Optional, e.g., Bestseller)</label>
            <input name="badge" value={formData.badge} onChange={handleChange} className="form-input" />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
