'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { formatPKR, formatPKTDateTime, isTestOrder } from '@/lib/admin-utils';

interface CustomerRecord {
  name: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  totalSpendMinor: number;
  lastOrderDate: string;
  isTest: boolean;
}

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(20,184,166,0.2)]',
  'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
  'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
];

export function CustomersTableClient({ initialCustomers }: { initialCustomers: CustomerRecord[] }) {
  const [search, setSearch] = useState('');
  const [excludeTestAccounts, setExcludeTestAccounts] = useState(true);

  const displayCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      if (excludeTestAccounts && c.isTest) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [initialCustomers, excludeTestAccounts, search]);

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
      <div className="glass p-5 md:p-6 space-y-4 border border-white/10">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or city..."
              className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-2xl text-xs placeholder:text-botanical-sage/60"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <label className="flex items-center gap-2 text-xs text-botanical-sage cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeTestAccounts}
                onChange={(e) => setExcludeTestAccounts(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-lime focus:ring-0"
              />
              <span className="hidden sm:inline">Hide Simulation Accounts</span>
            </label>

            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
              {displayCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-botanical-sage text-xs">
                    No customer records matching search or filter.
                  </td>
                </tr>
              ) : (
                displayCustomers.map((c, idx) => {
                  const initial = (c.name || 'C').charAt(0).toUpperCase();
                  const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                  const waNum = cleanPhone.startsWith('92')
                    ? cleanPhone
                    : `92${cleanPhone.replace(/^0+/, '')}`;

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
                          <div>
                            <span className="font-semibold text-white whitespace-nowrap text-xs block">
                              {c.name}
                            </span>
                            {c.isTest && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
                                SIMULATION TEST
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CONTACT CHANNELS */}
                      <td className="py-4 px-4 whitespace-nowrap space-y-1">
                        <p className="flex items-center gap-1.5 text-white/80">
                          <Mail className="w-3.5 h-3.5 text-lime shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-botanical-sage font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{c.phone}</span>
                          {c.phone && (
                            <a
                              href={`https://wa.me/${waNum}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400/80 hover:text-emerald-300 ml-1"
                              title="Message via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 fill-current inline" />
                            </a>
                          )}
                        </div>
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
                      <td className="py-4 px-4 font-serif font-bold text-white whitespace-nowrap num-lining">
                        {formatPKR(c.totalSpendMinor)}
                      </td>

                      {/* LAST ORDER */}
                      <td className="py-4 px-4 text-right text-botanical-sage whitespace-nowrap">
                        <div>{formatPKTDateTime(c.lastOrderDate).dateOnly}</div>
                        <div className="text-[10px]">{formatPKTDateTime(c.lastOrderDate).relative}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-botanical-sage">
          <p>
            Showing {displayCustomers.length} of {initialCustomers.length} customers
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
