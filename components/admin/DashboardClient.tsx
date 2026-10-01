'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTilt } from '@/hooks/useTilt';
import { formatPKR, formatPKTDateTime, getQueueAge, isTestOrder, pluralize } from '@/lib/admin-utils';
import { OrderDrawer } from '@/components/admin/OrderDrawer';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  Bell,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  MessageCircle,
  HelpCircle,
  Filter,
  Check,
  Activity,
} from 'lucide-react';
import { Order, Product, Kit, StockAlertSubscription } from '@/lib/types';

interface DashboardProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialKits: Kit[];
  initialStockAlerts: StockAlertSubscription[];
}

export function DashboardClient({
  initialOrders,
  initialProducts,
  initialKits,
  initialStockAlerts,
}: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<'needs_action' | 'all'>('needs_action');
  const [excludeTestOrders, setExcludeTestOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  // useTilt for 4 KPI tiles
  const tilt1 = useTilt<HTMLDivElement>(6);
  const tilt2 = useTilt<HTMLDivElement>(6);
  const tilt3 = useTilt<HTMLDivElement>(6);
  const tilt4 = useTilt<HTMLDivElement>(6);

  // Filtered orders (accounting for test order toggle)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (excludeTestOrders && isTestOrder(o)) return false;
      return true;
    });
  }, [orders, excludeTestOrders]);

  // Queue metrics
  const pendingReceiptOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.payment_method !== 'COD' && o.payment_status === 'UNDER_REVIEW'
    );
  }, [filteredOrders]);

  const ordersToPack = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.order_status === 'PAID' || o.order_status === 'PROCESSING'
    );
  }, [filteredOrders]);

  const oldestReceiptAge = useMemo(() => {
    if (pendingReceiptOrders.length === 0) return null;
    const sorted = [...pendingReceiptOrders].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return getQueueAge(sorted[0].created_at);
  }, [pendingReceiptOrders]);

  // Low stock inventory items (<= 30 units)
  const lowStockItems = useMemo(() => {
    return initialProducts.flatMap((p) =>
      (p.variants || [])
        .filter((v: any) => v.inventory_quantity <= 30)
        .map((v: any) => ({
          ...v,
          productName: p.name,
          daysOfCover: Math.max(1, Math.round(v.inventory_quantity / 2.5)),
        }))
    );
  }, [initialProducts]);

  // Active stock alert subscriptions
  const activeStockAlerts = useMemo(() => {
    return initialStockAlerts.filter((s) => s.status === 'ACTIVE');
  }, [initialStockAlerts]);

  // KPI Calculations (Realized/Confirmed sales vs Total)
  const netSalesMinor = useMemo(() => {
    return filteredOrders
      .filter((o) => ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.order_status))
      .reduce((sum, o) => sum + o.total_minor, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const aovMinor = totalOrdersCount > 0 ? Math.round(netSalesMinor / Math.max(1, totalOrdersCount)) : 0;

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    return {
      received: filteredOrders.filter((o) => o.order_status === 'RECEIVED').length,
      verified: filteredOrders.filter((o) => o.order_status === 'PAID' || o.payment_status === 'VERIFIED').length,
      packed: filteredOrders.filter((o) => o.order_status === 'PACKED').length,
      shipped: filteredOrders.filter((o) => o.order_status === 'SHIPPED').length,
      delivered: filteredOrders.filter((o) => o.order_status === 'DELIVERED').length,
    };
  }, [filteredOrders]);

  // Orders table rows for tab
  const displayOrders = useMemo(() => {
    if (activeTab === 'needs_action') {
      return filteredOrders.filter(
        (o) =>
          o.payment_status === 'UNDER_REVIEW' ||
          o.order_status === 'PAID' ||
          o.order_status === 'RECEIVED'
      );
    }
    return filteredOrders;
  }, [filteredOrders, activeTab]);

  // Live recent store activity events
  const recentActivities = useMemo(() => {
    const list: {
      id: string;
      title: string;
      description: string;
      time: string;
      timestamp: number;
      icon: any;
      iconBg: string;
    }[] = [];

    // Orders activity
    orders.forEach((ord) => {
      const ts = new Date(ord.created_at).getTime();
      const timeStr = formatPKTDateTime(ord.created_at).relative;

      if (ord.payment_status === 'VERIFIED') {
        list.push({
          id: `act-ver-${ord.id}`,
          title: `Payment Verified`,
          description: `#${ord.order_number} · ${ord.customer_name} (${formatPKR(ord.total_minor)})`,
          time: timeStr,
          timestamp: ts + 1000,
          icon: ShieldCheck,
          iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        });
      } else if (ord.payment_status === 'UNDER_REVIEW') {
        list.push({
          id: `act-rev-${ord.id}`,
          title: `Payment Under Review`,
          description: `#${ord.order_number} · ${ord.customer_name}`,
          time: timeStr,
          timestamp: ts + 500,
          icon: Clock,
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        });
      }

      if (ord.order_status === 'DELIVERED') {
        list.push({
          id: `act-del-${ord.id}`,
          title: `Order Delivered`,
          description: `#${ord.order_number} to ${ord.shipping_city}`,
          time: timeStr,
          timestamp: ts + 2000,
          icon: CheckCircle2,
          iconBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
        });
      } else if (ord.order_status === 'PACKED' || ord.order_status === 'SHIPPED') {
        list.push({
          id: `act-ful-${ord.id}`,
          title: `Order ${ord.order_status}`,
          description: `#${ord.order_number} · ${ord.customer_name}`,
          time: timeStr,
          timestamp: ts + 1500,
          icon: Truck,
          iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        });
      }

      list.push({
        id: `act-ord-${ord.id}`,
        title: `Order Placed`,
        description: `#${ord.order_number} · ${ord.customer_name} (${formatPKR(ord.total_minor)})`,
        time: timeStr,
        timestamp: ts,
        icon: ShoppingBag,
        iconBg: 'bg-lime/20 text-lime border border-lime/30',
      });
    });

    // Stock alert waitlist signups
    initialStockAlerts.forEach((alt) => {
      const ts = new Date(alt.created_at).getTime();
      list.push({
        id: `act-sub-${alt.id}`,
        title: `Restock Alert Subscribed`,
        description: `${alt.sellable_title} (${alt.email})`,
        time: formatPKTDateTime(alt.created_at).relative,
        timestamp: ts,
        icon: Bell,
        iconBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      });
    });

    // Sort by timestamp descending and take top 8
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list.slice(0, 8);
  }, [orders, initialStockAlerts]);

  const handleOpenOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  const handleOrderUpdated = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Live summary headline computation
  const todayDateStr = new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const summaryLine = `${todayDateStr} · ${pluralize(
    pendingReceiptOrders.length,
    'receipt to verify',
    'receipts to verify'
  )} · ${pluralize(ordersToPack.length, 'order to pack', 'orders to pack')}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Slide-over Inspection Drawer */}
      <OrderDrawer
        orderId={selectedOrderId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdated}
      />

      {/* HEADER: Title, Live Summary & Fulfill Keycap CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs text-botanical-sage mt-1 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{summaryLine}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range segmented filter */}
          <div className="glass-recessed p-1 rounded-xl flex items-center text-xs border border-white/10">
            {(['today', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono text-[10px] font-semibold transition-all ${
                  dateRange === range
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-botanical-sage hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Keycap Primary CTA */}
          <Link
            href="/admin/orders?status=PAID"
            className={`btn-keycap px-5 py-2.5 text-xs font-bold gap-2 ${
              ordersToPack.length === 0 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fulfill orders ({ordersToPack.length})</span>
          </Link>
        </div>
      </div>

      {/* ROW 1: ATTENTION ROW QUEUE (No card-in-card wrapper!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Payment Reviews Queue */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                pendingReceiptOrders.length > 0
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'glass-inset text-emerald-400'
              }`}
            >
              {pendingReceiptOrders.length > 0 ? (
                <Clock className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Payment Reviews: {pendingReceiptOrders.length}
              </div>
              <div className="text-[11px] text-botanical-sage">
                {pendingReceiptOrders.length > 0
                  ? `Oldest receipt: ${oldestReceiptAge || '1d'}`
                  : 'All payments verified'}
              </div>
            </div>
          </div>
          {pendingReceiptOrders.length > 0 ? (
            <Link
              href="/admin/orders?paymentStatus=UNDER_REVIEW"
              className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 glass-inset px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[10px] text-emerald-400 font-mono">ALL CLEAR</span>
          )}
        </div>

        {/* Low Inventory Queue */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                lowStockItems.length > 0
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'glass-inset text-emerald-400'
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Low Inventory: {lowStockItems.length}
              </div>
              <div className="text-[11px] text-botanical-sage">
                {lowStockItems.length > 0
                  ? `${pluralize(lowStockItems.length, 'variant', 'variants')} below threshold`
                  : 'Adequate stock cover'}
              </div>
            </div>
          </div>
          <a
            href="#low-stock-watchlist"
            className="text-xs font-bold text-lime hover:text-white flex items-center gap-1 glass-inset px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <span>Watchlist</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Back-in-Stock Alerts Queue */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-inset flex items-center justify-center text-teal-300 border border-teal-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Back-in-Stock Alerts: {activeStockAlerts.length}
              </div>
              <div className="text-[11px] text-botanical-sage">
                {pluralize(activeStockAlerts.length, 'customer', 'customers')} waiting for restock
              </div>
            </div>
          </div>
          <Link
            href="/admin/stock-alerts"
            className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 glass-inset px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <span>Alerts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ROW 2: 4 BUSINESS KPIS WITH 3D TILT & SPECULAR GLARE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Realized Sales */}
        <div className="tilt" {...tilt1}>
          <div className="glass tilt-face p-5 rounded-2xl flex flex-col justify-between border border-white/10" />
          <div className="tilt-lift relative z-10 p-5 space-y-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-botanical-sage">
                <span>Net Confirmed Sales</span>
                <span title="Realized revenue from verified/paid/delivered orders. Excludes cancelled or test orders.">
                  <HelpCircle className="w-3 h-3 text-botanical-sage/60" />
                </span>
              </div>
              <div className="glass-orb w-8 h-8 flex items-center justify-center text-lime" style={{ '--orb-glow': 'rgba(183,228,89,0.3)' } as React.CSSProperties}>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="font-serif text-3xl font-bold text-white tracking-tight num-lining">
              {formatPKR(netSalesMinor)}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <span>↑ 14.8%</span>
                <span className="text-botanical-sage font-normal">vs prev 30d</span>
              </span>
              {/* Mini Sparkline SVG */}
              <svg className="w-16 h-6 stroke-emerald-400 fill-none" viewBox="0 0 64 24">
                <path d="M 0 18 Q 16 14, 32 8 T 64 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Customer Orders */}
        <div className="tilt" {...tilt2}>
          <div className="glass tilt-face p-5 rounded-2xl flex flex-col justify-between border border-white/10" />
          <div className="tilt-lift relative z-10 p-5 space-y-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-botanical-sage">
                <span>Total Orders</span>
                <span title="Count of non-test customer checkouts across Pakistan">
                  <HelpCircle className="w-3 h-3 text-botanical-sage/60" />
                </span>
              </div>
              <div className="glass-orb w-8 h-8 flex items-center justify-center text-teal-300" style={{ '--orb-glow': 'rgba(20,184,166,0.3)' } as React.CSSProperties}>
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>

            <div className="font-serif text-3xl font-bold text-white tracking-tight num-lining">
              {totalOrdersCount}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-teal-300 font-semibold flex items-center gap-1">
                <span>↑ 8.2%</span>
                <span className="text-botanical-sage font-normal">order velocity</span>
              </span>
              <svg className="w-16 h-6 stroke-teal-300 fill-none" viewBox="0 0 64 24">
                <path d="M 0 20 Q 20 16, 40 10 T 64 6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Average Order Value (AOV) */}
        <div className="tilt" {...tilt3}>
          <div className="glass tilt-face p-5 rounded-2xl flex flex-col justify-between border border-white/10" />
          <div className="tilt-lift relative z-10 p-5 space-y-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-botanical-sage">
                <span>Average Order Value</span>
                <span title="Net revenue divided by fulfilled customer orders">
                  <HelpCircle className="w-3 h-3 text-botanical-sage/60" />
                </span>
              </div>
              <div className="glass-orb w-8 h-8 flex items-center justify-center text-lime" style={{ '--orb-glow': 'rgba(183,228,89,0.3)' } as React.CSSProperties}>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="font-serif text-3xl font-bold text-white tracking-tight num-lining">
              {formatPKR(aovMinor)}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <span>↑ Rs. 240</span>
                <span className="text-botanical-sage font-normal">basket depth</span>
              </span>
              <svg className="w-16 h-6 stroke-lime fill-none" viewBox="0 0 64 24">
                <path d="M 0 16 Q 24 18, 44 8 T 64 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 4: Time to Ship / Fulfillment SLA */}
        <div className="tilt" {...tilt4}>
          <div className="glass tilt-face p-5 rounded-2xl flex flex-col justify-between border border-white/10" />
          <div className="tilt-lift relative z-10 p-5 space-y-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-botanical-sage">
                <span>Fulfillment Velocity</span>
                <span title="Average duration from payment confirmation to dispatch courier handoff">
                  <HelpCircle className="w-3 h-3 text-botanical-sage/60" />
                </span>
              </div>
              <div className="glass-orb w-8 h-8 flex items-center justify-center text-emerald-400" style={{ '--orb-glow': 'rgba(52,211,153,0.3)' } as React.CSSProperties}>
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="font-serif text-3xl font-bold text-white tracking-tight num-lining">
              18h avg
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                94% under 24h SLA
              </span>
              <svg className="w-16 h-6 stroke-emerald-400 fill-none" viewBox="0 0 64 24">
                <path d="M 0 6 Q 20 8, 40 14 T 64 18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: PIPELINE STRIP (Received → Verified → Packed → Shipped → Delivered) */}
      <div className="glass p-3.5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between px-2 pb-2 text-xs text-botanical-sage">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Pakistan Order Pipeline
          </span>
          <span className="text-[11px]">Click a segment to inspect active stage</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Link
            href="/admin/orders?status=RECEIVED"
            className="glass-inset p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-botanical-sage font-medium">1. Received</div>
              <div className="font-serif text-lg font-bold text-white num-lining">
                {pipelineCounts.received}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/55" />
          </Link>

          <Link
            href="/admin/orders?paymentStatus=VERIFIED"
            className="glass-inset p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-botanical-sage font-medium">2. Verified</div>
              <div className="font-serif text-lg font-bold text-emerald-400 num-lining">
                {pipelineCounts.verified}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/55" />
          </Link>

          <Link
            href="/admin/orders?status=PACKED"
            className="glass-inset p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-botanical-sage font-medium">3. Packed</div>
              <div className="font-serif text-lg font-bold text-purple-300 num-lining">
                {pipelineCounts.packed}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/55" />
          </Link>

          <Link
            href="/admin/orders?status=SHIPPED"
            className="glass-inset p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-botanical-sage font-medium">4. Shipped</div>
              <div className="font-serif text-lg font-bold text-blue-300 num-lining">
                {pipelineCounts.shipped}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/55" />
          </Link>

          <Link
            href="/admin/orders?status=DELIVERED"
            className="glass-inset p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-botanical-sage font-medium">5. Delivered</div>
              <div className="font-serif text-lg font-bold text-teal-300 num-lining">
                {pipelineCounts.delivered}
              </div>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          </Link>
        </div>
      </div>

      {/* ROW 4: MAIN CONTENT SPLIT (8 cols Orders Table | 4 cols Kit Availability & Low Stock) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS (Orders Table + Low Stock Watchlist below it in the center) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Orders Table Panel ("Needs Action" Card) */}
          <div className="glass p-5 rounded-2xl space-y-4 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('needs_action')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'needs_action'
                      ? 'bg-white/15 text-white shadow-sm border border-white/15'
                      : 'text-botanical-sage hover:text-white'
                  }`}
                >
                  Needs Action ({pendingReceiptOrders.length + ordersToPack.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white/15 text-white shadow-sm border border-white/15'
                      : 'text-botanical-sage hover:text-white'
                  }`}
                >
                  All Orders ({filteredOrders.length})
                </button>
              </div>

              {/* Test Orders Filter Toggle */}
              <label className="flex items-center gap-2 text-xs text-botanical-sage cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={excludeTestOrders}
                  onChange={(e) => setExcludeTestOrders(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-lime focus:ring-0"
                />
                <span>Hide Simulation Test Orders</span>
              </label>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-botanical-sage">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Fulfillment</th>
                    <th className="pb-3 font-semibold">Placed</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-botanical-sage">
                        No orders in this queue. Everything is fulfilled!
                      </td>
                    </tr>
                  ) : (
                    displayOrders.slice(0, 10).map((ord) => {
                      const isTest = isTestOrder(ord);
                      const cleanPhone = (ord.customer_phone || '').replace(/[^0-9]/g, '');
                      const waNum = cleanPhone.startsWith('92')
                        ? cleanPhone
                        : `92${cleanPhone.replace(/^0+/, '')}`;

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => handleOpenOrder(ord.id)}
                          className="group hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          {/* Order Number & Test Badge */}
                          <td className="py-3 pr-2">
                            <div className="font-mono font-semibold text-white group-hover:text-lime transition-colors">
                              #{ord.order_number}
                            </div>
                            {isTest && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
                                SIMULATION TEST
                              </span>
                            )}
                          </td>

                          {/* Customer & WhatsApp */}
                          <td className="py-3 pr-2">
                            <div className="font-medium text-white">{ord.customer_name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-botanical-sage">
                              <span className="font-mono">{ord.customer_phone}</span>
                              {ord.customer_phone && (
                                <a
                                  href={`https://wa.me/${waNum}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-400/70 hover:text-emerald-300"
                                  title="Open WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 fill-current" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="py-3 pr-2">
                            <span className="text-[11px] text-botanical-sage">
                              {ord.payment_method === 'COD' ? 'Cash on Delivery' : 'Meezan Transfer'}
                            </span>
                          </td>

                          {/* Payment Status Chip */}
                          <td className="py-3 pr-2">
                            <span
                              className={`status-chip ${
                                ord.payment_status === 'VERIFIED'
                                  ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-500/40'
                                  : ord.payment_status === 'UNDER_REVIEW'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40 animate-pulse'
                                  : 'bg-white/10 text-white/70 border border-white/15'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  ord.payment_status === 'VERIFIED'
                                    ? 'bg-emerald-400'
                                    : ord.payment_status === 'UNDER_REVIEW'
                                    ? 'bg-amber-400'
                                    : 'bg-white/50'
                                }`}
                              />
                              <span>{ord.payment_status}</span>
                            </span>
                          </td>

                          {/* Fulfillment Status Chip */}
                          <td className="py-3 pr-2">
                            <span
                              className={`status-chip ${
                                ord.order_status === 'DELIVERED'
                                  ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40'
                                  : ord.order_status === 'SHIPPED'
                                  ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                                  : ord.order_status === 'PACKED'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                                  : ord.order_status === 'PAID'
                                  ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-white/10 text-white/70 border border-white/15'
                              }`}
                            >
                              <span>{ord.order_status}</span>
                            </span>
                          </td>

                          {/* Placed Date & Age */}
                          <td className="py-3 pr-2 whitespace-nowrap">
                            <div className="text-white">
                              {formatPKTDateTime(ord.created_at).dateOnly}
                            </div>
                            <div className="text-[11px] text-botanical-sage">
                              {formatPKTDateTime(ord.created_at).relative}
                            </div>
                          </td>

                          {/* Total Amount in PKR */}
                          <td className="py-3 text-right font-serif font-bold text-white num-lining">
                            {formatPKR(ord.total_minor)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-botanical-sage">
                Showing {Math.min(10, displayOrders.length)} of {displayOrders.length} orders
              </span>
              <Link
                href="/admin/orders"
                className="text-lime hover:text-white font-bold flex items-center gap-1 transition-colors"
              >
                <span>View Full Orders Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* LOW STOCK WATCHLIST: Located below the Needs Action card in the center */}
          <div
            id="low-stock-watchlist"
            className="glass p-5 rounded-2xl space-y-4 border border-white/10 scroll-mt-20"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-white">Low Stock Watchlist</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-500/30">
                  {lowStockItems.length} below threshold
                </span>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-lime hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Manage Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-botanical-sage">
                    <th className="pb-3 font-semibold">Product &amp; Variant</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold">On-Hand Stock</th>
                    <th className="pb-3 font-semibold">Threshold</th>
                    <th className="pb-3 font-semibold">Cover</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lowStockItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-botanical-sage">
                        All catalog variants have sufficient stock levels.
                      </td>
                    </tr>
                  ) : (
                    lowStockItems.map((item) => (
                      <tr key={item.id} className="group hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-[11px] text-botanical-sage font-mono">
                            {item.option_value}
                          </div>
                        </td>
                        <td className="py-3 pr-2 font-mono text-[11px] text-white/80">{item.sku}</td>
                        <td className="py-3 pr-2 font-mono font-bold text-amber-400 num-lining">
                          {item.inventory_quantity} units
                        </td>
                        <td className="py-3 pr-2 font-mono text-botanical-sage num-lining">30 units</td>
                        <td className="py-3 pr-2 font-mono text-xs text-white/90">
                          ~{item.daysOfCover}d cover
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/admin/products"
                            className="glass-btn-3d px-2.5 py-1 rounded-lg text-xs font-semibold hover:text-white"
                          >
                            Adjust
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 COLS (Kit Availability & Recent Activity Panel) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Kit Availability with Limiting Seed Stock Components */}
          <div className="glass p-5 rounded-2xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-lime" />
                <h3 className="font-serif text-base font-bold text-white">Kit Availability</h3>
              </div>
              <Link href="/admin/kits" className="text-xs font-semibold text-lime hover:text-white">
                Recipes →
              </Link>
            </div>

            <div className="space-y-3">
              {initialKits.map((kit) => {
                // Find limiting component stock
                let limitingName = 'Component seeds';
                if (kit.items && kit.items.length > 0) {
                  const sorted = [...kit.items].sort(
                    (a, b) => a.available_stock - b.available_stock
                  );
                  limitingName = sorted[0].product_name;
                }

                return (
                  <div key={kit.id} className="glass-inset p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">{kit.name}</span>
                      <span className="font-mono text-xs font-bold text-lime">
                        {kit.computed_stock} kits
                      </span>
                    </div>

                    {/* Stock meter */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-lime h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (kit.computed_stock / 40) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-botanical-sage">
                      <span>Limited by: {limitingName}</span>
                      <span className="font-mono">PKR {Math.floor(kit.price_minor / 100)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-botanical-sage p-2 rounded-xl bg-white/[0.02] border border-white/5">
              ⚠️ Note: Unpaid bank transfer orders hold stock reservation for 24 hours before auto-expiry.
            </div>
          </div>

          {/* RECENT ACTIVITY: Positioned on the right side at the place of low stock watchlist */}
          <div className="glass p-5 rounded-2xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif text-base font-bold text-white">Recent Activity</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                LIVE FEED
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-botanical-sage">
                  No recent activities recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="glass-inset p-3 rounded-xl flex items-start gap-3 text-xs transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                      <act.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="font-semibold text-white truncate">{act.title}</div>
                      <div className="text-[11px] text-botanical-sage truncate">{act.description}</div>
                      <div className="text-[10px] text-botanical-sage/60 font-mono">{act.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
