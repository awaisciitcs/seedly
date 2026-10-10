'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem, options?: { openDrawer?: boolean }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotalMinor: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  isLoaded: boolean;
  cartBump: boolean;
  toastItem: CartItem | null;
  dismissToast: () => void;
  announcement: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const FREE_SHIPPING_THRESHOLD_MINOR = 250000; // Rs. 2,500

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [toastItem, setToastItem] = useState<CartItem | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const dismissToast = React.useCallback(() => {
    setToastItem(null);
  }, []);

  // Live Price Revalidation (Guarantees prices match live catalog, e.g. Luteal Kit Rs. 1,290)
  const syncLivePrices = React.useCallback(async (currentItems: CartItem[]) => {
    if (!currentItems.length) return;
    try {
      const res = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentItems }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.updatedItems) && data.updatedItems.length > 0) {
        setItems((prev) =>
          prev.map((item) => {
            const update = data.updatedItems.find((u: any) => u.id === item.id);
            if (update && (update.price_minor !== item.price_minor || update.max_quantity !== item.max_quantity)) {
              return {
                ...item,
                price_minor: update.price_minor,
                max_quantity: update.max_quantity,
              };
            }
            return item;
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seedly_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed);
        syncLivePrices(parsed);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, [syncLivePrices]);

  // Sync prices when drawer opens
  useEffect(() => {
    if (isCartOpen && items.length > 0) {
      syncLivePrices(items);
    }
  }, [isCartOpen, syncLivePrices]);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('seedly_cart', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem, options?: { openDrawer?: boolean }) => {
    // Guard: Prevent adding out-of-stock items
    if (item.max_quantity !== undefined && item.max_quantity <= 0) {
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + item.quantity;
        const max = item.max_quantity ?? next[existingIndex].max_quantity;
        const cappedQty = max !== undefined ? Math.min(newQty, max) : newQty;

        next[existingIndex] = {
          ...next[existingIndex],
          quantity: cappedQty,
          max_quantity: max,
        };
        return next;
      }
      return [...prev, item];
    });

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (options?.openDrawer === false || isMobile) {
      if (isMobile) {
        setToastItem(item);
      }
    } else {
      setIsCartOpen(true);
    }

    setCartBump(true);
    setTimeout(() => setCartBump(false), 260);
    setAnnouncement(`Added ${item.name} to basket`);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const max = item.max_quantity;
          const capped = max !== undefined ? Math.min(quantity, max) : quantity;
          return { ...item, quantity: capped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotalMinor = items.reduce(
    (sum, item) => sum + item.price_minor * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalMinor,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD_MINOR,
        isLoaded,
        cartBump,
        toastItem,
        dismissToast,
        announcement,
      }}
    >
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
