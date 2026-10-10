import { getContentDocument } from '@/lib/services/content';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React, { Suspense } from 'react';
import { ShopCatalogClient } from '@/components/storefront/ShopCatalogClient';
import { getProducts } from '../../../lib/services/products';
import { TeasCategoryClient } from '../../../components/product/TeasCategoryClient';
import type { Metadata } from 'next';

// Catalog edits must appear without waiting for a deployment or static-cache refresh.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('teas');
}

export default async function TeasPage() {
  const cms = await getContentDocument<CmsPageContent>('teas'); const { copy, links, images } = cms;

  const teas = await getProducts({ productType: 'tea' });

  return (
    <Suspense fallback={<div className="store-container py-20">{copy.text_loading_products}</div>}><ShopCatalogClient initialItems={teas} lockedCategory="teas" title={copy.title_loose_teas} description={copy.description_explore_flavours_caffeine_levels_and_brewing_instructio} /></Suspense>
  );
}
