import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '../../../../lib/services/products';
import { ProductDetailView } from '../../../../components/product/ProductDetailView';

export async function generateStaticParams() {
  try {
    const products = getProducts({ productType: 'seed' });
    return products.map((p) => ({
      slug: p.slug,
    }));
  } catch (err) {
    console.error('generateStaticParams seeds error:', err);
    return [];
  }
}

export const dynamicParams = true;

export default async function SeedDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getProducts({ productType: 'seed', limit: 4 }).filter(
    (p) => p.id !== product.id
  );

  return <ProductDetailView product={product} relatedProducts={related} />;
}
