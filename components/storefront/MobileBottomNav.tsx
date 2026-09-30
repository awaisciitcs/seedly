'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Compass, Heart, User } from 'lucide-react';
import { useWishlist } from '../../lib/store/wishlist';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();

  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Store },
    { label: 'Find yours', href: '/find-your-seed', icon: Compass },
    { label: 'Saved', href: '/account/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav aria-label="Quick navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border-gray bg-cream pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden">
      <div className="grid h-16 grid-cols-5 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.badge ? `${item.label}, ${item.badge} saved items` : item.label}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 border-t-2 transition-colors ${isActive ? 'border-seedly-dark font-medium text-seedly-dark' : 'border-transparent text-muted-gray hover:text-seedly-dark'}`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
                {item.badge && item.badge > 0 ? <span className="absolute -right-2 -top-1.5 text-[9px] font-semibold leading-none text-seedly-dark" aria-hidden="true">{item.badge}</span> : null}
              </span>
              <span className="text-xs leading-4">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
