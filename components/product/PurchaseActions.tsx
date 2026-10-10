'use client';
import {ArrowRight,Heart,Minus,Plus,Check,ShoppingBag} from 'lucide-react';
import {useSiteContent} from '@/components/storefront/SiteContentProvider';
import type {SiteContent} from '@/lib/cms/storefront-types';
interface Props {quantity:number;maxQuantity:number;added?:boolean;wishlisted:boolean;onQuantityChange:(n:number)=>void;onAdd:()=>void;onBuy:()=>void;onWishlist:()=>void}
export function PurchaseActions({quantity,maxQuantity,added,wishlisted,onQuantityChange,onAdd,onBuy,onWishlist}:Props){
 const {features}=useSiteContent<SiteContent>('site');
 const max=Math.min(99,maxQuantity);
 return <div className="space-y-3"><div className={features.savedProducts?"grid grid-cols-[1fr_48px] sm:grid-cols-[auto_1fr_48px] gap-3":"grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3"}>
 <div className={"flex items-center border border-border-gray rounded-xl h-12 sm:col-span-1 w-fit "+(features.savedProducts?"col-span-2":"")} role="group" aria-label="Quantity"><button type="button" className="icon-button" aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>onQuantityChange(Math.max(1,quantity-1))}><Minus size={17}/></button><span className="w-8 text-center tabular-nums" aria-live="polite">{quantity}</span><button type="button" className="icon-button" aria-label="Increase quantity" disabled={quantity>=max} onClick={()=>onQuantityChange(Math.min(max,quantity+1))}><Plus size={17}/></button></div>
 <button className="button-primary flex-1 min-w-[140px] h-12" type="button" onClick={onAdd} disabled={max<=0||added}>{added?<Check size={18} className="motion-pop"/>:<ShoppingBag size={18}/>}<span>{added?'Added to basket':'Add to basket'}</span></button>
 {features.savedProducts&&<button type="button" className="icon-button border border-border-gray h-12 w-12" aria-label={wishlisted?'Remove from saved products':'Save product'} aria-pressed={wishlisted} onClick={onWishlist}><Heart size={20} className={wishlisted?'fill-seedly-dark text-seedly-dark motion-pop':''}/></button>}
 </div><button type="button" className="button-secondary w-full h-12" disabled={max<=0} onClick={onBuy}>Buy now<ArrowRight size={17}/></button></div>;
}
export default PurchaseActions;
