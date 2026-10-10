'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartQuote } from '@/hooks/useCartQuote';
import { BasketItems } from '@/components/cart/BasketItems';
import { ShippingProgress } from '@/components/cart/ShippingProgress';
import { formatPKR } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

export default function CartPage() {
  const cms = useSiteContent<CmsPageContent>('cart'); const { copy, links, images } = cms;

  const { items, itemCount, subtotalMinor, shippingFeeMinor, addItem, removeItem, isLoaded, syncError, syncLivePrices, announcement } = useCart();
  const { quote, error, refresh } = useCartQuote();
  const [removed, setRemoved] = useState<CartItem | null>(null);
  useEffect(() => { void syncLivePrices(); }, [syncLivePrices]);
  const subtotal = quote?.subtotal_minor ?? subtotalMinor;
  const delivery = quote?.shipping_minor ?? shippingFeeMinor;
  const total = quote?.total_minor ?? subtotal + (delivery ?? 0);
  const unavailable = items.some(item => item.max_quantity === 0);
  return <div className="basket-page-shell">
    <div className="store-container py-8 sm:py-12 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={links.href_shop} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-gray hover:text-ink"><ArrowLeft size={16} />{copy.text_continue_shopping}</Link>
        <ol className="hidden items-center gap-3 text-xs sm:flex" aria-label="Order progress"><li aria-current="step" className="font-medium text-seedly-dark"><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-seedly-dark text-white">1</span>{copy.text_basket}</li><li aria-hidden="true" className="h-px w-6 bg-border-gray" /><li className="text-muted-gray"><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-gray">2</span>{copy.text_checkout}</li></ol>
      </div>
      <header className="mb-8 mt-5 sm:mb-10"><p className="eyebrow">{copy.text_your_pantry_coming_together}</p><div className="mt-3 flex flex-wrap items-baseline gap-4"><h1 className="text-4xl tracking-tight sm:text-5xl">{copy.text_your_basket}</h1>{isLoaded && <span className="text-sm text-muted-gray">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>}</div><p className="mt-4 max-w-xl text-muted-gray">{copy.text_a_few_good_ingredients_a_little_care_for_your_everyday}</p></header>
      {removed && <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border-gray bg-white px-4 py-2 text-sm"><p className="min-w-0 truncate">{copy.text_removed}{removed.name}</p><button type="button" className="inline-flex min-h-11 shrink-0 items-center gap-2 font-medium underline underline-offset-4" onClick={() => { if (addItem(removed, { openDrawer: false })) setRemoved(null); }}><RotateCcw size={15} />{copy.text_undo}</button></div>}
      {!isLoaded ? <div className="grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]" role="status" aria-label="Loading basket"><div className="h-64 rounded-2xl border border-border-gray bg-white" /><div className="h-72 rounded-2xl border border-border-gray bg-white" /><span className="sr-only">{copy.text_loading_your_basket}</span></div> : !items.length ? <ManagedSection document="cart" sectionId="page_section_01"><section className="mx-auto max-w-2xl rounded-3xl border border-border-gray bg-white px-6 py-12 text-center sm:py-16"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-seedly-light"><ShoppingBag size={32} strokeWidth={1.5} /></span><h2 className="mt-6 text-3xl">{copy.text_good_things_start_here}</h2><p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-gray">{copy.text_your_basket_is_ready_for_its_first_favourite_discover_w}</p><Link href={links.href_shop} className="button-primary mt-7">{copy.text_explore_the_pantry}<ArrowRight size={17} /></Link><div className="mt-7 flex flex-wrap justify-center gap-5 text-sm"><Link className="text-link" href={links.href_seeds}>{copy.text_raw_seeds}</Link><Link className="text-link" href={links.href_teas}>{copy.text_loose_teas}</Link><Link className="text-link" href={links.href_kits}>{copy.text_seed_kits}</Link></div></section></ManagedSection> :
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] lg:gap-9">
        <div className="min-w-0 space-y-5">
          <div className="basket-selection"><div className="flex items-center justify-between border-b border-border-gray px-5 py-5 sm:px-7"><h2 className="text-xl">{copy.text_your_selection}</h2><span className="text-xs text-muted-gray">{items.length} {items.length === 1 ? 'pack choice' : 'pack choices'}</span></div><div className="px-5 sm:px-7"><BasketItems layout="page" quote={quote} onRemove={item => { setRemoved(item); removeItem(item.id); }} /></div></div>
          {announcement && <p className="px-1 text-sm text-muted-gray">{announcement}</p>}
          <div className="rounded-2xl border border-border-gray bg-white p-5 sm:p-6"><ShippingProgress quotedSubtotal={subtotal} /></div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-gray bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><MessageCircle size={20} strokeWidth={1.5} /><div><p className="text-sm font-medium">{copy.text_a_question_about_your_basket}</p><p className="mt-1 text-xs text-muted-gray">{copy.text_we_can_help_with_ingredients_sizes_and_delivery}</p></div></div><Link href={links.href_contact} className="text-link min-h-11 content-center text-sm">{copy.text_talk_to_seedly}<ArrowRight size={14} className="ml-2 inline" /></Link></div>
        </div>
        <aside aria-label="Basket total" className="basket-summary lg:sticky lg:top-28">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-seedly-light"><ShoppingBag size={18} /></span><h2 className="text-2xl">{copy.text_order_summary}</h2></div>
          {syncError && <p role="alert" className="mt-5 text-sm text-rose-700">{syncError} <button type="button" className="underline" onClick={() => void syncLivePrices()}>{copy.text_retry}</button></p>}
          {error && <p role="alert" className="mt-5 text-sm text-rose-700">{error} <button type="button" className="underline" onClick={() => void refresh()}>{copy.text_refresh_total}</button></p>}
          <dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-gray">{copy.text_subtotal}</dt><dd className="tabular-nums">{formatPKR(subtotal)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-gray">{copy.text_delivery}</dt><dd>{delivery === null ? 'Calculated at checkout' : delivery ? formatPKR(delivery) : <span className="font-medium text-seedly-primary">{copy.text_free}</span>}</dd></div><div className="flex items-baseline justify-between gap-3 border-t border-border-gray pt-5"><dt className="text-lg">{delivery === null ? 'Items total' : 'Total'}</dt><dd className="text-2xl font-semibold tabular-nums">{formatPKR(total)}</dd></div></dl>
          {unavailable ? <><p role="alert" className="mt-5 text-sm text-rose-700">{copy.text_remove_unavailable_packs_to_continue}</p><button type="button" disabled className="button-primary mt-5 w-full">{copy.text_continue_to_checkout}<ArrowRight size={17} /></button></> : <Link href={links.href_checkout} className="button-primary mt-6 w-full">{copy.text_continue_to_checkout}<ArrowRight size={17} /></Link>}
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-gray">{copy.text_prices_and_availability_are_confirmed_at_checkout}</p>
          <div className="mt-6 space-y-3 border-t border-border-gray pt-5"><p className="flex items-center gap-2 text-sm"><Check size={15} className="text-seedly-primary" />{copy.text_guest_checkout_no_account_needed}</p><p className="flex items-center gap-2 text-sm"><Truck size={15} className="text-seedly-primary" />{copy.text_delivery_across_pakistan}</p></div>
          <p className="mt-5 text-xs leading-relaxed text-muted-gray">{copy.text_choose_your_payment_method_at_checkout_transfer_payment}</p>
          <Link href={links.href_shipping} className="mt-3 inline-flex min-h-11 items-center text-xs underline underline-offset-4">{copy.text_delivery_returns_information}</Link>
        </aside>
      </div>}
    </div>
  </div>;
}
