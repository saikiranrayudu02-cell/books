'use client';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success('Order status updated');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statusOptions = ['placed', 'processing', 'packed', 'dispatched', 'out_for_delivery', 'delivered'];

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={24} color="var(--color-primary)" />
          Manage Orders
        </h2>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border-light)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Total</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{order.orderNumber}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{order.userName || 'Guest'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatPrice(order.total)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: order.paymentStatus === 'paid' ? 'rgba(56, 142, 60, 0.1)' : 'rgba(229, 57, 53, 0.1)', 
                        color: order.paymentStatus === 'paid' ? 'var(--color-success)' : 'var(--color-error)', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' 
                      }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', 
                          fontSize: '0.85rem', background: 'var(--color-bg-page)', cursor: 'pointer' 
                        }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
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
