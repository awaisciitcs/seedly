'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Bell,
  Settings,
  ArrowRight,
  ExternalLink,
  X,
  Command,
} from 'lucide-react';
import { formatPKR } from '@/lib/admin-utils';

interface SearchResult {
  id: string;
  type: 'order' | 'product' | 'page';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

const STATIC_PAGES: SearchResult[] = [
  { id: 'p-dash', type: 'page', title: 'Operations Dashboard', subtitle: 'Real-time KPIs, queues & stock', url: '/admin' },
  { id: 'p-orders', type: 'page', title: 'Customer Orders & Receipts', subtitle: 'Inspect, verify & pack orders', url: '/admin/orders', badge: 'Queue' },
  { id: 'p-prod', type: 'page', title: 'Catalog & Inventory', subtitle: 'Manage seed products and variant stock', url: '/admin/products' },
  { id: 'p-kits', type: 'page', title: 'Curated Kits', subtitle: 'Follicular & Luteal blend recipes and stock', url: '/admin/kits' },
  { id: 'p-cust', type: 'page', title: 'Customer Directory', subtitle: 'Customer spend and order histories', url: '/admin/customers' },
  { id: 'p-rev', type: 'page', title: 'Review Moderation', subtitle: 'Customer testimonials and star ratings', url: '/admin/reviews' },
  { id: 'p-alerts', type: 'page', title: 'Back-in-Stock Alerts', subtitle: 'Subscriber waitlists & restock dispatches', url: '/admin/stock-alerts' },
  { id: 'p-sett', type: 'page', title: 'Store Settings', subtitle: 'Meezan bank, JazzCash, delivery rates', url: '/admin/settings' },
];

export function CommandPalette({
  isOpen,
  onClose,
  onSelectOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(STATIC_PAGES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(STATIC_PAGES);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic search query debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(STATIC_PAGES);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const matchingPages = STATIC_PAGES.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.subtitle.toLowerCase().includes(query.toLowerCase())
        );

        // Fetch orders matching query
        const orderRes = await fetch(`/api/admin/orders?search=${encodeURIComponent(query)}`);
        let orderMatches: SearchResult[] = [];
        if (orderRes.ok) {
          const json = await orderRes.json();
          const orders = json?.data || [];
          orderMatches = orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            type: 'order' as const,
            title: `#${o.order_number} · ${o.customer_name}`,
            subtitle: `${o.customer_phone || o.customer_email} · ${formatPKR(o.total_minor)}`,
            url: `/admin/orders?id=${o.id}`,
            badge: o.payment_status === 'UNDER_REVIEW' ? 'Review Needed' : o.order_status,
          }));
        }

        // Fetch products matching query
        const prodRes = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        let prodMatches: SearchResult[] = [];
        if (prodRes.ok) {
          const json = await prodRes.json();
          const products = json?.data || [];
          prodMatches = products.slice(0, 4).map((p: any) => ({
            id: p.id,
            type: 'product' as const,
            title: p.name,
            subtitle: `SKU: ${p.sku} · ${formatPKR(p.price_minor)}`,
            url: `/admin/products`,
            badge: p.status,
          }));
        }

        setResults([...matchingPages, ...orderMatches, ...prodMatches]);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Command search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    onClose();
    if (item.type === 'order' && onSelectOrder) {
      onSelectOrder(item.id);
    } else {
      router.push(item.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#021a10]/55 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="glass w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-150"
        data-elev="overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-botanical-sage shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search orders (#SED-...), customer phone, name, or SKUs... (Esc to close)"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-white/75 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/10">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {loading && (
            <div className="py-6 text-center text-xs text-botanical-sage animate-pulse">
              Searching Pakistan database...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-10 text-center text-xs text-botanical-sage">
              No matching orders, products, or commands found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!loading &&
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              let Icon = ArrowRight;
              if (item.type === 'order') Icon = ShoppingBag;
              if (item.type === 'product') Icon = Package;
              if (item.type === 'page') Icon = Layers;

              return (
                <button
                  key={`${item.type}-${item.id}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'text-white/80 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-lime text-botanical-deep font-bold' : 'glass-inset text-white/70'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-white">{item.title}</div>
                      <div className="text-[11px] text-botanical-sage truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-botanical-sage bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <Command className="w-3 h-3" />
            <span>Seedly Quick Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
