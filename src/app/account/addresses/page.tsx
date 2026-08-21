'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { INDIAN_STATES } from '@/lib/data';
import { MapPin } from 'lucide-react';

interface SavedAddress {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  houseOrFlat: string;
  street: string;
  area: string | null;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export default function AddressesPage(): React.JSX.Element {
  const { user } = useAuth();
  const toast = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    houseOrFlat: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false
  });

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/addresses?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.id })
      });
      if (res.ok) {
        toast.success('Address saved successfully');
        setShowForm(false);
        setFormData({
          fullName: '', mobile: '', email: '', houseOrFlat: '',
          street: '', area: '', city: '', state: '', pinCode: '', isDefault: false
        });
        fetchAddresses();
      } else {
        toast.error('Failed to save address');
      }
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}?userId=${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address deleted');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading addresses...</div>;
  }

  if (addresses.length === 0 && !showForm) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg-page)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'var(--color-white)', borderRadius: '50%', marginBottom: '24px', color: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <MapPin size={48} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>No Saved Addresses</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Add a delivery address for faster checkout
        </p>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Address
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
          Saved Addresses
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          {showForm ? 'Cancel' : '+ Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-6 md:p-8 mb-5">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Add New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" style={inputStyle} />
            <input required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" style={inputStyle} />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" style={inputStyle} />
            <input required name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="PIN Code" style={inputStyle} />
            <input required name="houseOrFlat" value={formData.houseOrFlat} onChange={handleChange} placeholder="House / Flat No." style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <input required name="street" value={formData.street} onChange={handleChange} placeholder="Street" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <input name="area" value={formData.area} onChange={handleChange} placeholder="Area / Locality" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <input required name="city" value={formData.city} onChange={handleChange} placeholder="City" style={inputStyle} />
            <select required name="state" value={formData.state} onChange={handleChange} style={inputStyle}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
            <span style={{ fontSize: '0.9rem' }}>Set as default address</span>
          </label>
          <button type="submit" className="btn btn-primary">Save Address</button>
        </form>
      )}

      {addresses.map(addr => (
        <div key={addr.id} className="card" style={{ padding: '20px', marginBottom: '12px', position: 'relative' }}>
          {addr.isDefault && <span style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '0.75rem', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>Default</span>}
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>{addr.fullName}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {addr.houseOrFlat}, {addr.street}<br />
            {addr.area && <>{addr.area}<br /></>}
            {addr.city}, {addr.state} - {addr.pinCode}<br />
            Mobile: {addr.mobile}
          </div>
          <div style={{ marginTop: '12px' }}>
            <button onClick={() => handleDelete(addr.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  fontSize: '0.9rem'
};
