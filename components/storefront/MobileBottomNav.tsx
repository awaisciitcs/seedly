'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Compass, Heart, User } from 'lucide-react';
import { useWishlist } from '../../lib/store/wishlist';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();

  // Don't show bottom nav on admin routes or checkout
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Store },
    { label: 'Quiz', href: '/find-your-seed', icon: Compass },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-gray/80 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                isActive ? 'text-seedly-dark font-semibold' : 'text-muted-gray hover:text-charcoal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-seedly-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-seedly-dark rounded-full absolute bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
