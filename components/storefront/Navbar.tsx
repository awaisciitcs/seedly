'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Search, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { ProductSearch } from './ProductSearch';

const navLinks = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Seeds', href: '/seeds' },
  { label: 'Kits', href: '/kits' },
  { label: 'Teas', href: '/teas' },
  { label: 'Routine finder', href: '/find-your-seed' },
  { label: 'Our story', href: '/about' },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen, cartBump } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (window.innerWidth < 1024) {
        if (currentScrollY > 80 && currentScrollY > lastScrollY.current + 8) {
          setHidden(true);
        } else if (currentScrollY < lastScrollY.current - 8) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      menuButton.current?.focus();
      setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const isHeaderHidden = hidden && !mobileMenuOpen && !searchOpen;

  return (
    <header className={`sticky top-0 z-40 bg-cream transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transition-none ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-border-gray/80' : 'border-b border-border-gray'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:flex lg:h-20 lg:justify-between lg:gap-8">
          <button
            ref={menuButton}
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpen(false);
            }}
            className="motion-icon flex h-11 w-11 items-center justify-center text-charcoal transition-colors hover:text-seedly-primary lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>

          <SeedlyLogo size="md" className="shrink-0" />

          <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={`motion-nav border-b py-2 text-sm whitespace-nowrap transition-colors ${
                  pathname === link.href
                    ? 'border-transparent text-seedly-dark'
                    : 'border-transparent text-charcoal/80 hover:text-seedly-dark'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end lg:gap-1">
            <button
              ref={searchButton}
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMobileMenuOpen(false);
              }}
              className="motion-icon flex h-11 w-11 items-center justify-center text-charcoal transition-colors hover:text-seedly-primary"
              aria-label={searchOpen ? 'Close search' : 'Search products'}
              aria-expanded={searchOpen}
              aria-controls="catalog-search"
              aria-haspopup="dialog"
            >
              {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
            </button>

            <Link
              href="/account/wishlist"
              className="motion-icon relative hidden h-11 w-11 items-center justify-center text-charcoal transition-colors hover:text-seedly-primary lg:flex"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} saved items` : ''}`}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {wishlistCount > 0 && <span key={wishlistCount} className="motion-pop absolute right-1 top-0 text-[10px] font-semibold" aria-hidden="true">{wishlistCount}</span>}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="motion-icon relative flex h-11 w-11 items-center justify-center text-charcoal transition-colors hover:text-seedly-primary"
              aria-label={`Open basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className={`absolute right-0.5 top-0 min-w-3 text-center text-[10px] font-semibold ${
                    cartBump ? 'motion-bump text-seedly-forest font-bold' : 'motion-pop'
                  }`}
                  aria-hidden="true"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && <ProductSearch onClose={() => setSearchOpen(false)} />}
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="motion-panel max-h-[calc(100dvh-10rem)] overflow-y-auto border-t border-border-gray bg-cream px-6 pb-5 pt-2 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`block border-b border-border-gray py-3 text-base transition-colors hover:text-seedly-primary ${pathname === link.href ? 'font-semibold text-seedly-dark' : 'text-charcoal'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
