import {VisitorTracking} from '@/components/tracking/VisitorTracking';
import {safeTrackingSettings} from '@/lib/services/tracking';
import {CartDrawer} from '@/components/cart/CartDrawer';
import type {ReactNode} from 'react';
import {AnnouncementBar} from '@/components/storefront/AnnouncementBar';
import {Navbar} from '@/components/storefront/Navbar';
import {Footer} from '@/components/storefront/Footer';
import {MobileBottomNav} from '@/components/storefront/MobileBottomNav';
import {FloatingWhatsApp} from '@/components/storefront/FloatingWhatsApp';
import {SiteContentProvider} from '@/components/storefront/SiteContentProvider';
import {getSiteContent} from '@/lib/services/content';
export const dynamic='force-dynamic';
export default async function StoreLayout({children}:{children:ReactNode}){
 const [snapshot,tracking]=await Promise.all([getSiteContent(),safeTrackingSettings()]);
 return <SiteContentProvider initialContent={snapshot}><VisitorTracking initialSettings={tracking}><div className="flex-1 flex flex-col min-h-screen"><AnnouncementBar/><Navbar/><main id="main-content" className="flex-1 pb-16 lg:pb-0">{children}</main><Footer/><MobileBottomNav/><FloatingWhatsApp/><CartDrawer/></div></VisitorTracking></SiteContentProvider>;
}
