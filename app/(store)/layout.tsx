import React from 'react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { MobileBottomNav } from '../../components/storefront/MobileBottomNav';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
