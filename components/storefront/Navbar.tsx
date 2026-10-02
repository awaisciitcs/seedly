'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Search, ShoppingBag, Heart, Menu, X, ArrowRight, Truck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 transition-shadow duration-200">
      <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] h-16 sm:h-20 items-center gap-2 sm:gap-4">
          
          {/* Mobile menu trigger + Logo start */}
          <div className="flex items-center gap-2.5 sm:gap-3 justify-self-start">
            <button
              ref={menuButton}
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setSearchOpen(false);
              }}
              className="h-9 w-9 rounded-full border border-gray-200 bg-white text-stone-800 hover:text-black hover:bg-stone-50 flex items-center justify-center lg:hidden shadow-xs cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo: seedly ♥ */}
            <SeedlyLogo size="md" className="shrink-0" />
          </div>

          {/* Center Navigation / Shop Search Input */}
          <div className="justify-self-center">
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
                className="hidden md:flex w-64 lg:w-96"
                role="search"
              >
                <div className="relative w-full">
                  <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  <input
                    type="search"
                    name="search"
                    placeholder="Search the pantry..."
                    aria-label="Search the pantry"
                    className="w-full rounded-full border border-gray-200 bg-stone-50/70 py-2 ps-10 pe-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-400 shadow-xs transition-colors"
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
                      className={`rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-medium tracking-tight transition-all duration-150 ${
                        active
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-stone-700 hover:text-black hover:bg-stone-100/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 justify-self-end">
            
            {/* Search Circle Button (Hidden on /shop desktop since search is inline) */}
            {pathname !== '/shop' && (
              <button
                ref={searchButton}
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMobileMenuOpen(false);
                }}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white text-stone-700 hover:text-black hover:bg-stone-50 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
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
                className="hidden sm:inline-flex rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-white text-stone-800 hover:bg-stone-50 shadow-xs cursor-pointer transition-colors"
              >
                <span className={language === 'EN' ? 'text-black font-bold' : 'text-stone-400'}>EN</span>
                <span className="mx-1 text-stone-300">|</span>
                <span className={language === 'UR' ? 'text-black font-bold' : 'text-stone-400'}>UR</span>
              </button>
            )}

            {/* Track Order Link */}
            {pathname !== '/shop' && (
              <button
                type="button"
                onClick={() => setTrackOrderOpen(true)}
                aria-label="Track order"
                className="hidden md:inline-flex items-center justify-center h-9 xl:h-auto px-2.5 xl:px-1.5 xl:py-1 rounded-full xl:rounded-none border border-gray-200 xl:border-0 bg-white xl:bg-transparent text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-black hover:underline underline-offset-4 whitespace-nowrap transition-colors cursor-pointer shadow-xs xl:shadow-none"
              >
                <Truck className="h-4 w-4 xl:hidden text-stone-700" aria-hidden="true" />
                <span className="hidden xl:inline">Track order</span>
              </button>
            )}

            {/* Wishlist Circle Button */}
            <Link
              href="/account/wishlist"
              className="relative hidden sm:flex h-9 w-9 rounded-full border border-gray-200 bg-white text-stone-700 hover:text-black hover:bg-stone-50 items-center justify-center shadow-xs transition-colors"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} saved items` : ''}`}
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -end-1 h-4 min-w-[16px] px-1 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button: Circular button with badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative flex h-9 w-9 rounded-full border border-gray-200 items-center justify-center bg-white text-stone-800 hover:text-black hover:bg-stone-50 shadow-xs transition-all cursor-pointer ${
                cartBump ? 'scale-105 bg-stone-100' : ''
              }`}
              aria-label={`Open basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 h-4 min-w-[16px] px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
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
