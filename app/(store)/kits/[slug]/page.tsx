import {getContentDocument} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
import {getCatalogPrice,hasAvailablePack} from '@/lib/catalog';
import { serializeStructuredData } from '@/lib/structured-data';
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKitBySlug, getKits } from '../../../../lib/services/kits';
import { KitDetailView } from '../../../../components/product/KitDetailView';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const {config}=await getContentDocument<SiteContent>('site');
  const kit = await getKitBySlug(slug);
  if (!kit) {
    return {
      title: 'Kit Not Found | Seedly',
    };
  }
  return {
    title: `${kit.name} | ${config.name}`,
    description: kit.short_description || kit.description,
    alternates: {
      canonical: `${config.url}/kits/${slug}`,
    },
    openGraph: {
      title: `${kit.name} | ${config.name}`,
      description: kit.short_description || kit.description,
      images: kit.image_url ? [kit.image_url] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export const dynamicParams = true;

export default async function KitDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const {config}=await getContentDocument<SiteContent>('site');
  const kit = await getKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: config.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Cycle Kits',
            item: new URL('/kits',config.url).href,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: kit.name,
            item: `${config.url}/kits/${kit.slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: kit.name,
        image: kit.image_url.startsWith('http') ? kit.image_url : `${config.url}${kit.image_url}`,
        description: kit.short_description || kit.description,
        sku: kit.slug,
        brand: {
          '@type': 'Brand',
          name: config.name,
        },
        offers: {
          '@type': 'Offer',
          url: `${config.url}/kits/${kit.slug}`,
          priceCurrency: 'PKR',
          price: (kit.price_minor / 100).toFixed(2),
          availability:
            (kit.computed_stock ?? 0) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }}
      />
      <KitDetailView kit={kit} />
    </>
  );
}
