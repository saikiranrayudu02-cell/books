'use client';
import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/contexts/ToastContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchOverlay from '@/components/ui/SearchOverlay';
import FloatingSupport from '@/components/ui/FloatingSupport';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isAdminOrDemo = pathname.startsWith('/admin') || pathname.startsWith('/demo') || pathname.startsWith('/login');
  const isAccount = pathname.startsWith('/account');

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            {!isAdminOrDemo && <Navbar onSearchOpen={() => setSearchOpen(true)} />}
            {!isAdminOrDemo && <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
            <main style={isAdminOrDemo ? {} : { minHeight: 'calc(100vh - var(--navbar-height))' }}>
              {children}
            </main>
            {!isAdminOrDemo && !isAccount && <Footer />}
            {!isAdminOrDemo && <FloatingSupport />}
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
