import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Seed Cycling & Delivery | Seedly Pakistan',
  description:
    'Clear answers on seed cycling routines, grinding recommendations, delivery timelines across Pakistan, and storage best practices.',
  openGraph: {
    title: 'Frequently Asked Questions | Seedly Pakistan',
    description: 'Clear answers on seed cycling routines, delivery timelines across Pakistan, and storage best practices.',
    images: ['/images/hero/hero-lifestyle.jpg'],
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
