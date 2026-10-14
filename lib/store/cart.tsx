'use client';
import {trackEvent} from '@/lib/tracking/client';
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { CartItem, CheckoutLine, CustomerStoreSettings } from '../types';
import { addCartItem, restoreCart, cartIdentity, removeOrderedItems } from '../cart-state';

interface CartContextType {
  couponCode: string; setCouponCode: (code: string) => void;
  items: CartItem[]; addItem: (item: CartItem, options?: { openDrawer?: boolean }) => boolean;
  removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void; clearCart: () => void; completeOrder: (ordered: CheckoutLine[]) => void;
  subtotalMinor: number; itemCount: number; isCartOpen: boolean; setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number; shippingFeeMinor: number | null; isLoaded: boolean; isSyncing: boolean; syncError: string;
  cartBump: boolean; toastItem: CartItem | null; dismissToast: () => void; announcement: string;
  settings: CustomerStoreSettings | null; settingsError: string; refreshSettings: () => Promise<void>; syncLivePrices: () => Promise<void>;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [couponCode, setCouponCode] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const settingsSequence = useRef(0);
  const itemsRef = useRef<CartItem[]>([]); const syncSequence = useRef(0);
  const [isCartOpen, setIsCartOpen] = useState(false); const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); const [syncError, setSyncError] = useState('');
  const [cartBump, setCartBump] = useState(false); const bumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastItem, setToastItem] = useState<CartItem | null>(null); const [announcement, setAnnouncement] = useState('');
  const [settings, setSettings] = useState<CustomerStoreSettings | null>(null); const [settingsError, setSettingsError] = useState('');
  const commit = useCallback((next: CartItem[]) => { itemsRef.current = next; setItems(next); }, []);
  const dismissToast = useCallback(() => setToastItem(null), []);
  const refreshSettings = useCallback(async () => {
    const sequence = ++settingsSequence.current; setSettingsError('');
    try {
      const response = await fetch('/api/store/settings', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (!result.data || !Number.isSafeInteger(result.data.delivery_fee_minor) || result.data.delivery_fee_minor < 0 || !Number.isSafeInteger(result.data.free_delivery_threshold_minor) || result.data.free_delivery_threshold_minor < 1) throw new Error();
      if (sequence === settingsSequence.current) setSettings(result.data);
    } catch { if (sequence === settingsSequence.current) { setSettings(null); setSettingsError('Delivery and payment details could not load. Please try again.'); } }
  }, []);
  const syncLivePrices = useCallback(async () => {
    const snapshot = itemsRef.current;
    if (!snapshot.length) return;
    const sequence = ++syncSequence.current; setIsSyncing(true); setSyncError('');
    try {
      const response = await fetch('/api/cart/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: snapshot }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (sequence !== syncSequence.current) return;
      if (!Array.isArray(result.updatedItems)) throw new Error();
      let changed = false;
      const next = itemsRef.current.map(item => {
        const update = result.updatedItems.find((candidate: CartItem & { previous_id?: string }) => candidate.previous_id === item.id);
        if (!update) return item;
        const stock = Math.max(0, Math.floor(update.max_quantity ?? 0));
        const quantity = stock > 0 ? Math.min(item.quantity, stock, 99) : item.quantity;
        if (item.price_minor !== update.price_minor || quantity !== item.quantity || stock === 0 || item.variant_id !== update.variant_id) changed = true;
        return { ...item, ...update, id: cartIdentity(update), quantity, max_quantity: stock };
      });
      commit(restoreCart(next));
      if (changed) setAnnouncement('Your basket was updated to current prices and availability. Please review the items before checkout.');
    } catch { if (sequence === syncSequence.current) setSyncError('We could not check current prices and stock. Retry before checkout.'); }
    finally { if (sequence === syncSequence.current) setIsSyncing(false); }
  }, [commit]);
  useEffect(() => {
    try { const saved = localStorage.getItem('seedly_coupon') || ''; if (/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(saved)) setCouponCode(saved); } catch { /* Optional coupon persistence. */ }
    try { commit(restoreCart(JSON.parse(localStorage.getItem('seedly_cart') || '[]'))); } catch { commit([]); }
    setIsLoaded(true); void refreshSettings(); void syncLivePrices();
    return () => { settingsSequence.current++; syncSequence.current++; if (bumpTimer.current) clearTimeout(bumpTimer.current); };
  }, [commit, refreshSettings, syncLivePrices]);
  useEffect(() => { if (isLoaded) { try { localStorage.setItem('seedly_cart', JSON.stringify(items)); } catch { /* Basket works without local storage. */ } } }, [items, isLoaded]);
  useEffect(() => { if (isLoaded) { try { if (couponCode) localStorage.setItem('seedly_coupon', couponCode); else localStorage.removeItem('seedly_coupon'); } catch { /* Coupons work without storage. */ } } }, [couponCode, isLoaded]);
  useEffect(() => { if (isCartOpen) void syncLivePrices(); }, [isCartOpen, syncLivePrices]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => { void refreshSettings(); void syncLivePrices(); }, 350); };
    window.addEventListener('seedly:store-updated', refresh);
    return () => { clearTimeout(timer); window.removeEventListener('seedly:store-updated', refresh); };
  }, [refreshSettings, syncLivePrices]);
  const addItem = useCallback((item: CartItem, options?: { openDrawer?: boolean }) => {
    const result = addCartItem(itemsRef.current, item); setAnnouncement(result.message);
    if (!result.added) return false;
    commit(result.items);
    trackEvent('basket_item_added',{product_id:item.product_id,kit_id:item.kit_id,variant_id:item.variant_id,quantity:item.quantity,price_minor:item.price_minor});
    if (options?.openDrawer !== false) { if (window.innerWidth < 768) setToastItem(item); else setIsCartOpen(true); }
    setCartBump(true); if (bumpTimer.current) clearTimeout(bumpTimer.current);
    bumpTimer.current = setTimeout(() => setCartBump(false), 260); return true;
  }, [commit]);
  const removeItem = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id); commit(itemsRef.current.filter(i => i.id !== id));
    if(item)trackEvent('basket_item_removed',{product_id:item.product_id,kit_id:item.kit_id,variant_id:item.variant_id});
    setAnnouncement(item ? 'Removed ' + item.name + ' from your basket.' : 'Basket updated.');
  }, [commit]);
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity)) return;
    if (quantity <= 0) { removeItem(id); return; }
    const item = itemsRef.current.find(i => i.id === id); if (!item) return;
    const max = Math.min(99, item.max_quantity ?? 0);
    if (max === 0) { setAnnouncement('This pack is no longer available. Please remove it or choose another size.'); return; }
    const capped = Math.min(quantity, max); commit(itemsRef.current.map(i => i.id === id ? { ...i, quantity: capped } : i));
    trackEvent('basket_quantity_changed',{product_id:item.product_id,kit_id:item.kit_id,variant_id:item.variant_id,quantity:capped});
    setAnnouncement(capped < quantity ? 'Stock limit reached for ' + item.name + '.' : 'Quantity updated to ' + capped + '.');
  }, [commit, removeItem]);
  const clearCart = useCallback(() => { setCouponCode(''); setIsSyncing(false); syncSequence.current++; commit([]); setToastItem(null); setAnnouncement('Basket cleared.'); }, [commit]);
  const completeOrder = useCallback((ordered: CheckoutLine[]) => { setCouponCode(''); setIsSyncing(false); syncSequence.current++; commit(removeOrderedItems(itemsRef.current, ordered)); setToastItem(null); setAnnouncement('Ordered items removed from your basket.'); }, [commit]);
  const subtotalMinor = items.reduce((sum, i) => sum + i.price_minor * i.quantity, 0);
  const shippingFeeMinor = settings ? subtotalMinor >= settings.free_delivery_threshold_minor ? 0 : settings.delivery_fee_minor : null;
  return <CartContext.Provider value={{ couponCode, setCouponCode, items, addItem, removeItem, updateQuantity, clearCart, completeOrder, subtotalMinor, itemCount: items.reduce((sum, i) => sum + i.quantity, 0), isCartOpen, setIsCartOpen, freeShippingThreshold: settings?.free_delivery_threshold_minor ?? 0, shippingFeeMinor, isLoaded, isSyncing, syncError, cartBump, toastItem, dismissToast, announcement, settings, settingsError, refreshSettings, syncLivePrices }}>
    {children}<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
  </CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used within CartProvider'); return value; }
