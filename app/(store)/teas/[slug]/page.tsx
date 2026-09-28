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

  return <ProductDetailView product={product} relatedProducts={related} />;
}
