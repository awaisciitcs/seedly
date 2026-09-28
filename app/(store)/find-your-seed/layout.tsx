import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Your Seed — Personalized Routine Quiz | Seedly Pakistan',
  description:
    'Answer 3 quick lifestyle questions to discover the ideal heirloom seed kit or loose-leaf herbal tea routine tailored to your body and day.',
};

export default function FindYourSeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
