import type {Metadata} from 'next';
import { getContentDocument } from '@/lib/services/content';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import { createPublicClient } from '@/lib/supabase/public';
import { Suspense } from 'react';
import { getProducts } from '@/lib/services/products';
import { getKits } from '@/lib/services/kits';
import { ShopCatalogClient } from '@/components/storefront/ShopCatalogClient';
export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('shop');
}
export default async function ShopPage() {
  const cms = await getContentDocument<CmsPageContent>('shop'); const { copy, links, images } = cms;
 const [products,kits,categoryResult,site] = await Promise.all([getProducts(),getKits(),createPublicClient().from('categories').select('id,name,slug').order('name'),getContentDocument<SiteContent>('site')]);
 if(categoryResult.error)throw new Error('Collections are temporarily unavailable.');
 const categories=[{slug:'all',label:site.header.shopLinks.find(link=>link.href==='/shop')?.label||copy.title},...(categoryResult.data??[]).map(category=>({id:category.id,slug:category.slug,label:category.name}))]; return <Suspense fallback={<div className="store-container py-20">{copy.text_loading_the_pantry}</div>}><ShopCatalogClient initialItems={[...products,...kits]} categories={categories} title={copy.title} description={copy.description} /></Suspense>; }
