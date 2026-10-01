'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Search, ShoppingBag, Heart, Menu, X, ArrowRight } from 'lucide-react';
import { ProductSearch } from './ProductSearch';
import { TrackOrderModal } from './TrackOrderModal';

const navLinks = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Seeds', href: '/seeds' },
  { label: 'Kits', href: '/kits' },
  { label: 'Teas', href: '/teas' },
  { label: 'Routine finder', href: '/find-your-seed' },
  { label: 'Journal', href: '/about#journal' },
  { label: 'Our story', href: '/about' },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen, cartBump } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'UR' : 'EN'));
  };

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink transition-shadow duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          
          {/* Mobile menu trigger */}
          <button
            ref={menuButton}
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpen(false);
            }}
            className="btn-brutal h-10 w-10 bg-white text-ink lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo: seedly ♥ */}
          <SeedlyLogo size="md" className="shrink-0" />

          {/* Center Navigation / Shop Search Input matching Canva */}
          {pathname === '/shop' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('search') as HTMLInputElement;
                const params = new URLSearchParams(window.location.search);
                if (input?.value?.trim()) {
                  params.set('search', input.value.trim());
                } else {
                  params.delete('search');
                }
                window.location.href = `/shop?${params.toString()}`;
              }}
              className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8"
              role="search"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink pointer-events-none" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search the pantry"
                  aria-label="Search the pantry"
                  className="w-full rounded-full border-2 border-ink bg-white py-2 pl-10 pr-4 text-xs font-bold text-ink shadow-brutal-sm placeholder:text-muted-gray focus:outline-none focus:bg-paper"
                />
              </div>
            </form>
          ) : (
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-bold tracking-tight transition-all duration-150 ${
                      active
                        ? 'border-2 border-ink bg-seed-lime text-ink shadow-brutal-sm'
                        : 'text-ink/90 hover:border-2 hover:border-ink hover:bg-white hover:shadow-brutal-sm border-2 border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Circle Button (Hidden on /shop desktop since search is inline) */}
            {pathname !== '/shop' && (
              <button
                ref={searchButton}
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMobileMenuOpen(false);
                }}
                className="btn-brutal h-10 w-10 bg-white text-ink hover:bg-seed-lime"
                aria-label={searchOpen ? 'Close search' : 'Search products'}
                aria-expanded={searchOpen}
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Language Switcher EN | UR */}
            {pathname !== '/shop' && (
              <button
                type="button"
                onClick={toggleLanguage}
                title={`Switch language (current: ${language})`}
                className="hidden sm:inline-flex btn-brutal px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-white text-ink hover:bg-seed-lime"
              >
                <span className={language === 'EN' ? 'text-ink' : 'text-muted-gray'}>EN</span>
                <span className="mx-1 text-ink/40">|</span>
                <span className={language === 'UR' ? 'text-ink' : 'text-muted-gray'}>UR</span>
              </button>
            )}

            {/* Track Order Link */}
            {pathname !== '/shop' && (
              <button
                type="button"
                onClick={() => setTrackOrderOpen(true)}
                className="hidden md:inline-flex text-xs font-bold uppercase tracking-wider text-ink hover:underline underline-offset-4 py-1 px-1.5 transition-colors"
              >
                Track order
              </button>
            )}

            {/* Wishlist Circle Button */}
            <Link
              href="/account/wishlist"
              className="btn-brutal relative hidden sm:flex h-10 w-10 bg-white text-ink hover:bg-seed-lime"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} saved items` : ''}`}
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 rounded-full border-2 border-ink bg-kit-coral text-white text-[9px] font-extrabold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button: Circular button with coral count badge matching Canva */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`btn-brutal relative flex h-10 w-10 items-center justify-center bg-white text-ink hover:bg-seed-lime ${
                cartBump ? 'scale-105 bg-seed-lime' : ''
              }`}
              aria-label={`Open basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 rounded-full border-2 border-ink bg-kit-coral text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && <ProductSearch onClose={() => setSearchOpen(false)} />}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t-2 border-ink bg-paper px-6 py-6 lg:hidden animate-fadeIn space-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-full border-2 border-ink px-4 py-2.5 text-sm font-bold text-ink shadow-brutal-sm ${
                pathname === link.href ? 'bg-seed-lime' : 'bg-white hover:bg-seed-lime/30'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t-2 border-ink/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackOrderOpen(true);
              }}
              className="text-xs font-bold uppercase tracking-wider text-ink underline"
            >
              Track your order
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="btn-brutal px-3 py-1 text-xs bg-white text-ink"
            >
              Language: {language}
            </button>
          </div>
        </nav>
      )}

      {/* Track Order Modal */}
      <TrackOrderModal isOpen={trackOrderOpen} onClose={() => setTrackOrderOpen(false)} />
    </header>
  );
}

export default Navbar;
