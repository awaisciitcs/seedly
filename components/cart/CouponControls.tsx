'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import type { CheckoutQuote } from '@/lib/types';
import { formatPKR } from '@/lib/utils';

export function CouponControls({ quote, disabled = false, customerEmail = '' }: { quote: CheckoutQuote | null; disabled?: boolean; customerEmail?: string }) {
  const { items, couponCode, setCouponCode } = useCart();
  const [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const id = useId(), request = useRef<AbortController | null>(null);
  const basketKey = JSON.stringify(items.map(i => [i.product_id,i.variant_id,i.kit_id,i.quantity]));
  useEffect(() => { request.current?.abort(); setBusy(false); setError(''); }, [basketKey, customerEmail, disabled]);
  useEffect(() => () => request.current?.abort(), []);
  const apply = async () => {
    if (busy || disabled) return;
    const code = draft.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) { setError('Enter a valid discount code.'); return; }
    const controller = new AbortController(); request.current?.abort(); request.current = controller;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]), body: JSON.stringify({ coupon_code: code, customer_email: customerEmail.trim().toLowerCase(), items: items.map(({product_id,variant_id,kit_id,quantity}) => ({product_id,variant_id,kit_id,quantity})) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || 'This code could not be applied.');
      if (!controller.signal.aborted) { setCouponCode(code); setDraft(''); }
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Please retry.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  return <div className="coupon-control">
    {couponCode ? <div className="coupon-applied"><Tag size={17} aria-hidden="true" /><div className="min-w-0 flex-1"><span className="block break-all text-sm font-semibold">{couponCode}</span><span role="status" className="mt-0.5 block text-xs text-muted-gray">{quote?.coupon_code === couponCode ? formatPKR(quote.discount_minor || 0) + ' saved on your items' : 'Refreshing discount eligibility…'}</span></div>{quote?.coupon_code === couponCode && <Check size={16} aria-hidden="true" />}<button type="button" className="icon-button shrink-0" disabled={disabled} aria-label="Remove discount code" onClick={() => { setCouponCode(''); setError(''); }}><X size={16} /></button></div> : <>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium" htmlFor={id}><Tag size={16} aria-hidden="true" />Discount code</label>
      <div className="flex gap-2"><input id={id} className="form-input min-w-0 flex-1" value={draft} maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Enter your code" disabled={disabled || busy} aria-invalid={!!error} aria-describedby={error ? id + '-error' : undefined} onChange={event => { setDraft(event.target.value); setError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void apply(); } }} /><button type="button" className="coupon-apply" disabled={disabled || busy || !draft.trim()} onClick={() => void apply()}>{busy ? <><Loader2 className="animate-spin" size={16} /><span className="sr-only">Applying code</span></> : 'Apply'}</button></div>
    </>}
    {error && <p id={id + '-error'} role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
  </div>;
}
