import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKitBySlug, getKits } from '../../../../lib/services/kits';
import { KitDetailView } from '../../../../components/product/KitDetailView';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const kit = getKitBySlug(slug);
  if (!kit) {
    return {
      title: 'Kit Not Found | Seedly',
    };
  }
  return {
    title: `${kit.name} | 28-Day Seed Routine | Seedly Pakistan`,
    description: kit.short_description || kit.description,
    openGraph: {
      title: `${kit.name} | Seedly Pakistan`,
      description: kit.short_description || kit.description,
      images: kit.image_url ? [kit.image_url] : [],
    },
  };
}

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
