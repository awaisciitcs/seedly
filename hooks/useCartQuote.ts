'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/store/cart';
import type { CheckoutQuote } from '@/lib/types';
import { quoteFingerprint } from '@/lib/checkout-validation';
export function useCartQuote(active = true, customerEmail = '') {
  const { items, isLoaded, isSyncing, couponCode } = useCart();
  const [quote, setQuote] = useState<CheckoutQuote | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const lines = items.map(({ product_id, variant_id, kit_id, quantity }) => ({ product_id, variant_id, kit_id, quantity }));
  const key = quoteFingerprint(lines); const linesRef = useRef(lines); linesRef.current = lines;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) ? customerEmail.trim().toLowerCase() : '';
  const couponRef = useRef(couponCode); couponRef.current = couponCode;
  const emailRef = useRef(email); emailRef.current = email;
  const refresh = useCallback(async () => {
    requestRef.current?.abort(); const controller = new AbortController(); requestRef.current = controller;
    if (!linesRef.current.length) { setQuote(null); setLoading(false); return null; }
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: linesRef.current, coupon_code: couponRef.current, ...(couponRef.current && emailRef.current ? { customer_email: emailRef.current } : {}) }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Could not update your total.');
      if (controller.signal.aborted) return null;
      setQuote(result.data); return result.data as CheckoutQuote;
    } catch (err) {
      if (!controller.signal.aborted) { setQuote(null); setError(err instanceof Error ? err.message : 'Could not update your total.'); } return null;
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    setQuote(null); requestRef.current?.abort();
    if (!active || !isLoaded || isSyncing || !lines.length) { setLoading(false); return; }
    setLoading(true); const timer = setTimeout(() => { void refresh(); }, couponCode ? 350 : 150);
    return () => { clearTimeout(timer); requestRef.current?.abort(); };
  }, [active, key, couponCode, couponCode ? email : '', isLoaded, isSyncing, refresh]);
  const currentQuote = quote && (quote.coupon_code || '') === couponCode && quoteFingerprint(quote.items.map(({product_id,variant_id,kit_id,quantity}) => ({product_id,variant_id,kit_id,quantity}))) === key ? quote : null;
  return { quote: currentQuote, loading, error, refresh };
}
