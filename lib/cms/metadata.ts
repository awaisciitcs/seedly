import 'server-only';
import type { Metadata } from 'next';
import { getContentDocument } from '@/lib/services/content';
import type { CmsPageContent, SiteContent } from './storefront-types';
export async function getContentMetadata(slug:string):Promise<Metadata> {
 const [content,site]=await Promise.all([getContentDocument<Pick<CmsPageContent,'seo'>>(slug),getContentDocument<SiteContent>('site')]);
 const privatePage=['cart','checkout','account','wishlist','order'].includes(slug);
 const route=slug==='home'?'':slug==='routine'?'find-your-seed':slug==='wishlist'?'account/wishlist':slug;
 const title=content.seo.title.toLowerCase().includes(site.config.name.toLowerCase())?content.seo.title:content.seo.title+' | '+site.config.name;
 return {title,description:content.seo.description,alternates:{canonical:new URL('/'+route,site.config.url).href},openGraph:{title,description:content.seo.description,url:new URL('/'+route,site.config.url).href,siteName:site.config.name,type:'website'},...(privatePage?{robots:{index:false,follow:false}}:{})};
}
