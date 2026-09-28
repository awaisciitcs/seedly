import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Wellness Basket | Seedly Pakistan',
  description: 'Review your selected heirloom seeds, mountain teas, and cycle ritual kits.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
