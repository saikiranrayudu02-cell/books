'use client';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Package, RefreshCw } from 'lucide-react';
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

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'status-badge status-badge--success';
      case 'unpaid':
      case 'failed': return 'status-badge status-badge--error';
      case 'pending': return 'status-badge status-badge--warning';
      default: return 'status-badge status-badge--neutral';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <span className="admin-loading__text">Loading orders...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <ShoppingCart size={24} />
            Manage Orders
          </h2>
          <p className="admin-page-desc">Review and update customer order statuses</p>
        </div>
        <button onClick={() => { setLoading(true); fetchOrders(); }} className="btn btn-ghost btn-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className="admin-card">
        {orders.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty__icon">
              <Package size={28} />
            </div>
            <div className="admin-empty__title">No orders yet</div>
            <div className="admin-empty__desc">
              Orders will appear here when customers complete their first purchase.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="col-primary">{order.orderNumber}</td>
                    <td className="col-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="col-primary">{order.userName || 'Guest'}</div>
                      <div className="col-muted">{order.userEmail}</div>
                    </td>
                    <td className="col-bold">{formatPrice(order.total)}</td>
                    <td>
                      <span className={getPaymentBadgeClass(order.paymentStatus)}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="form-select text-sm"
                        style={{ minWidth: '140px' }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
