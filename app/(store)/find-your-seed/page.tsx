import {getContentDocument} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
import {notFound} from 'next/navigation';
import { getProducts } from '@/lib/services/products';
import { getKits } from '@/lib/services/kits';
import { RoutineFinder } from '@/components/storefront/RoutineFinder';
export default async function FindYourSeedPage() {const site=await getContentDocument<SiteContent>('site');if(!site.features.routine)notFound(); const [products,kits]=await Promise.all([getProducts(),getKits()]);return <RoutineFinder catalog={[...products,...kits]}/>; }
