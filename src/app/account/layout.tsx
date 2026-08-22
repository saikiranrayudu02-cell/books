'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { User, Package, Heart, MapPin, LogOut, Lock } from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MENU: MenuItem[] = [
  { href: '/account', label: 'My Account', icon: <User size={18} /> },
  { href: '/account/orders', label: 'My Orders', icon: <Package size={18} /> },
  { href: '/account/wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
  { href: '/account/addresses', label: 'Addresses', icon: <MapPin size={18} /> },
];

export default function AccountLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'var(--color-bg-page)', borderRadius: '50%', marginBottom: '24px', color: 'var(--color-primary)' }}>
          <Lock size={48} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Please Sign In</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '1rem', lineHeight: 1.5 }}>You need to sign in to access your account dashboard and view your orders.</p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Sign In to Continue</Link>
      </div>
    );
  }

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>My Account</h1>
      </div>

      <div className="container px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
          
          {/* Sidebar */}
          <div className="hidden md:block card md:sticky" style={{ 
            padding: '20px', 
            top: 'calc(var(--navbar-height) + 24px)',
            borderRadius: '20px',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            {/* Sidebar User Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '8px 12px 16px 12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
              }}>
                {firstLetter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 705, fontSize: '0.95rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {user?.email || user?.phone}
                </div>
              </div>
            </div>

            <hr className="divider" style={{ margin: '0 0 16px 0', borderTop: '1px solid var(--color-border-light)' }} />
            
            {/* Sidebar Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {MENU.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '12px 16px', 
                      borderRadius: '12px',
                      fontSize: '0.925rem', 
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                      background: isActive 
                        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
                        : 'transparent',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-bg-page)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                        e.currentTarget.style.paddingLeft = '20px';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.paddingLeft = '16px';
                      }
                    }}
                  >
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      opacity: isActive ? 1 : 0.7 
                    }}>
                      {item.icon}
                    </span> 
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <hr className="divider" style={{ margin: '16px 0', borderTop: '1px solid var(--color-border-light)' }} />
            
            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 16px', 
                borderRadius: '12px',
                fontSize: '0.925rem', 
                fontWeight: 500, 
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.05)', 
                border: 'none', 
                cursor: 'pointer',
                width: '100%', 
                textAlign: 'left', 
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.paddingLeft = '20px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                e.currentTarget.style.paddingLeft = '16px';
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Content */}
          <div style={{ minWidth: 0 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
