'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { OrderDrawer } from '@/components/admin/OrderDrawer';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  Bell,
  LogOut,
  Loader2,
  Search,
  RefreshCw,
  Sparkles,
  ChevronRight,
  EyeOff,
  User,
} from 'lucide-react';

interface AdminInfo {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'STAFF' | string;
}

interface AdminCounts {
  pendingReceiptsCount: number;
  oldestReceiptAge: string | null;
  ordersToPackCount: number;
  lowStockCount: number;
  stockAlertsCount: number;
  totalOrdersCount: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [counts, setCounts] = useState<AdminCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reduceEffects, setReduceEffects] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [lastSyncedSec, setLastSyncedSec] = useState(0);

  // Sync counts
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/counts');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setCounts(json.data);
          setLastSyncedSec(0);
        }
      }
    } catch (e) {
      console.error('Failed to load admin counts:', e);
    }
  }, []);

  // Timer for "Synced Xs ago"
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll counts every 45s
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 45000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Load Admin user
  useEffect(() => {
    let isMounted = true;
    async function loadAdmin() {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.data?.admin) {
            setAdmin(data.data.admin);
          }
        } else if (res.status === 401 || res.status === 403) {
          if (isMounted) router.push('/admin/login');
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdmin();
    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // Handle data-fx="lite"
  useEffect(() => {
    const saved = localStorage.getItem('seedly_admin_fx');
    if (saved === 'lite') {
      setReduceEffects(true);
      document.documentElement.setAttribute('data-fx', 'lite');
    }
  }, []);

  const toggleEffects = () => {
    const next = !reduceEffects;
    setReduceEffects(next);
    if (next) {
      document.documentElement.setAttribute('data-fx', 'lite');
      localStorage.setItem('seedly_admin_fx', 'lite');
    } else {
      document.documentElement.removeAttribute('data-fx');
      localStorage.removeItem('seedly_admin_fx');
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
      router.push('/admin/login');
    }
  };

  // If on login page, render clean layout without sidebar
  if (pathname === '/admin/login') {
    return (
      <div className="admin-glass-canvas min-h-screen text-white flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-white">
        <head>
          <title>Admin Sign In | Seedly Pakistan</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        {children}
      </div>
    );
  }

  const isOwner = admin?.role?.toUpperCase() === 'OWNER';

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    ownerOnly?: boolean;
  }

  interface NavSection {
    heading: string;
    items: NavItem[];
  }

  // Navigation Structure Grouped by Sections
  const navSections: NavSection[] = [
    {
      heading: 'OPERATE',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        {
          label: 'Orders & Receipts',
          href: '/admin/orders',
          icon: ShoppingBag,
          count: counts?.pendingReceiptsCount || 0,
        },
      ],
    },
    {
      heading: 'CATALOG',
      items: [
        {
          label: 'Products & Stock',
          href: '/admin/products',
          icon: Package,
          count: counts?.lowStockCount || 0,
        },
        { label: 'Curated Kits', href: '/admin/kits', icon: Layers },
      ],
    },
    {
      heading: 'CUSTOMERS',
      items: [
        { label: 'Customer Directory', href: '/admin/customers', icon: Users },
        { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
        {
          label: 'Stock Alerts',
          href: '/admin/stock-alerts',
          icon: Bell,
          count: counts?.stockAlertsCount || 0,
        },
      ],
    },
    {
      heading: 'ADMIN',
      items: [
        { label: 'Store Settings', href: '/admin/settings', icon: Settings, ownerOnly: true },
      ],
    },
  ];

  // Dynamic Breadcrumb computation
  const getBreadcrumb = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/orders')) return 'Orders & Receipts';
    if (pathname.startsWith('/admin/products')) return 'Products & Stock';
    if (pathname.startsWith('/admin/kits')) return 'Curated Kits';
    if (pathname.startsWith('/admin/customers')) return 'Customer Directory';
    if (pathname.startsWith('/admin/reviews')) return 'Reviews Moderation';
    if (pathname.startsWith('/admin/stock-alerts')) return 'Stock Alerts';
    if (pathname.startsWith('/admin/settings')) return 'Store Settings';
    return 'Desk';
  };

  return (
    <div className="admin-glass-canvas min-h-screen text-white flex flex-col md:flex-row antialiased relative selection:bg-emerald-500/30 selection:text-white">
      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectOrder={(ordId) => {
          setInspectOrderId(ordId);
          setIsDrawerOpen(true);
        }}
      />

      {/* Global Slide-Over Order Drawer */}
      <OrderDrawer
        orderId={inspectOrderId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={fetchCounts}
      />

      {/* Glass Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 p-3 md:p-4 flex flex-col justify-between">
        <div className="glass rounded-3xl p-4 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-6">
            {/* Brand Logo & Operations Desk Badge */}
            <div className="flex flex-col gap-2 pt-2 px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center text-botanical-deep shadow-[0_0_15px_rgba(183,228,89,0.4)]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-10 6-1.5 3-1 6.5-1 6.5s2.5-.5 5.5-2.5C18.5 11.5 19 8 19 8Z" />
                  </svg>
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white lowercase">seedly</span>
              </div>
              <span className="text-[9px] tracking-widest uppercase font-mono font-semibold text-white/70 bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/10 w-fit">
                OPERATIONS DESK
              </span>
            </div>

            {/* Navigation Grouped by Section */}
            <nav className="space-y-4">
              {navSections.map((section) => (
                <div key={section.heading} className="space-y-1">
                  <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-botanical-sage/70 font-semibold">
                    {section.heading}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      if (item.ownerOnly && !isOwner) return null;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'nav-lit'
                              : 'text-botanical-sage hover:text-white hover:bg-white/[0.06] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 ${isActive ? 'text-lime' : 'text-botanical-sage'}`}
                            />
                            <span>{item.label}</span>
                          </div>

                          {/* Actionable Counter Badge */}
                          {typeof item.count === 'number' && item.count > 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/15">
                              {item.count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Demoted Storefront Ghost CTA (Only one keycap lit on page) */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="btn-ghost-admin w-full py-2.5 px-3 rounded-xl text-xs font-medium gap-1.5"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar with Glass Refraction */}
        <header className="glass sticky top-3 md:top-4 z-40 mx-3 md:mx-6 px-4 py-2.5 flex items-center justify-between">
          {/* Left: Breadcrumbs & Quick Search Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-botanical-sage hidden sm:inline">Operations Desk</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/55 hidden sm:inline" />
              <span className="font-semibold text-white">{getBreadcrumb()}</span>
            </div>

            {/* Ctrl / Cmd + K Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="glass-recessed px-3 py-1.5 rounded-xl text-xs text-botanical-sage hover:text-white flex items-center gap-2 transition-all border border-white/10"
              title="Search orders, phone numbers, or SKUs (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-lime" />
              <span className="hidden sm:inline">Search (#SED, phone, SKU)...</span>
              <kbd className="hidden sm:inline font-mono text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Freshness indicator & Consolidated Avatar Menu */}
          <div className="flex items-center gap-3">
            {/* Freshness Indicator */}
            <button
              type="button"
              onClick={fetchCounts}
              title="Click to refresh latest data"
              className="glass-inset px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-botanical-sage hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-lime" />
              <span className="hidden md:inline">
                {lastSyncedSec < 5 ? 'synced just now' : `synced ${lastSyncedSec}s ago`}
              </span>
            </button>

            {/* Single Consolidated Avatar Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="glass-inset px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-lime text-botanical-deep font-bold flex items-center justify-center text-xs shadow-[0_0_8px_rgba(183,228,89,0.5)]">
                  {admin?.email ? admin.email.charAt(0).toUpperCase() : 'O'}
                </div>
                <span className="text-xs font-medium text-white hidden sm:inline">
                  {admin?.role || 'OWNER'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isAvatarMenuOpen && (
                <div
                  className="glass absolute right-0 mt-2 w-64 rounded-2xl p-3 space-y-2 border border-white/20 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  data-elev="overlay"
                >
                  <div className="px-2 py-1.5 border-b border-white/10 space-y-0.5">
                    <div className="text-xs font-semibold text-white truncate">
                      {admin?.email || 'owner@seedly.pk'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {admin?.role || 'OWNER'} ROLE
                      </span>
                    </div>
                  </div>

                  {/* Reduce effects toggle */}
                  <button
                    type="button"
                    onClick={toggleEffects}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-botanical-sage hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Reduce Effects (Lite)</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        reduceEffects ? 'bg-lime text-botanical-deep font-bold' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {reduceEffects ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Sign Out Action */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    <span>Sign Out of Operations Desk</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
