'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../../components/ui/SeedlyLogo';
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
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<'Owner' | 'Staff'>('Owner');

  // If on login page, render clean layout without sidebar
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-cream">
        <head>
          <title>Admin Sign In | Seedly Pakistan</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        {children}
      </div>
    );
  }

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
    <div className="min-h-screen bg-sand flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-seedly-dark text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-seedly-forest">
        <div>
          {/* Logo & Desk Badge */}
          <div className="p-6 border-b border-seedly-forest/60 flex items-center justify-between">
            <div>
              <SeedlyLogo textColor="text-white" size="md" />
              <span className="text-[10px] tracking-widest uppercase font-bold text-seedly-light bg-seedly-forest px-2 py-0.5 rounded-full mt-1 inline-block">
                Operations Desk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              if (item.ownerOnly && currentRole !== 'Owner') {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-seedly-primary text-white font-semibold shadow-subtle'
                      : 'text-seedly-light/80 hover:bg-seedly-forest hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Role & Storefront Link */}
        <div className="p-4 border-t border-seedly-forest/60 space-y-3">
          {/* Active Role Selector */}
          <div className="p-2.5 rounded-xl bg-seedly-forest/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-seedly-light/70 text-[11px]">Active Role:</span>
              <button
                type="button"
                onClick={() => setCurrentRole(currentRole === 'Owner' ? 'Staff' : 'Owner')}
                className="text-[10px] uppercase font-bold text-amber-300 underline"
              >
                Switch
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentRole} ({currentRole === 'Owner' ? 'owner@seedly.pk' : 'staff@seedly.pk'})</span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-seedly-light text-xs font-medium transition-colors"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border-gray px-6 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Seedly Admin Portal
            </span>
            <span className="text-xs text-muted-gray hidden sm:inline">• Pakistan Market Operations</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-gray">
            <div className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-full border border-border-gray">
              <Clock className="w-3.5 h-3.5 text-seedly-primary" />
              <span className="font-mono text-charcoal font-medium">Karachi Time (PKT)</span>
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
