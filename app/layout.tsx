import type { Metadata } from 'next';
import { Playfair_Display, Roboto } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import { WishlistProvider } from '../lib/store/wishlist';
import { CartDrawer } from '../components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Seedly — Pakistan’s Heirloom Seed & Herbal Tea Apothecary',
  description:
    'Grow something good. Pure, cold-milled heirloom seeds, hormone-nourishing cycle kits, and hand-harvested Himalayan whole flower teas delivered nationwide across Pakistan.',
  keywords: [
    'Seedly',
    'Seed Cycling Pakistan',
    'Pumpkin Seeds Pakistan',
    'Flax Seeds',
    'Sunflower Seeds',
    'Chamomile Tea Pakistan',
    'Spearmint Tea',
    'Hormonal Balance',
    'Organic Wellness Pakistan',
  ],
  icons: {
    icon: '/logo/seedly-logo.jpg',
    apple: '/logo/seedly-logo.jpg',
  },
  openGraph: {
    title: 'Seedly — Pakistan’s Heirloom Seed & Herbal Tea Apothecary',
    description: 'Grow something good. Pure heirloom seeds and herbal botanical teas.',
    url: 'https://seedly.pk',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${roboto.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream text-charcoal">
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
