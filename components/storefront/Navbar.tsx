'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Search, ShoppingBag, Heart, Menu, X, Compass } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Seeds', href: '/seeds' },
    { label: 'Kits', href: '/kits' },
    { label: 'Mountain Teas', href: '/teas' },
    { label: 'Routine Finder', href: '/find-your-seed', icon: Compass },
    { label: 'Our Story', href: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-border-gray transition-all">
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
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors relative py-1 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-seedly-dark font-semibold'
                      : 'text-charcoal/80 hover:text-seedly-dark'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-seedly-primary" />}
                  <span>{link.label}</span>
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
                <span className="absolute 1 top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Basket Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-seedly-dark text-white hover:bg-seedly-forest transition-colors shadow-subtle text-xs font-semibold"
              aria-label="Shopping basket"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Basket</span>
              {itemCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-white text-seedly-dark rounded-full text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="pb-4 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search raw seeds, cycle kits, whole flower teas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 pl-10 bg-white border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50 text-charcoal shadow-subtle"
              />
              <Search className="w-4 h-4 text-muted-gray absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3.5 top-2.5 text-xs text-muted-gray hover:text-charcoal"
              >
                Close
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-gray bg-cream px-4 py-6 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 px-3 rounded-xl flex items-center justify-between ${
                    isActive ? 'bg-seedly-light text-seedly-dark font-bold' : 'text-charcoal hover:bg-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-seedly-primary" />}
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 px-3 rounded-xl bg-seedly-dark text-white text-center mt-2"
            >
              Shop All Products
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
