import {getContentDocument} from '@/lib/services/content';
import type {SiteContent} from '@/lib/cms/storefront-types';
import {getCatalogPrice,hasAvailablePack} from '@/lib/catalog';
import { serializeStructuredData } from '@/lib/structured-data';
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '../../../../lib/services/products';
import { ProductDetailView } from '../../../../components/product/ProductDetailView';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const {config}=await getContentDocument<SiteContent>('site');
  const product = await getProductBySlug(slug);
  if (!product || product.product_type !== 'tea') {
    return {
      title: 'Product Not Found | Seedly',
    };
  }
  return {
    title: `${product.name} | ${config.name}`,
    description: product.short_description || product.description,
    alternates: {
      canonical: `${config.url}/teas/${slug}`,
    },
    openGraph: {
      title: `${product.name} | ${config.name}`,
      description: product.short_description || product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export const dynamicParams = true;

export default async function TeaDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const {config}=await getContentDocument<SiteContent>('site');
  const product = await getProductBySlug(slug);

  if (!product || product.product_type !== 'tea') {
    notFound();
  }

  const relatedTeas = (await getProducts({ productType: 'tea', limit: 4 })).filter(
    (p) => p.id !== product.id
  );
  let related = [...relatedTeas];
  if (related.length < 3) {
    const seeds = await getProducts({ productType: 'seed', limit: 3 - related.length });
    related.push(...seeds);
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
            name: 'Mountain Teas',
            item: new URL('/teas',config.url).href,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `${config.url}/teas/${product.slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: product.name,
        image: product.image_url.startsWith('http') ? product.image_url : `${config.url}${product.image_url}`,
        description: product.short_description || product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: config.name,
        },
        offers: {
          '@type': 'Offer',
          url: `${config.url}/teas/${product.slug}`,
          priceCurrency: 'PKR',
          price: (getCatalogPrice(product) / 100).toFixed(2),
          availability:
            hasAvailablePack(product)
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
      <ProductDetailView product={product} relatedProducts={related} />
    </>
  );
}
