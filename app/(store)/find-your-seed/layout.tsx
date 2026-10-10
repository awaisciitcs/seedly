import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Your Daily Routine — Seed & Tea Recommendation | Seedly Pakistan',
  description:
    'Answer 3 quick questions to discover the ideal raw pantry seed routine or loose-leaf mountain tea tailored to your everyday culinary habits.',
  openGraph: {
    title: 'Find Your Daily Routine | Seedly Pakistan',
    description: '3 quick questions to match our edible kitchen seeds or loose mountain teas to your everyday habits.',
    images: ['/images/hero/hero-lifestyle.jpg'],
  },
};

export default function FindYourSeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
