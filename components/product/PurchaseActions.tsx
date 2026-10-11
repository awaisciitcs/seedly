'use client';
import { ArrowRight, Heart, Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
interface Props { quantity:number; maxQuantity:number; added?:boolean; wishlisted:boolean; onQuantityChange:(n:number)=>void; onAdd:()=>void; onBuy:()=>void; onWishlist:()=>void }
export function PurchaseActions({ quantity, maxQuantity, added, wishlisted, onQuantityChange, onAdd, onBuy, onWishlist }: Props) {
 const { features } = useSiteContent<SiteContent>('site');
 const max = Math.min(99, maxQuantity);
 return <div className="space-y-2.5">
  <div className="grid grid-cols-[114px_minmax(0,1fr)] items-center gap-2 sm:gap-3">
   <div className="flex h-14 items-center rounded-xl border border-border-gray bg-white" role="group" aria-label="Quantity">
    <button type="button" className="icon-button h-full rounded-none rounded-l-xl" aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>onQuantityChange(Math.max(1,quantity-1))}><Minus size={17}/></button>
    <span className="w-6 shrink-0 text-center text-sm tabular-nums" aria-live="polite">{quantity}</span>
    <button type="button" className="icon-button h-full rounded-none rounded-r-xl" aria-label="Increase quantity" disabled={quantity>=max} onClick={()=>onQuantityChange(Math.min(max,quantity+1))}><Plus size={17}/></button>
   </div>
   <button data-primary-purchase className="button-primary h-14 min-w-0 gap-2 px-3 text-sm sm:text-base" type="button" onClick={onAdd} disabled={max<=0||added}>{added?<Check size={18} className="motion-pop shrink-0"/>:<ShoppingBag size={18} className="shrink-0"/>}<span>{added?'Added to basket':'Add to basket'}</span></button>
  </div>
  <div className="flex items-center gap-2 sm:gap-3">
   <button type="button" className="button-secondary h-12 min-w-0 flex-1 px-3" disabled={max<=0} onClick={onBuy}>Buy now<ArrowRight size={17}/></button>
   {features.savedProducts&&<button type="button" className="icon-button h-12 w-12 shrink-0 border border-border-gray bg-white" aria-label={wishlisted?'Remove from saved products':'Save product'} aria-pressed={wishlisted} onClick={onWishlist}><Heart size={20} className={wishlisted?'fill-seedly-dark text-seedly-dark motion-pop':''}/></button>}
  </div>
 </div>;
}
export default PurchaseActions;
