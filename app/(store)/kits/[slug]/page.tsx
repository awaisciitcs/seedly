import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKitBySlug, getKits } from '../../../../lib/services/kits';
import { KitDetailView } from '../../../../components/product/KitDetailView';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const kit = await getKitBySlug(slug);
  if (!kit) {
    return {
      title: 'Kit Not Found | Seedly',
    };
  }
  return {
    title: `${kit.name} | 28-Day Seed Routine | Seedly Pakistan`,
    description: kit.short_description || kit.description,
    alternates: {
      canonical: `https://seedly.pk/kits/${slug}`,
    },
    openGraph: {
      title: `${kit.name} | Seedly Pakistan`,
      description: kit.short_description || kit.description,
      images: kit.image_url ? [kit.image_url] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const kits = await getKits();
    return kits.map((kit) => ({
      slug: kit.slug,
    }));
  } catch (err) {
    console.error('generateStaticParams kits error:', err);
    return [];
  }
}

export const dynamicParams = true;

export default async function KitDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
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
            item: 'https://seedly.pk',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Cycle Kits',
            item: 'https://seedly.pk/kits',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: kit.name,
            item: `https://seedly.pk/kits/${kit.slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: kit.name,
        image: kit.image_url.startsWith('http') ? kit.image_url : `https://seedly.pk${kit.image_url}`,
        description: kit.short_description || kit.description,
        sku: kit.slug,
        brand: {
          '@type': 'Brand',
          name: 'Seedly',
        },
        offers: {
          '@type': 'Offer',
          url: `https://seedly.pk/kits/${kit.slug}`,
          priceCurrency: 'PKR',
          price: (kit.price_minor / 100).toFixed(0),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KitDetailView kit={kit} />
    </>
  );
}
