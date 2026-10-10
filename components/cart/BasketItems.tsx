'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import type { CartItem, CheckoutQuote } from '@/lib/types';
import { formatPKR } from '@/lib/utils';

export function BasketItems({ quote, onRemove, onNavigate, layout = 'compact' }: { quote?: CheckoutQuote | null; onRemove: (item: CartItem) => void; onNavigate?: () => void; layout?: 'compact' | 'page' }) {
  const { items, updateQuantity } = useCart();
  const expanded = layout === 'page';
  return <ul className="divide-y divide-border-gray">{items.map(item => {
    const href = '/' + (item.product_type === 'kit' ? 'kits' : item.product_type === 'tea' ? 'teas' : 'seeds') + '/' + item.slug;
    const live = quote?.items.find(line => line.product_id === item.product_id && line.variant_id === item.variant_id && line.kit_id === item.kit_id);
    const unavailable = item.max_quantity === 0;
    const unitPrice = live?.unit_price_minor ?? item.price_minor;
    return <li key={item.id} className={expanded ? 'basket-page-row' : 'flex gap-4 py-5'}>
      <Link href={href} onClick={onNavigate} className={'relative shrink-0 overflow-hidden rounded-xl bg-stone-100 ' + (expanded ? 'basket-page-image' : 'h-20 w-20 sm:h-24 sm:w-24')}><Image src={item.image_url} alt={item.name} fill sizes={expanded ? '112px' : '96px'} className="object-cover" /></Link>
      <div className="min-w-0 flex-1">
        <Link href={href} onClick={onNavigate} className={expanded ? 'text-base font-medium leading-snug text-ink hover:underline sm:text-lg' : 'text-sm font-medium leading-snug text-ink hover:underline'}>{item.name}</Link>
        <p className="mt-2 text-sm text-muted-gray">{item.variant_label || 'Selected pack'}</p>
        {expanded && <p className="mt-2 text-xs text-muted-gray">{formatPKR(unitPrice)} per pack</p>}
        {!expanded && <p className="mt-2 text-sm font-semibold tabular-nums">{formatPKR(unitPrice * item.quantity)}</p>}
        {unavailable && <p className="mt-2 text-sm text-rose-700">This pack is unavailable. Remove it or choose another size.</p>}
        {live && live.unit_price_minor !== item.price_minor && <p className="mt-2 text-sm text-amber-800">Price updated from {formatPKR(item.price_minor)} to {formatPKR(live.unit_price_minor)} per pack.</p>}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div role="group" aria-label={'Quantity for ' + item.name} className="inline-flex items-center rounded-full border border-border-gray bg-white">
            <button type="button" disabled={unavailable || item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={'Decrease quantity of ' + item.name} className="icon-button disabled:opacity-30"><Minus className="h-4 w-4" /></button>
            <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
            <button type="button" disabled={unavailable || item.quantity >= Math.min(99, item.max_quantity ?? 0)} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={'Increase quantity of ' + item.name} className="icon-button disabled:opacity-30"><Plus className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={() => onRemove(item)} className={'icon-button text-muted-gray hover:text-rose-700 ' + (expanded ? 'sm:hidden' : '')} aria-label={'Remove ' + item.name}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {expanded && <div className="basket-page-total"><p className="text-base font-semibold tabular-nums">{formatPKR(unitPrice * item.quantity)}</p><button type="button" onClick={() => onRemove(item)} className="mt-2 hidden min-h-11 items-center gap-1.5 text-xs text-muted-gray underline underline-offset-4 hover:text-rose-700 sm:inline-flex" aria-label={'Remove ' + item.name}><Trash2 size={13} />Remove</button></div>}
    </li>;
  })}</ul>;
}
