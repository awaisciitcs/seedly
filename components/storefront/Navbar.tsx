'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Search, ShoppingBag, Heart, User, Menu, X, Compass } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Seeds', href: '/seeds' },
    { label: 'Seed Kits', href: '/kits', badge: 'Popular' },
    { label: 'Herbal Teas', href: '/teas' },
    { label: 'Find Your Seed', href: '/find-your-seed', highlight: true },
    { label: 'Our Story', href: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-border-gray/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:text-seedly-dark rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial flex items-center justify-center lg:justify-start">
            <SeedlyLogo size="lg" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors relative py-1 ${
                    isActive
                      ? 'text-seedly-dark font-semibold'
                      : 'text-charcoal/80 hover:text-seedly-dark'
                  } ${link.highlight ? 'text-seedly-dark font-semibold flex items-center gap-1.5' : ''}`}
                >
                  {link.highlight && <Compass className="w-3.5 h-3.5 text-seedly-primary animate-spin" style={{ animationDuration: '8s' }} />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-seedly-light text-seedly-dark rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-seedly-dark rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-charcoal hover:text-seedly-dark transition-colors"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 text-charcoal hover:text-seedly-dark relative transition-colors hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-seedly-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2 text-charcoal hover:text-seedly-dark transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-seedly-dark hover:bg-seedly-forest text-white transition-all shadow-subtle"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold">{itemCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="border-t border-border-gray/60 bg-cream px-4 py-3 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-gray" />
            <input
              type="text"
              placeholder="Search heirloom seeds, chamomile tea, cycle kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-20 py-2.5 bg-white border border-border-gray rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50 text-charcoal placeholder:text-muted-gray/70"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 bg-seedly-dark text-white text-xs font-medium rounded-full hover:bg-seedly-forest"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-gray/70 bg-cream px-5 py-6 space-y-4 animate-fadeIn">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-charcoal hover:text-seedly-dark border-b border-border-gray/30"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 flex items-center justify-between text-sm">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-charcoal"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-charcoal"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistCount})</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
