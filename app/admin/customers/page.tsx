import React from 'react';
import { getOrders } from '../../../lib/services/orders';
import { formatPKR, formatDate } from '../../../lib/utils';
import { Users, Mail, Phone, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(20,184,166,0.2)]',
  'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
  'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
];

export default async function AdminCustomersPage() {
  const orders = await getOrders();

  // Aggregate customers from orders
  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      city: string;
      orderCount: number;
      totalSpendMinor: number;
      lastOrderDate: string;
    }
  >();

  for (const o of orders) {
    const key = o.customer_email.toLowerCase();
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpendMinor += o.total_minor;
      if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.created_at;
      }
    } else {
      customerMap.set(key, {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        city: o.shipping_city,
        orderCount: 1,
        totalSpendMinor: o.total_minor,
        lastOrderDate: o.created_at,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs text-botanical-sage mt-1">
          Inspect customer order frequency, total lifetime spend, and contact channels.
        </p>
      </div>

      {/* Main Glass Table Container */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email or phone..."
              className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-2xl text-xs placeholder:text-botanical-sage/60"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3.5 px-4 font-semibold">CONTACT CHANNELS</th>
                <th className="py-3.5 px-4 font-semibold">PRIMARY CITY</th>
                <th className="py-3.5 px-4 font-semibold">TOTAL ORDERS</th>
                <th className="py-3.5 px-4 font-semibold">LIFETIME VALUE (PKR)</th>
                <th className="py-3.5 px-4 font-semibold text-right">LAST ORDER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-botanical-sage text-xs">
                    No customer records yet. Customers are cataloged automatically as orders are placed.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => {
                  const initial = (c.name || 'C').charAt(0).toUpperCase();
                  const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <tr key={c.email} className="hover:bg-white/[0.03] transition-colors">
                      {/* CUSTOMER */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${colorClass}`}
                          >
                            {initial}
                          </div>
                          <span className="font-semibold text-white whitespace-nowrap text-xs">
                            {c.name}
                          </span>
                        </div>
                      </td>

                      {/* CONTACT CHANNELS */}
                      <td className="py-4 px-4 whitespace-nowrap space-y-1">
                        <p className="flex items-center gap-1.5 text-white/80">
                          <Mail className="w-3.5 h-3.5 text-lime shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-botanical-sage font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{c.phone}</span>
                        </p>
                      </td>

                      {/* PRIMARY CITY */}
                      <td className="py-4 px-4 text-white/90 whitespace-nowrap font-medium">
                        {c.city}
                      </td>

                      {/* TOTAL ORDERS */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/90 border border-white/10 font-mono text-[10px] font-bold">
                          {c.orderCount} order{c.orderCount === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* LIFETIME VALUE */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {formatPKR(c.totalSpendMinor)}
                      </td>

                      {/* LAST ORDER */}
                      <td className="py-4 px-4 text-right text-botanical-sage whitespace-nowrap">
                        {formatDate(c.lastOrderDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-botanical-sage">
          <p>
            Showing 1–{customers.length} of {customers.length} customers
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded-lg bg-lime text-botanical-deep font-bold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(183,228,89,0.4)]">
              1
            </span>
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
