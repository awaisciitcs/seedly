import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Seed Cycling & Delivery | Seedly',
  description:
    'Clear answers on seed cycling routines, grinding recommendations, delivery timelines across Pakistan, and storage best practices.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
