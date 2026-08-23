'use client';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Package, RefreshCw, Copy, Check, Search, Calendar as CalendarIcon, Eye, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [detailsModalOrder, setDetailsModalOrder] = useState<any | null>(null);
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

  const handleCopyDetails = (order: any) => {
    if (!order.deliveryAddress) return;
    const addr = order.deliveryAddress;
    const text = `Order ID: ${order.orderNumber}\nCustomer: ${order.userName || 'Guest'}\n\nDelivery Address:\n${addr.fullName}\n${addr.houseOrFlat}, ${addr.street}\n${addr.area ? addr.area + '\n' : ''}${addr.city}, ${addr.state} - ${addr.pinCode}\nMob: ${addr.mobile}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusOptions = ['placed', 'payment_confirmed', 'dispatched'];

  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    
    // Search Filter (by Order ID or Customer Name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const orderId = (o.orderNumber || '').toLowerCase();
      const customer = (o.userName || '').toLowerCase();
      if (!orderId.includes(term) && !customer.includes(term)) return false;
    }

    // Date Filter (by created_at)
    if (filterDate) {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      if (orderDate !== filterDate) return false;
    }

    return true;
  });

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
      <div className="admin-page-header flex-col md:flex-row gap-4 md:items-center items-start">
        <div>
          <h2 className="admin-page-title">
            <ShoppingCart size={24} />
            Manage Orders
          </h2>
          <p className="admin-page-desc">Review and update customer order statuses</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-(--color-text-muted) group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-(--color-bg-page) hover:bg-(--color-bg-hover) border border-(--color-border) focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium text-(--color-text-primary) placeholder-(--color-text-muted) transition-all outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-(--color-text-muted) hover:text-rose-500 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative w-full sm:w-44 group">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-(--color-bg-page) hover:bg-(--color-bg-hover) border border-(--color-border) focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium text-(--color-text-primary) transition-all outline-none cursor-pointer"
            />
          </div>

          <button onClick={() => { setLoading(true); fetchOrders(); }} className="btn btn-ghost btn-sm shrink-0">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
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
                      <th>Items</th>
                      <th>Details</th>
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
                        <td>
                          {order.items && order.items.length > 0 ? (
                            <div className="flex flex-col gap-1 max-w-50">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs truncate" title={`${item.quantity}x ${item.productName} (${item.language})`}>
                                  <span className="font-bold">{item.quantity}x</span> {item.productName} <span className="text-(--color-text-muted)">({item.language})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="col-muted text-xs">No items</span>
                          )}
                        </td>
                        <td>
                          {order.deliveryAddress ? (
                            <button
                              onClick={() => setDetailsModalOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <Eye size={14} strokeWidth={2.5} /> View Details
                            </button>
                          ) : (
                            <span className="col-muted">N/A</span>
                          )}
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
      {/* Order Details Modal */}
      {detailsModalOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-(--color-bg-card) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            
            <div className="flex items-center justify-between p-4 border-b border-(--color-border) bg-(--color-bg-hover)">
              <h3 className="font-bold text-(--color-text-primary) flex items-center gap-2">
                <Package size={18} className="text-blue-500" />
                Order Details
              </h3>
              <button 
                onClick={() => setDetailsModalOrder(null)}
                className="p-1.5 text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-page) rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1">Order ID</div>
                  <div className="font-bold text-(--color-text-primary)">{detailsModalOrder.orderNumber}</div>
                </div>
                <button
                  onClick={() => handleCopyDetails(detailsModalOrder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-page) border border-(--color-border) hover:bg-(--color-bg-hover) text-(--color-text-secondary) rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {copiedId === detailsModalOrder.id ? (
                    <><Check size={14} className="text-emerald-500" strokeWidth={3} /> <span className="text-emerald-500">Copied</span></>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1">Customer</div>
                <div className="font-medium text-(--color-text-primary)">{detailsModalOrder.userName || 'Guest'}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-2">Items Ordered</div>
                <div className="p-3 bg-(--color-bg-page) border border-(--color-border-light) rounded-xl">
                  {detailsModalOrder.items && detailsModalOrder.items.length > 0 ? (
                    <ul className="space-y-2">
                      {detailsModalOrder.items.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-start text-sm">
                          <div>
                            <span className="font-bold text-(--color-text-primary)">{item.quantity}x</span>{' '}
                            <span className="font-medium text-(--color-text-primary)">{item.productName}</span>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 bg-(--color-bg-hover) text-(--color-text-secondary) rounded-md ml-2 shrink-0">
                            {item.language}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-(--color-text-muted)">No items found</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-2">Delivery Address</div>
                <div className="p-4 bg-(--color-bg-page) border border-(--color-border-light) rounded-xl text-sm text-(--color-text-secondary) leading-relaxed">
                  <strong className="text-(--color-text-primary) block mb-1">{detailsModalOrder.deliveryAddress?.fullName}</strong>
                  {detailsModalOrder.deliveryAddress?.houseOrFlat}, {detailsModalOrder.deliveryAddress?.street}<br/>
                  {detailsModalOrder.deliveryAddress?.area && <>{detailsModalOrder.deliveryAddress?.area}<br/></>}
                  {detailsModalOrder.deliveryAddress?.city}, {detailsModalOrder.deliveryAddress?.state} - {detailsModalOrder.deliveryAddress?.pinCode}<br/>
                  <div className="mt-3 pt-3 border-t border-(--color-border-light) border-dashed">
                    <span className="font-medium">Mob:</span> {detailsModalOrder.deliveryAddress?.mobile}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
