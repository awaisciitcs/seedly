'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Heart, Menu, PackageCheck, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { SeedlyLogo } from '@/components/ui/SeedlyLogo';
import { Dialog } from '@/components/ui/Dialog';
import { ProductSearch } from './ProductSearch';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
import { TrackOrderModal } from './TrackOrderModal';


export function Navbar() {
 const {header,features,config,brand}=useSiteContent<SiteContent>('site');
 const shopLinks=header.shopLinks;
 const exploreLinks=header.exploreLinks.filter(link=>features.routine||link.href!=='/find-your-seed');
  const path = usePathname();
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [track, setTrack] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const isCurrent = (href: string) => path === href || path.startsWith(href + '/');

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setTrack(false);
  }, [path]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeMobileMenu = () => { if (desktop.matches) setMenu(false); };
    desktop.addEventListener('change', closeMobileMenu);
    return () => desktop.removeEventListener('change', closeMobileMenu);
  }, []);

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        !features.search || event.key !== '/' || event.defaultPrevented || event.repeat || event.isComposing ||
        event.ctrlKey || event.altKey || event.metaKey ||
        (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) ||
        document.querySelector('dialog[open]')
      ) return;
      event.preventDefault();
      searchButtonRef.current?.focus({ preventScroll: true });
      setSearch(true);
    };
    document.addEventListener('keydown', openSearch);
    return () => document.removeEventListener('keydown', openSearch);
  }, [features.search]);

  return (
    <header className="site-header">
      <div className="store-container site-header-main">
        <button
          type="button"
          className="site-header-icon site-header-menu"
          aria-label="Open navigation"
          aria-expanded={menu}
          aria-haspopup="dialog"
          onClick={() => setMenu(true)}
        >
          <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
        </button>

        <div className="site-header-brand">
          <SeedlyLogo brandName={config.name} logoUrl={brand.logoUrl} logoAlt={brand.logoAlt} size="lg" className="site-header-logo" />
          <p className="site-header-tagline">{header.tagline}</p>
        </div>

        {features.search && <button
          ref={searchButtonRef}
          type="button"
          className="site-header-search"
          aria-label="Search products"
          aria-expanded={search}
          aria-haspopup="dialog"
          aria-keyshortcuts="/"
          onClick={() => setSearch(true)}
        >
          <Search size={20} strokeWidth={1.7} aria-hidden="true" />
          <span className="site-header-search-text">{header.searchLabel}</span>
          <kbd className="site-header-shortcut" aria-hidden="true">/</kbd>
        </button>}

        <div className="site-header-actions">
          {features.savedProducts && <Link className="site-header-saved" href="/account/wishlist" aria-label="Saved products">
            <Heart size={21} strokeWidth={1.7} aria-hidden="true" />
            <span>{header.savedLabel}</span>
          </Link>}
          <button
            type="button"
            className="site-header-basket"
            aria-label={'Open basket, ' + itemCount + ' items'}
            aria-expanded={isCartOpen}
            aria-haspopup="dialog"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={21} strokeWidth={1.7} aria-hidden="true" />
            <span className="site-header-basket-label">{header.basketLabel}</span>
            {itemCount > 0 && <span className="site-header-count" aria-hidden="true">{itemCount}</span>}
          </button>
        </div>
      </div>

      <div className="site-header-rail">
        <div className="store-container site-header-rail-inner">
          <nav aria-label="Main navigation" className="site-header-nav">
            {shopLinks.map(link => (
              <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined} className="site-header-link">
                {link.label}
              </Link>
            ))}
            <span className="site-header-divider" aria-hidden="true" />
            {exploreLinks.map(link => (
              <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined} className="site-header-link">
                {link.label}
              </Link>
            ))}
          </nav>
          <button type="button" className="site-header-track" aria-expanded={track} aria-haspopup="dialog" onClick={() => setTrack(true)}>
            <PackageCheck size={16} strokeWidth={1.7} aria-hidden="true" />
            <span>{header.trackLabel}</span>
          </button>
        </div>
      </div>

      {search && features.search && <ProductSearch onClose={() => setSearch(false)} />}

      <Dialog open={menu} onClose={() => setMenu(false)} title="Navigation" className="menu-dialog site-menu">
        <div className="site-menu-content">
          <div className="site-menu-heading">
            <SeedlyLogo brandName={config.name} logoUrl={brand.logoUrl} logoAlt={brand.logoAlt} size="lg" />
            <button type="button" className="site-header-icon" aria-label="Close navigation" data-autofocus onClick={() => setMenu(false)}>
              <X size={22} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
          {features.search && <button type="button" className="site-menu-search" onClick={() => { setMenu(false); setSearch(true); }}>
            <Search size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>{header.mobileSearchLabel}</span>
          </button>}
          <nav aria-label="Mobile navigation">
            <p className="site-menu-section-label">{header.mobileShopLabel}</p>
            <ul className="site-menu-links">
              {shopLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined} onClick={() => setMenu(false)}>
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="site-menu-section-label">{header.mobileExploreLabel}</p>
            <ul className="site-menu-links site-menu-explore">
              {exploreLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined} onClick={() => setMenu(false)}>
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-menu-utilities">
            <button type="button" className="site-menu-utility" onClick={() => { setMenu(false); setTrack(true); }}>
              <PackageCheck size={19} strokeWidth={1.7} aria-hidden="true" />
              <span>{header.mobileTrackLabel}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <Link className="site-menu-utility" href="/account" onClick={() => setMenu(false)}>
              <UserRound size={19} strokeWidth={1.7} aria-hidden="true" />
              <span>{header.mobileAccountLabel}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <Link className="site-menu-contact" href="/contact" onClick={() => setMenu(false)}>
            {header.mobileContactLabel} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </Dialog>

      <TrackOrderModal isOpen={track} onClose={() => setTrack(false)} />
    </header>
  );
}
