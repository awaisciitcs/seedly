import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '../../../../lib/services/products';
import { ProductDetailView } from '../../../../components/product/ProductDetailView';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Product Not Found | Seedly',
    };
  }
  return {
    title: `${product.name} | Mountain Herbal Tea | Seedly Pakistan`,
    description: product.short_description || product.description,
    alternates: {
      canonical: `https://seedly.pk/teas/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Seedly Pakistan`,
      description: product.short_description || product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const products = getProducts({ productType: 'tea' });
    return products.map((p) => ({
      slug: p.slug,
    }));
  } catch (err) {
    console.error('generateStaticParams teas error:', err);
    return [];
  }
}

export const dynamicParams = true;

export default async function TeaDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getProducts({ productType: 'tea', limit: 4 }).filter(
    (p) => p.id !== product.id
  );

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
            name: 'Mountain Teas',
            item: 'https://seedly.pk/teas',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://seedly.pk/teas/${product.slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: product.name,
        image: `https://seedly.pk${product.image_url}`,
        description: product.short_description || product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: 'Seedly',
        },
        offers: {
          '@type': 'Offer',
          url: `https://seedly.pk/teas/${product.slug}`,
          priceCurrency: 'PKR',
          price: (product.price_minor / 100).toFixed(0),
          availability:
            (product.variants?.[0]?.inventory_quantity ?? 50) > 0
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
      <ProductDetailView product={product} relatedProducts={related} />
    </>
  );
}
