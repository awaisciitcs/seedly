'use client';
import type { ReactNode } from 'react';
import { useSiteContent } from './SiteContentProvider';
import type { CmsPageContent } from '@/lib/cms/storefront-types';
export function ManagedSection({document,sectionId,children}:{document:string;sectionId:string;children:ReactNode}) {
  const content=useSiteContent<CmsPageContent>(document);
  if(document==='checkout')return children;
  return content.sections.some(section=>section.id===sectionId&&section.enabled)?children:null;
}
export function ManagedSections({document,sections}:{document:string;sections:Record<string,ReactNode>}) {
  const content=useSiteContent<CmsPageContent>(document);
  return <>{content.sections.filter(section=>section.enabled).map(section=><span key={section.id} style={{display:'contents'}}>{sections[section.id]}</span>)}</>;
}
