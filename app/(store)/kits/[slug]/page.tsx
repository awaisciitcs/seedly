import React from 'react';
import { notFound } from 'next/navigation';
import { getKitBySlug, getKits } from '../../../../lib/services/kits';
import { KitDetailView } from '../../../../components/product/KitDetailView';

export async function generateStaticParams() {
  try {
    const kits = getKits();
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
  const kit = getKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  return <KitDetailView kit={kit} />;
}
