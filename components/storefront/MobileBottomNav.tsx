'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Compass, Heart, User } from 'lucide-react';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
import { useWishlist } from '../../lib/store/wishlist';

export function MobileBottomNav() {
  const pathname = usePathname();
 const {mobileNavigation,features}=useSiteContent<SiteContent>('site');
  const [sticky, setSticky] = useState(false);
  useEffect(() => { const update = () => setSticky(document.body.dataset.stickyBarActive === "true"); update(); window.addEventListener("seedly-sticky-bar", update); return () => window.removeEventListener("seedly-sticky-bar", update); }, []);
  const { wishlistCount } = useWishlist();

  if (sticky || pathname.startsWith('/cart') || pathname.startsWith('/order') || pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  const icons:Record<string,typeof Home>={home:Home,shop:Store,routine:Compass,saved:Heart,orders:User};
 const items=mobileNavigation.filter(item=>(features.routine||item.id!=='routine')&&(features.savedProducts||item.id!=='saved')).map(item=>({...item,icon:icons[item.id]||Store,badge:item.id==='saved'?wishlistCount:undefined}));

  return (
    <nav aria-label="Quick navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border-gray bg-white pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden">
      <div className="grid h-16 px-2" style={{gridTemplateColumns:'repeat('+items.length+', minmax(0,1fr))'}}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.badge ? `${item.label}, ${item.badge} saved items` : item.label}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 border-t-2 transition-colors ${isActive ? 'border-ink font-bold text-ink' : 'border-transparent text-ink/60 hover:text-ink'}`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -right-2 -top-1.5 h-3.5 min-w-[14px] px-0.5 rounded-full border border-ink bg-kit-coral text-white text-[8px] font-extrabold flex items-center justify-center" aria-hidden="true">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[11px] leading-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
