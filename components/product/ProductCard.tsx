'use client';
import {useSiteContent} from '@/components/storefront/SiteContentProvider';
import type {SiteContent} from '@/lib/cms/storefront-types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart, Check, Eye } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { formatPKR } from '@/lib/utils';
import { isKit, toCartItem, type CatalogItem } from '@/lib/catalog';
import { resolveCatalogVariant } from '@/lib/catalog-filters';
import { QuickViewModal } from './QuickViewModal';
import { DepthSurface } from '@/components/ui/DepthSurface';
import { Reveal } from '@/components/ui/Reveal';
import { NotifyMeModal } from './NotifyMeModal';
export function ProductCard({ product, selectedVariantId, buttonVariant = 'primary' }: { product: CatalogItem; selectedVariantId?: string; buttonVariant?: 'primary' | 'secondary' }) {
 const {features}=useSiteContent<SiteContent>('site');
  const { addItem } = useCart(); const { toggleWishlist,isInWishlist } = useWishlist();
  const [quick,setQuick] = useState(false); const [notify,setNotify] = useState(false); const [added,setAdded] = useState(false); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if(timer.current)clearTimeout(timer.current); },[]);
  useEffect(()=>{setAdded(false);if(timer.current)clearTimeout(timer.current);},[selectedVariantId]);
  const kit = isKit(product); const variant = kit ? undefined : resolveCatalogVariant(product,selectedVariantId);
  const href = '/' + (kit ? 'kits' : product.product_type === 'tea' ? 'teas' : 'seeds') + '/' + product.slug + (!kit && selectedVariantId && variant ? '?variant=' + encodeURIComponent(variant.id) : '');
  const available = (kit ? product.computed_stock : variant?.inventory_quantity || 0) > 0; const saved = isInWishlist(product.id);
  const add = () => { if(!available){setNotify(true);return;} if(addItem(toCartItem(product,1,variant))){setAdded(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setAdded(false),1500);} };
  return <Reveal stagger className="h-full min-w-0"><article className="product-card h-full">
    <div className="product-media relative aspect-square"><DepthSurface strength={3} className="h-full rounded-2xl bg-cream"><Link href={href} className="block relative h-full w-full"><Image src={product.image_url} alt={product.name} fill sizes="(max-width:639px) 46vw, (max-width:1023px) 30vw, 23vw" className="object-cover product-image" /></Link></DepthSurface>
      {features.savedProducts && <button type="button" onClick={() => toggleWishlist(product.id)} className="icon-button absolute right-2 top-2 bg-white/95" aria-pressed={saved} aria-label={(saved ? 'Remove ' : 'Save ') + product.name}><Heart size={19} className={saved ? 'fill-seedly-dark text-seedly-dark motion-pop' : ''} /></button>}
      <button type="button" className="quick-view icon-button absolute bottom-2 right-2 bg-white/95" onClick={() => setQuick(true)} aria-label={'Quick view ' + product.name}><Eye size={19} /></button>
      {!available && <span className="absolute left-3 bottom-3 text-xs bg-white px-3 py-1.5 rounded-full">Selected pack sold out</span>}
    </div>
    <div className="pt-4 flex flex-1 flex-col"><Link className="hover:underline" href={href}><h3 className="text-base font-medium leading-snug line-clamp-2 min-h-[2.75rem]">{product.name}</h3></Link><p className="text-sm text-muted-gray mt-1">{kit ? product.package_size : variant?.option_value || (product.weight_grams ? product.weight_grams + 'g' : 'View packs')}</p>
      <div className="mt-auto pt-2">
        <p className="font-semibold tabular-nums">{formatPKR(variant?.price_minor ?? product.price_minor)}</p>
        <button type="button" className={(buttonVariant === 'secondary' ? 'button-secondary' : 'button-primary') + ' w-full mt-4 text-sm'} onClick={add}>{added ? <><Check size={16} className="motion-pop" />Added</> : available ? 'Add to basket' : 'Notify me'}</button>
      </div>
    </div>
    <QuickViewModal isOpen={quick} onClose={()=>setQuick(false)} product={product} initialVariantId={variant?.id} /><NotifyMeModal isOpen={notify} onClose={()=>setNotify(false)} itemTitle={product.name} productId={kit ? undefined : product.id} variantId={variant?.id} kitId={kit ? product.id : undefined} />
  </article></Reveal>;
}
export default ProductCard;
