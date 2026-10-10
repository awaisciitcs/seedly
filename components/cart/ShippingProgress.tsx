'use client';
import { useCart } from '@/lib/store/cart';
import { formatPKR } from '@/lib/utils';
import { Check, Truck } from 'lucide-react';
export function ShippingProgress({ quotedSubtotal }: { quotedSubtotal?: number } = {}) {
  const { subtotalMinor, settings, settingsError, refreshSettings } = useCart();
  if (!settings) return <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">{settingsError ? <><span>{settingsError}</span><button type="button" onClick={() => void refreshSettings()} className="ml-2 font-medium text-ink underline">Retry</button></> : 'Checking delivery options…'}</div>;
  const amount = quotedSubtotal ?? subtotalMinor;
  const remaining = Math.max(0, settings.free_delivery_threshold_minor - amount);
  const percent = Math.min(100, amount / settings.free_delivery_threshold_minor * 100);
  return <div className="rounded-xl bg-stone-50 p-4">
    <p className="flex items-center gap-2 text-sm text-stone-700">{remaining ? <><Truck className="h-4 w-4 shrink-0" aria-hidden="true"/><span>Add <strong className="font-semibold text-ink">{formatPKR(remaining)}</strong> for free delivery.</span></> : <><Check className="h-4 w-4 text-emerald-700" aria-hidden="true"/><span className="font-medium text-emerald-800">Your basket qualifies for free delivery.</span></>}</p>
    {remaining > 0 && <div className="mt-3 h-1 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-label="Progress towards free delivery" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><div className="h-full origin-left bg-ink transition-transform duration-200 motion-reduce:transition-none" style={{transform:'scaleX('+percent/100+')'}}/></div>}
  </div>;
}
