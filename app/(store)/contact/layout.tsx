import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Care & WhatsApp Helpline | Seedly Pakistan',
  description:
    'Have questions about seed cycling, brewing temperatures, or your order? Connect directly with our Lahore care team via WhatsApp or email.',
  openGraph: {
    title: 'Customer Care & WhatsApp Helpline | Seedly Pakistan',
    description: 'Connect directly with our Lahore care team via WhatsApp 0304 1117333 or email care@seedly.pk.',
    images: ['/images/hero/seedly-hero.jpg'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
