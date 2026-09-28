import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Basket | Seedly Pakistan',
  description:
    'Review your selected heirloom seeds, mountain tea infusions, and 28-day routine kits before checkout.',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
