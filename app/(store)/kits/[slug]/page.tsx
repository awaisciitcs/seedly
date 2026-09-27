import React from 'react';
import { notFound } from 'next/navigation';
import { getKitBySlug } from '../../../../lib/services/kits';
import { KitDetailView } from '../../../../components/product/KitDetailView';

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
