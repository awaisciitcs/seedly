import { getContentDocument } from '@/lib/services/content';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React, { Suspense } from 'react';
import { ShopCatalogClient } from '@/components/storefront/ShopCatalogClient';
import { getProducts } from '../../../lib/services/products';
import { SeedsCategoryClient } from '../../../components/product/SeedsCategoryClient';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('seeds');
}

export default async function SeedsPage() {
  const cms = await getContentDocument<CmsPageContent>('seeds'); const { copy, links, images } = cms;

  const seeds = await getProducts({ productType: 'seed' });

  return (
    <Suspense fallback={<div className="store-container py-20">{copy.text_loading_products}</div>}><ShopCatalogClient initialItems={seeds} lockedCategory="seeds" title={copy.title_raw_pantry_seeds} description={copy.description_pumpkin_flax_sunflower_and_sesame_for_breakfast_baking} /></Suspense>
  );
}
