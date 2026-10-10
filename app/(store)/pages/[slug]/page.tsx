import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getContentDocument,getSiteContent} from '@/lib/services/content';
import type {CustomPageContent,SiteContent} from '@/lib/cms/storefront-types';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const snapshot=await getSiteContent(),document=snapshot.documents[slug];
 if(!document||document.kind!=='page'||document.route!=='/pages/'+slug)return {};
 const content=document.content as unknown as CustomPageContent,site=snapshot.documents.site.content as unknown as SiteContent;
 return {title:content.seo.title,description:content.seo.description,alternates:{canonical:new URL('/pages/'+slug,site.config.url).href}};
}
export default async function CustomPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))notFound();
 const snapshot=await getSiteContent(),document=snapshot.documents[slug];
 if(!document||document.kind!=='page'||document.route!=='/pages/'+slug)notFound();
 const content=document.content as unknown as CustomPageContent;
 return <div className="store-container py-12 sm:py-20"><header className="max-w-3xl"><h1 className="hero-heading">{content.title}</h1>{content.intro&&<p className="mt-6 text-lg leading-relaxed text-muted-gray whitespace-pre-line">{content.intro}</p>}</header><div className="mt-12 max-w-4xl space-y-12">{content.sections.filter(section=>section.enabled).map(section=><section key={section.id} className="border-t border-border-gray pt-8"><h2 className="section-heading">{section.title}</h2>{section.body&&<p className="mt-5 leading-relaxed text-muted-gray whitespace-pre-line">{section.body}</p>}{section.image&&<div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl"><Image src={section.image} alt={section.title} fill sizes="(max-width:767px) 92vw, 850px" className="object-cover"/></div>}{section.href&&section.linkLabel&&<Link href={section.href} className="text-link mt-5 inline-block">{section.linkLabel}</Link>}</section>)}</div></div>;
}
