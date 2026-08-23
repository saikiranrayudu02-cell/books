'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { 
  Package, 
  Heart, 
  MapPin, 
  Truck, 
  ChevronRight, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface QuickLinkCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  color: string;
}

export default function AccountPage(): React.JSX.Element {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [addressesCount, setAddressesCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchStats = async () => {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          fetch(`/api/user/orders?userId=${user.id}`),
          fetch(`/api/user/addresses?userId=${user.id}`)
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrdersCount(ordersData.orders?.length || 0);
        }
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json();
          setAddressesCount(addressesData.addresses?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const cards: QuickLinkCard[] = [
    { 
      icon: <Package size={24} strokeWidth={1.5} />, 
      title: 'My Orders', 
      desc: 'Track, view, and manage your purchases', 
      href: '/account/orders',
      color: '#3b82f6'
    },
    { 
      icon: <Heart size={24} strokeWidth={1.5} />, 
      title: 'Wishlist', 
      desc: 'View and buy your saved study materials', 
      href: '/account/wishlist',
      color: '#ec4899'
    },
    { 
      icon: <MapPin size={24} strokeWidth={1.5} />, 
      title: 'Addresses', 
      desc: 'Manage your primary and shipping addresses', 
      href: '/account/addresses',
      color: '#10b981'
    },
    { 
      icon: <Truck size={24} strokeWidth={1.5} />, 
      title: 'Track Order', 
      desc: 'Get live shipping updates for active orders', 
      href: '/track-order',
      color: '#8b5cf6'
    },
  ];

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Premium Banner Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 shadow-xs border border-gray-200 dark:border-slate-700/50">
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Avatar container */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
          }}>
            {firstLetter}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.5px',
                color: 'var(--color-text-primary)'
              }}>
                Welcome back, {user?.name || 'User'}!
              </h1>
              <span style={{
                background: 'var(--color-bg-page)',
                border: '1px solid var(--color-border-light)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-text-secondary)'
              }}>
                <Shield size={12} /> {user?.role || 'Customer'}
              </span>
            </div>
            <p style={{ 
              margin: '8px 0 0 0', 
              color: 'var(--color-text-secondary)', 
              fontSize: '0.95rem',
              lineHeight: 1.5,
              maxWidth: '560px'
            }}>
              Manage your orders, wishlist, and account details.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Stats Counter Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Stat 1 */}
        <div className="card" style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderRadius: '20px',
          border: '1px solid var(--color-border-light)',
          background: 'var(--color-white)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)', 
            color: '#3b82f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.05)'
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>
              {loadingStats ? '...' : ordersCount}
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="card" style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderRadius: '20px',
          border: '1px solid var(--color-border-light)',
          background: 'var(--color-white)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)', 
            color: '#ec4899', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(236, 72, 153, 0.05)'
          }}>
            <Heart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wishlist Items</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>
              {wishlistItems.length}
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="card" style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderRadius: '20px',
          border: '1px solid var(--color-border-light)',
          background: 'var(--color-white)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)', 
            color: '#10b981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.05)'
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saved Addresses</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>
              {loadingStats ? '...' : addressesCount}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Personal Information & Dashboard Quick Links */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Left Side: Personal Information Card */}
        <div className="card" style={{ padding: '28px', border: '1px solid var(--color-border-light)', borderRadius: '24px' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.15rem', 
            fontWeight: 700, 
            marginBottom: '24px',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserIcon size={20} color="var(--color-primary)" />
            Profile Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Field: Name */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border-light)',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'var(--color-white)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <UserIcon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || '—'}
                </div>
              </div>
            </div>

            {/* Field: Email */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border-light)',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'var(--color-white)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <Mail size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || '—'}
                </div>
              </div>
            </div>

            {/* Field: Phone */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border-light)',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'var(--color-white)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <Phone size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.phone || '—'}
                </div>
              </div>
            </div>

            {/* Field: Role */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border-light)',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'var(--color-white)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <Shield size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Authority</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginTop: '2px', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.role || 'Customer'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Quick Links Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.15rem', 
            fontWeight: 700, 
            margin: '0 0 4px 0',
            color: 'var(--color-text-primary)'
          }}>
            Quick Actions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cards.map(card => (
              <Link 
                key={card.href} 
                href={card.href} 
                className="card card-interactive" 
                style={{
                  padding: '16px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  textDecoration: 'none',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = 'var(--color-border-light)';
                }}
              >
                {/* Icon Container with dynamic colored BG */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px',
                  background: `${card.color}15`, 
                  color: card.color 
                }}>
                  {card.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 650, 
                    fontSize: '0.95rem', 
                    color: 'var(--color-text-primary)'
                  }}>
                    {card.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--color-text-muted)',
                    marginTop: '2px'
                  }}>
                    {card.desc}
                  </div>
                </div>
                
                <div style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
                  <ChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
