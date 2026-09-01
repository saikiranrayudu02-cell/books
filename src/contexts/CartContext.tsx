'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, Product, LanguageCode } from '@/types';

interface CartContextType {
  items: CartItem[];
  isLoaded: boolean;
  lastAddedItem: CartItem | null;
  addItem: (product: Product, language: LanguageCode | string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearLastAddedItem: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'tep_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, language: LanguageCode | string, quantity = 1) => {
    const newItem: CartItem = {
      id: `${product.id}_${language}_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.image,
      price: product.price,
      language,
      quantity,
      badge: product.badge,
      bundleTitle: product.bundleTitle || (product.id === 'p1' ? '2-Book Preparation Set' : '3-Book Preparation Set'),
      booksIncluded: product.booksIncluded || (product.id === 'p1' ? 2 : 3),
      edition: product.edition || 'First Edition',
    };

    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id && item.language === language);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id && item.language === language
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, newItem];
    });

    setLastAddedItem(newItem);
  }, []);

  const clearLastAddedItem = useCallback(() => {
    setLastAddedItem(null);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      isLoaded,
      lastAddedItem,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearLastAddedItem,
      totalItems,
      subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
