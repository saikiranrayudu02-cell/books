'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Package,
  Activity,
  User,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatActivityTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const getTodayDateString = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center text-(--color-text-muted)">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-(--color-error) bg-(--color-error-bg) rounded-2xl border border-(--color-border) flex items-center gap-3">
        <AlertCircle className="shrink-0" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn text-(--color-text-primary)">
      
      {/* Premium Dashboard Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 text-white shadow-xl shadow-slate-900/10">
        {/* Abstract vector accents */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#60a5fa' }}>
              <Sparkles size={14} className="animate-pulse" />
              Publisher Portal Control Center
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl" style={{ color: '#ffffff' }}>
              Hello, Administrator!
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed" style={{ color: '#cbd5e1' }}>
              Monitor customer activity, review incoming book order packages, manage product stock levels, and track checkout statistics.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl">
            <Calendar size={18} className="text-blue-400" style={{ color: '#60a5fa' }} />
            <div className="text-right">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400" style={{ color: '#94a3b8' }}>Current Date</span>
              <span className="block text-xs font-bold text-slate-200" style={{ color: '#e2e8f0' }}>{getTodayDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metric Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
        
        {/* Stat Card 1: Total Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/20">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 bg-(--color-success-bg) text-(--color-success) rounded-xl transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-(--color-success) bg-(--color-success-bg) px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> Live
            </div>
          </div>
          <h3 className="font-bold text-(--color-text-muted) text-[10px] uppercase tracking-wider mb-1">Total Sales</h3>
          <p className="text-3xl font-black text-(--color-text-primary) tracking-tight">{formatPrice(data.totalRevenue)}</p>
          <p className="text-xs text-(--color-text-muted) mt-2">Paid orders revenue accumulated</p>
        </div>
        
        {/* Stat Card 2: Active Users */}
        <div className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-500/20">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 bg-(--color-info-bg) text-(--color-info) rounded-xl transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-(--color-info) bg-(--color-info-bg) px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> Growth
            </div>
          </div>
          <h3 className="font-bold text-(--color-text-muted) text-[10px] uppercase tracking-wider mb-1">Active Users</h3>
          <p className="text-3xl font-black text-(--color-text-primary) tracking-tight">{data.totalUsers}</p>
          <p className="text-xs text-(--color-text-muted) mt-2">Registered study portal customers</p>
        </div>
        
        {/* Stat Card 3: Total Orders */}
        <div className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/20">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 bg-(--color-indigo-bg) text-(--color-indigo) rounded-xl transition-colors group-hover:bg-indigo-500 group-hover:text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-(--color-indigo) bg-(--color-indigo-bg) px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> Volume
            </div>
          </div>
          <h3 className="font-bold text-(--color-text-muted) text-[10px] uppercase tracking-wider mb-1">Checkouts</h3>
          <p className="text-3xl font-black text-(--color-text-primary) tracking-tight">{data.totalOrders}</p>
          <p className="text-xs text-(--color-text-muted) mt-2">Total order packets created</p>
        </div>

        {/* Stat Card 4: Product Count */}
        <div className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-500/20">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 bg-(--color-warning-bg) text-(--color-warning) rounded-xl transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <Package className="h-5 w-5" />
            </div>
            {data.lowStockProducts > 0 ? (
              <div className="flex items-center gap-1 text-xs font-extrabold text-(--color-error) bg-(--color-error-bg) px-2.5 py-0.5 rounded-full animate-pulse">
                <AlertCircle className="h-3 w-3" /> Low Stock
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-extrabold text-(--color-success) bg-(--color-success-bg) px-2 py-0.5 rounded-full">
                Safe
              </div>
            )}
          </div>
          <h3 className="font-bold text-(--color-text-muted) text-[10px] uppercase tracking-wider mb-1">Products</h3>
          <p className="text-3xl font-black text-(--color-text-primary) tracking-tight">{data.totalProducts}</p>
          <p className="text-xs text-(--color-error) mt-2 font-semibold">
            {data.lowStockProducts} items require replenishment
          </p>
        </div>
      </div>
      
      {/* Split Widget Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Recent Orders Table & Activity List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Orders Widget */}
          <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-(--color-text-primary) flex items-center gap-2.5">
                <div className="p-1.5 bg-(--color-info-bg) rounded-lg text-(--color-info)">
                  <ShoppingBag size={18} />
                </div>
                Recent Shipments
              </h3>
              <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-(--color-info) hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Manage Orders <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-(--color-border) text-(--color-text-muted) font-bold text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pr-4">Order ID</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  {data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-(--color-text-muted)">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.map((order: any) => (
                      <tr key={order.id} className="text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-(--color-text-primary)">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-(--color-text-secondary)">
                          {order.userName || 'Guest'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                            order.status === 'delivered'
                              ? 'bg-(--color-success-bg) text-(--color-success) border-(--color-success)'
                              : 'bg-(--color-indigo-bg) text-(--color-indigo) border-(--color-indigo)'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right font-black text-(--color-text-primary)">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Timeline Widget */}
          <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs">
            <h3 className="text-lg font-extrabold text-(--color-text-primary) mb-6 flex items-center gap-2.5">
              <div className="p-1.5 bg-(--color-success-bg) rounded-lg text-(--color-success)">
                <Activity size={18} />
              </div>
              Real-time Activity Stream
            </h3>
            
            <div className="relative pl-6 border-l-2 border-(--color-border) space-y-6 ml-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-center py-6 text-(--color-text-muted)">No activity recorded yet.</p>
              ) : (
                data.recentActivity.map((activity: any, i: number) => {
                  const Icon = activity.type === 'sale' ? DollarSign : User;
                  const isSale = activity.type === 'sale';
                  return (
                    <div key={i} className="relative flex items-start space-x-4 p-4 rounded-2xl bg-(--color-bg-hover) hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-(--color-border)">
                      
                      {/* Timeline Bullet Anchor Indicator */}
                      <span className={`absolute -left-8.75 top-7 size-4 rounded-full border-4 border-(--color-bg-card) ${
                        isSale ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />

                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isSale 
                          ? 'bg-(--color-success-bg) text-(--color-success)' 
                          : 'bg-(--color-info-bg) text-(--color-info)'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-(--color-text-primary)">
                          {activity.title}
                        </p>
                        <p className="text-xs text-(--color-text-secondary) mt-1 leading-relaxed">
                          {activity.desc}
                        </p>
                      </div>
                      
                      <div className="text-[10px] font-bold uppercase tracking-wider text-(--color-text-muted) shrink-0 ml-4">
                        {formatActivityTime(activity.time)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Performance Indicators & Top Products */}
        <div className="space-y-8">
          
          {/* Performance Quick Stats panel */}
          <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs">
            <h3 className="text-lg font-extrabold text-(--color-text-primary) mb-6 flex items-center gap-2.5">
              <div className="p-1.5 bg-(--color-indigo-bg) rounded-lg text-(--color-indigo)">
                <Percent size={18} />
              </div>
              Performance Metrics
            </h3>
            
            <div className="space-y-6">
              
              {/* Stat 1: Dispatch rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-(--color-text-secondary)">Order Dispatch Rate</span>
                  <span className="font-bold text-(--color-text-primary)">85%</span>
                </div>
                <div className="w-full bg-(--color-pastel-blue) rounded-full h-2 overflow-hidden">
                  <div className="bg-linear-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              {/* Stat 2: Low Stock Warning */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-(--color-text-secondary)">Low Stock ratio</span>
                  <span className="font-bold text-(--color-error)">
                    {Math.round((data.lowStockProducts / (data.totalProducts || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-(--color-pastel-blue) rounded-full h-2 overflow-hidden">
                  <div className="bg-linear-to-r from-orange-500 to-rose-500 h-2 rounded-full" style={{ width: `${Math.round((data.lowStockProducts / (data.totalProducts || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              {/* Stat 3: Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-(--color-text-secondary)">Checkout Conversion</span>
                  <span className="font-bold text-(--color-text-primary)">92%</span>
                </div>
                <div className="w-full bg-(--color-pastel-blue) rounded-full h-2 overflow-hidden">
                  <div className="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products List Widget */}
          <div className="rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-6 shadow-xs">
            <h3 className="text-lg font-extrabold text-(--color-text-primary) mb-6 flex items-center gap-2.5">
              <div className="p-1.5 bg-(--color-warning-bg) rounded-lg text-(--color-warning)">
                <Layers size={18} />
              </div>
              Best Sellers
            </h3>
            
            <div className="space-y-3">
              {data.topProducts.length === 0 ? (
                <p className="text-center py-6 text-(--color-text-muted) text-sm">No items sold yet.</p>
              ) : (
                data.topProducts.map((prod: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-(--color-bg-hover) border border-(--color-border) transition-colors">
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-(--color-text-primary) truncate pr-2">
                        {prod.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-(--color-text-muted) mt-1 uppercase tracking-wider">
                        {prod.sold} units sold
                      </span>
                    </div>
                    <span className="text-sm font-black text-(--color-text-primary) shrink-0 ml-4 bg-(--color-bg-hover) px-3 py-1 rounded-lg">
                      {formatPrice(prod.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
