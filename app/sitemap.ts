import type {MetadataRoute} from 'next';
import {getSiteContent} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
import {getProducts} from '@/lib/services/products';
import {getKits} from '@/lib/services/kits';
export const dynamic='force-dynamic';
const privateRoute=/^\/(?:admin|account|wishlist|cart|checkout|order|api)(?:\/|$)/;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const [snapshot,products,kits]=await Promise.all([getSiteContent(),getProducts(),getKits()]);
 const site=snapshot.documents.site.content as unknown as SiteContent;
 const pages=Object.values(snapshot.documents).filter(document=>document.kind==='page'&&document.route&&!privateRoute.test(document.route)&&(site.features.routine||document.route!=='/find-your-seed')).map(document=>({url:new URL(document.route!,site.config.url).href,lastModified:document.updated_at,changeFrequency:'weekly' as const,priority:document.route==='/'?1:0.7}));
 const catalog=products.map(product=>({url:new URL('/'+(product.product_type==='tea'?'teas':'seeds')+'/'+product.slug,site.config.url).href,...(product.updated_at?{lastModified:product.updated_at}:{}),changeFrequency:'weekly' as const,priority:0.9}));
 const bundles=kits.map(kit=>({url:new URL('/kits/'+kit.slug,site.config.url).href,...(kit.updated_at?{lastModified:kit.updated_at}:{}),changeFrequency:'weekly' as const,priority:0.9}));
 return [...pages,...catalog,...bundles];
}
