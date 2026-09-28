import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | Seedly Pakistan',
  description:
    'Complete your order with Cash on Delivery (COD), JazzCash, Easypaisa, or direct bank transfer. 256-bit SSL encrypted.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
