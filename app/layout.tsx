import {getContentDocument} from '@/lib/services/content';
import type {SiteContent,HomeContent} from '@/lib/cms/storefront-types';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import { WishlistProvider } from '../lib/store/wishlist';
import { CartToast } from '../components/cart/CartToast';
import { RouteProgressBar } from '../components/ui/RouteProgressBar';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});


export async function generateMetadata():Promise<Metadata>{
 try{
 const [site,home]=await Promise.all([getContentDocument<SiteContent>('site'),getContentDocument<HomeContent>('home')]);
 const title=site.config.name+' ? '+site.config.brandLine;
 const image=home.images.src_images_hero_seedly_hero_jpg;
 return {metadataBase:new URL(site.config.url),title:{default:title,template:'%s'},description:site.config.description,...(site.brand.logoUrl?{icons:{icon:site.brand.logoUrl,apple:site.brand.logoUrl}}:{}),openGraph:{title,description:site.config.description,url:site.config.url,siteName:site.config.name,locale:'en_PK',type:'website',...(image?{images:[{url:image,alt:home.copy.alt_seeds_and_a_cup_of_tea_on_a_kitchen_table}]}:{})}};
 }catch{return {};}
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-seed-lime selection:text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-seedly-dark focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartToast />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
