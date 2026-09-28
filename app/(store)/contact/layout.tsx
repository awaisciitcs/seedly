import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Care & WhatsApp Helpline | Seedly Pakistan',
  description:
    'Have questions about seed cycling, brewing temperatures, or your order? Connect directly with our Lahore care team via WhatsApp or email.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
