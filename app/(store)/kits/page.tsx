import { getContentDocument } from '@/lib/services/content';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React, { Suspense } from 'react';
import { ShopCatalogClient } from '@/components/storefront/ShopCatalogClient';
import { getKits } from '../../../lib/services/kits';
import { KitsCategoryClient } from '../../../components/product/KitsCategoryClient';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('kits');
}

export default async function KitsPage() {
  const cms = await getContentDocument<CmsPageContent>('kits'); const { copy, links, images } = cms;

  const kits = await getKits();

  return (
    <Suspense fallback={<div className="store-container py-20">{copy.text_loading_products}</div>}><ShopCatalogClient initialItems={kits} lockedCategory="kits" title={copy.title_seed_kits} description={copy.description_compare_seed_pairings_pack_contents_and_current_prices} /></Suspense>
  );
}
