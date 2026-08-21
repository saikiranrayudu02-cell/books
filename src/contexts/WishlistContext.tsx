'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WishlistItem, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistContextType {
  items: WishlistItem[];
  isLoaded: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_KEY = 'tep_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  // Load wishlist on mount or user change
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/wishlist?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setItems(data.items || []);
          }
        } catch (e) {
          console.error('Failed to fetch wishlist', e);
        }
      } else {
        try {
          const saved = localStorage.getItem(WISHLIST_KEY);
          if (saved) setItems(JSON.parse(saved));
        } catch {}
      }
      setIsLoaded(true);
    };

    fetchWishlist();
  }, [user]);

  // Sync to local storage only if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded, user]);

  const addItem = useCallback(async (product: Product) => {
    setItems(prev => {
      if (prev.find(item => item.productId === product.id)) return prev;
      return [...prev, {
        id: `wish_${product.id}_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.image,
        price: product.price,
        badge: product.badge,
        languages: product.languages,
        addedAt: new Date().toISOString(),
      }];
    });

    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.image,
            price: product.price,
            badge: product.badge,
          })
        });
      } catch (err) {
        console.error('Failed to sync add to wishlist', err);
      }
    }
  }, [user]);

  const removeItem = useCallback(async (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
    
    if (user) {
      try {
        await fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to sync remove from wishlist', err);
      }
    }
  }, [user]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
      return false;
    } else {
      addItem(product);
      return true;
    }
  }, [isInWishlist, removeItem, addItem]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider value={{
      items,
      isLoaded,
      addItem,
      removeItem,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      totalItems: items.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
