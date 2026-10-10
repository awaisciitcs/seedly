import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Basket | Seedly Pakistan',
  description: 'Review your selected pantry seeds, mountain teas, and phase routine kits.',
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
