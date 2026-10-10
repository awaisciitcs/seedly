import {getContentDocument} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
import {notFound} from 'next/navigation';
import type { ReactNode } from 'react';
import {getContentMetadata} from '@/lib/cms/metadata';
export async function generateMetadata(){return getContentMetadata('wishlist');}
export default async function PageLayout({children}:{children:ReactNode}){const site=await getContentDocument<SiteContent>('site');if(!site.features.savedProducts)notFound();return children;}
