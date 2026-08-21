'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';

export default function OrdersPage(): React.JSX.Element {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/user/orders?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg-page)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'var(--color-white)', borderRadius: '50%', marginBottom: '24px', color: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <PackageOpen size={48} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>No Orders Yet</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px', fontSize: '1rem' }}>
          You haven&apos;t placed any orders yet. Start shopping!
        </p>
        <Link href="/study-materials" className="btn btn-primary">Browse Study Materials</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
        My Orders
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Order: {order.orderNumber}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
              <span>Total: {formatPrice(order.total)}</span>
              <span style={{ textTransform: 'capitalize', color: 'var(--color-success)', fontWeight: 500 }}>
                {order.status}
              </span>
            </div>
            <Link href={`/account/orders/${order.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
