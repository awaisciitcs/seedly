'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SeedlyLogo } from '../../components/ui/SeedlyLogo';
import { createClient } from '@/lib/supabase/browser';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  ShieldCheck,
  Bell,
  Clock,
  LogOut,
  Loader2,
} from 'lucide-react';

interface AdminInfo {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'STAFF' | string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

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
          if (isMounted) {
            router.push('/admin/login');
          }
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

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Receipts', href: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
    { label: 'Products & Stock', href: '/admin/products', icon: Package },
    { label: 'Curated Kits', href: '/admin/kits', icon: Layers },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Stock Alerts', href: '/admin/stock-alerts', icon: Bell },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings, ownerOnly: true },
  ];

  return (
    <div className="admin-glass-canvas min-h-screen text-white flex flex-col md:flex-row antialiased relative selection:bg-emerald-500/30 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 p-3 md:p-4 flex flex-col justify-between">
        <div className="glass-panel-3d rounded-3xl p-4 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-6">
            {/* Logo & Operations Desk Badge */}
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

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (item.ownerOnly && !isOwner) {
                  return null;
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/[0.12] text-white font-semibold border border-emerald-400/30 shadow-[0_0_20px_rgba(74,222,128,0.18),inset_0_1px_1px_rgba(255,255,255,0.22)]'
                        : 'text-botanical-sage hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-lime' : 'text-botanical-sage'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_10px_rgba(34,197,94,0.25)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer / Role & Storefront Link */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            {/* Active Role Card */}
            <div className="glass-card-3d p-3 rounded-2xl space-y-1.5 border border-white/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-botanical-sage">Authenticated Role:</span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {admin?.role?.toUpperCase() || (loading ? 'Checking...' : 'OWNER')}
                </span>
              </div>
              <div className="font-semibold text-white/90 truncate text-[11px]">
                {admin?.email || (loading ? 'Loading...' : 'owner@seedly.pk')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="btn-lime-3d flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign Out of Operations Desk"
                className="glass-btn-3d p-2.5 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-white/10 cursor-pointer disabled:opacity-50"
              >
                {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="glass-panel-3d rounded-2xl mx-3 md:mx-6 mt-3 md:mt-4 px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              Seedly Admin Portal
            </span>
            <span className="text-xs text-botanical-sage hidden sm:inline">• Pakistan Market Operations</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-btn-3d px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 text-white/80">
              <Clock className="w-3.5 h-3.5 text-lime" />
              <span>Karachi Time (PKT)</span>
            </div>

            <button
              type="button"
              title="Notifications"
              className="glass-btn-3d w-8 h-8 rounded-full flex items-center justify-center relative text-white/80 hover:text-white"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            </button>

            <div className="glass-btn-3d pl-1.5 pr-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-lime text-botanical-deep font-bold flex items-center justify-center text-xs shadow-[0_0_8px_rgba(183,228,89,0.5)]">
                A
              </div>
              <span className="text-xs font-medium text-white">Owner</span>
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
