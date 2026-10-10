import type {MetadataRoute} from 'next';
import {getContentDocument} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
export const dynamic='force-dynamic';
export default async function robots():Promise<MetadataRoute.Robots>{
 const site=await getContentDocument<SiteContent>('site');
 return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/admin/*','/account','/account/*','/wishlist','/cart','/checkout','/order','/order/*','/api/*']},sitemap:new URL('/sitemap.xml',site.config.url).href};
}
