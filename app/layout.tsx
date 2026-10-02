import type { Metadata } from 'next';
import { Roboto, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import { WishlistProvider } from '../lib/store/wishlist';
import { CartDrawer } from '../components/cart/CartDrawer';
import { CartToast } from '../components/cart/CartToast';
import { RouteProgressBar } from '../components/ui/RouteProgressBar';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-urdu',
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
    <html lang="en" className={`${roboto.variable} ${notoNastaliqUrdu.variable}`}>
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
