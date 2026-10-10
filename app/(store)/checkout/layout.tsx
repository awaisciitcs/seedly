import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | Seedly Pakistan',
  description: 'Complete your Seedly order with Cash on Delivery or verified Pakistani digital wallets and bank transfer.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
