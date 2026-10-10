'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/store/wishlist';
import { ProductCard } from '@/components/product/ProductCard';
import type { CatalogItem } from '@/lib/catalog';
export default function WishlistPage() {
  const cms = useSiteContent<CmsPageContent>('wishlist'); const { copy, links, images } = cms;

  const {wishlistIds}=useWishlist();const [products,setProducts]=useState<CatalogItem[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [retry,setRetry]=useState(0);
  useEffect(()=>{const controller=new AbortController();setError('');if(!wishlistIds.length){setProducts([]);setLoading(false);return;}setLoading(true);fetch('/api/products?ids='+encodeURIComponent(wishlistIds.join(',')),{signal:controller.signal}).then(async response=>{const result=await response.json();if(!response.ok||!result.success||!Array.isArray(result.data))throw new Error();if(!controller.signal.aborted)setProducts(result.data);}).catch(()=>{if(!controller.signal.aborted)setError('We couldn’t load your saved products. Your saved list is still on this device.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[wishlistIds,retry]);
  return <div className="store-container py-12 sm:py-20"><h1 className="text-3xl sm:text-4xl">{copy.text_saved_products}</h1><p className="text-muted-gray mt-3 mb-10">{copy.text_your_favourites_are_saved_on_this_device_clearing_brows}</p>{loading ? <p role="status">{copy.text_loading_your_saved_products}</p> : error ? <div role="alert"><p>{error}</p><button className="button-secondary mt-5" type="button" onClick={()=>setRetry(old=>old+1)}>{copy.text_try_again}</button></div> : products.length ? <><div className="product-grid">{products.map(product=><ProductCard product={product} key={product.id}/>)}</div>{products.length<wishlistIds.length && <p className="mt-6 text-muted-gray text-sm">{copy.text_some_saved_products_are_no_longer_listed_in_the_shop}</p>}</> : <div className="py-12 text-center"><h2 className="text-2xl mb-3">{wishlistIds.length?'These products are no longer available':'Your saved list is empty'}</h2><p className="text-muted-gray">{copy.text_tap_a_product_s_heart_to_save_it_for_later}</p><Link href={links.href_shop} className="button-primary mt-6">{copy.text_explore_the_pantry}</Link></div>}</div>;
}
