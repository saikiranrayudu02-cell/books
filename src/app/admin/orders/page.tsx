'use client';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(o => o.status === selectedStatus);

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'all') return 'All Orders';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

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
    <div className="space-y-8">
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

      {/* Category Wise Status Tabs */}
      <div 
        className="status-tab-scroll"
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '8px',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .status-tab-scroll::-webkit-scrollbar {
            display: none;
          }
          .status-tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            font-size: 0.85rem;
            font-weight: 600;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1.5px solid var(--color-border-light);
            background: var(--color-white);
            color: var(--color-text-secondary);
          }
          .status-tab-btn:hover {
            background: var(--color-bg-hover);
            color: var(--color-text-primary);
            border-color: var(--color-border);
          }
          .status-tab-btn.active {
            background: var(--color-primary);
            color: #ffffff;
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(26, 43, 76, 0.12);
          }
        `}</style>

        {['all', ...statusOptions].map(opt => {
          const isActive = selectedStatus === opt;
          const count = getStatusCount(opt);
          
          return (
            <button
              key={opt}
              onClick={() => setSelectedStatus(opt)}
              className={`status-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span>{getStatusLabel(opt)}</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-bg-page)',
                color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                border: isActive ? 'none' : '1px solid var(--color-border-light)',
              }}>
                {count}
              </span>
            </button>
          );
        })}
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
          <>
            {filteredOrders.length === 0 ? (
              <div className="admin-empty" style={{ padding: '48px 24px' }}>
                <div className="admin-empty__icon">
                  <Package size={28} />
                </div>
                <div className="admin-empty__title" style={{ fontSize: '1rem', fontWeight: 700 }}>No orders found</div>
                <div className="admin-empty__desc" style={{ fontSize: '0.85rem' }}>
                  There are currently no orders with the status <strong>"{selectedStatus.replace(/_/g, ' ')}"</strong>.
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
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
                          <span className="status-badge" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="form-select text-sm"
                            style={{ minWidth: '130px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <option value="" disabled>Update Status</option>
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
          </>
        )}
      </div>
    </div>
  );
}
