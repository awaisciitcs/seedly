import type { Metadata } from 'next';
import { Playfair_Display, Roboto, Space_Grotesk, DM_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import { WishlistProvider } from '../lib/store/wishlist';
import { CartDrawer } from '../components/cart/CartDrawer';
import { CartToast } from '../components/cart/CartToast';
import { RouteProgressBar } from '../components/ui/RouteProgressBar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://seedly.pk'),
  title: {
    default: 'Seedly — Pakistan’s Raw Seeds & Mountain Teas',
    template: '%s | Seedly',
  },
  description:
    'Pure whole raw pantry seeds, 14-day & 28-day routine kits, and high-altitude mountain teas delivered nationwide across Pakistan. Packed fresh in Lahore.',
  icons: {
    icon: '/logo/seedly-logo.jpg',
    apple: '/logo/seedly-logo.jpg',
  },
  openGraph: {
    title: 'Seedly — Pakistan’s Raw Seeds & Mountain Teas',
    description:
      'Raw seeds and herbal teas for eating and brewing, packed fresh in Lahore from growers in Gilgit-Baltistan, KP and Punjab.',
    url: 'https://seedly.pk',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/hero/seedly-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Seedly raw seeds and whole blossom mountain teas',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} ${playfair.variable} ${roboto.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-seed-lime selection:text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-seedly-dark focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <RouteProgressBar />
            {children}
            <CartDrawer />
            <CartToast />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
