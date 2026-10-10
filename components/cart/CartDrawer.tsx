'use client';
import {useSiteContent} from '@/components/storefront/SiteContentProvider';
import type {CmsPageContent} from '@/lib/cms/storefront-types';
import { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, ShoppingBag, RotateCcw } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartQuote } from '@/hooks/useCartQuote';
import { formatPKR } from '@/lib/utils';
import type { CartItem } from '@/lib/types';
import { Dialog } from '@/components/ui/Dialog';
import { BasketItems } from './BasketItems';
import { ShippingProgress } from './ShippingProgress';
export function CartDrawer() {
 const {copy,links}=useSiteContent<CmsPageContent>('cart'); const checkoutCopy=useSiteContent<CmsPageContent>('checkout').copy;
  const { items, itemCount, subtotalMinor, shippingFeeMinor, addItem, removeItem, isCartOpen, setIsCartOpen, isLoaded, syncError, syncLivePrices, announcement } = useCart();
  const { quote, error, refresh } = useCartQuote(isCartOpen);
  const [removed, setRemoved] = useState<CartItem | null>(null);
  const close = () => setIsCartOpen(false);
  const subtotal = quote?.subtotal_minor ?? subtotalMinor;
  const delivery = quote?.shipping_minor ?? shippingFeeMinor;
  const total = quote?.total_minor ?? subtotal + (delivery ?? 0);
  const unavailable = items.some(item => item.max_quantity === 0);
  return <Dialog open={isCartOpen} onClose={close} title={copy.text_your_basket} className="basket-dialog">
    <div className="flex h-full max-h-dvh flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-3 text-xl font-medium"><ShoppingBag className="h-5 w-5" aria-hidden="true"/>{copy.text_your_basket} <span className="text-sm text-stone-600">({itemCount})</span></h2>
        <button type="button" onClick={close} className="icon-button" aria-label="Close basket"><X className="h-5 w-5"/></button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {syncError && <p className="mb-4 text-sm text-rose-700" role="alert">{syncError} <button type="button" onClick={() => void syncLivePrices()} className="underline">{copy.text_retry}</button></p>}
        {announcement && items.length > 0 && <p className="mb-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">{announcement}</p>}
          {removed && <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 text-sm"><span className="min-w-0 truncate">{copy.text_removed}{removed.name}</span><button type="button" className="inline-flex min-h-11 items-center gap-1 font-medium underline" onClick={() => { if(addItem(removed,{openDrawer:false})) setRemoved(null); }}><RotateCcw className="h-4 w-4"/>{copy.text_undo}</button></div>}
        {items.length ? <>
          <ShippingProgress quotedSubtotal={quote?.subtotal_minor}/>

          <BasketItems quote={quote} onNavigate={close} onRemove={item => { setRemoved(item); removeItem(item.id); }}/>
        </> : isLoaded && <div className="py-16 text-center"><ShoppingBag className="mx-auto mb-5 h-10 w-10 text-stone-400"/><h3 className="text-2xl font-medium">{checkoutCopy.text_your_basket_is_empty}</h3><p className="mt-3 text-base text-stone-600">{copy.text_a_few_good_ingredients_a_little_care_for_your_everyday}</p><Link href="/shop" onClick={close} className="button-primary mt-6">{copy.text_explore_the_pantry}<ArrowRight className="h-4 w-4"/></Link></div>}
      </div>
      {items.length > 0 && <div className="shrink-0 space-y-4 border-t border-stone-200 bg-white px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6">
        {error && <p className="text-sm text-rose-700" role="alert">{error} <button type="button" className="underline" onClick={() => void refresh()}>{copy.text_retry}</button></p>}
        <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>{copy.text_subtotal}</dt><dd>{formatPKR(subtotal)}</dd></div><div className="flex justify-between text-stone-600"><dt>{copy.text_delivery}</dt><dd>{delivery === null ? 'At checkout' : delivery ? formatPKR(delivery) : 'Free'}</dd></div><div className="flex justify-between pt-2 text-lg font-semibold"><dt>{delivery === null ? 'Items total' : 'Total'}</dt><dd>{formatPKR(total)}</dd></div></dl>
        {!unavailable ? <Link href="/checkout" onClick={close} className="button-primary w-full">{copy.text_continue_to_checkout}<ArrowRight className="h-4 w-4"/></Link> : <button type="button" disabled className="button-primary w-full opacity-50">{copy.text_remove_unavailable_packs_to_continue}</button>}
        <p className="text-center text-xs text-muted-gray">{copy.text_prices_and_availability_are_confirmed_at_checkout}</p>
        <div className="flex items-center justify-between text-sm"><Link href="/cart" onClick={close} className="min-h-11 content-center underline underline-offset-4">{copy.text_your_basket}</Link><button type="button" onClick={close} className="min-h-11 text-stone-600">{copy.text_continue_shopping}</button></div>
      </div>}
    </div>
  </Dialog>;
}
export default CartDrawer;
