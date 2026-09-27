import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '../../../../lib/services/products';
import { ProductDetailView } from '../../../../components/product/ProductDetailView';

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
