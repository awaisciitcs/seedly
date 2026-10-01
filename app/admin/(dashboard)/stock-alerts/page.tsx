'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { StockAlertSubscription } from '@/lib/types';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Send,
  RefreshCw,
  Mail,
  Package,
} from 'lucide-react';

export default function AdminStockAlertsPage() {
  const [subscriptions, setSubscriptions] = useState<StockAlertSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock-alerts');
      const json = await res.json();
      setSubscriptions(json.data || []);
    } catch {
      setNotification({ type: 'error', message: 'Failed to fetch stock alert subscriptions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleTriggerAlert = async (id: string, title: string) => {
    setActionLoadingId(id);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_alert', subscriptionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to dispatch alert');

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'NOTIFIED', notified_at: new Date().toISOString() } : s))
      );
      setNotification({
        type: 'success',
        message: `Back-in-stock alert successfully sent for "${title}"!`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Action failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscription?')) return;
    setActionLoadingId(id);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/stock-alerts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Deletion failed');

      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      setNotification({ type: 'success', message: 'Subscription removed' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Deletion failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const total = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const notifiedCount = subscriptions.filter((s) => s.status === 'NOTIFIED').length;
  const unsubscribedCount = subscriptions.filter((s) => s.status === 'UNSUBSCRIBED').length;

  const filtered = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === 'ALL' || sub.status === filterStatus;
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.sellable_title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Back-In-Stock Alerts
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Track customer demand for out-of-stock items and manage automated restock notifications.
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="glass-btn-3d inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-lime ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
              : 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-botanical-sage mb-1">
            <span>Total Requests</span>
            <Bell className="w-3.5 h-3.5 text-lime" />
          </div>
          <p className="font-serif text-2xl font-bold text-white">{total}</p>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
            <span>Waiting for Stock</span>
            <Package className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-2xl font-bold text-amber-300">{activeCount}</p>
            {activeCount > 0 && (
              <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                Unfulfilled Demand
              </span>
            )}
          </div>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span>Notified (Restocked)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-300">{notifiedCount}</p>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-botanical-sage mb-1">
            <span>Unsubscribed</span>
            <Mail className="w-3.5 h-3.5 text-botanical-sage" />
          </div>
          <p className="font-serif text-2xl font-bold text-white">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel-3d rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${total})` },
            { id: 'ACTIVE', label: `Waiting (${activeCount})`, highlight: activeCount > 0 },
            { id: 'NOTIFIED', label: `Notified (${notifiedCount})` },
            { id: 'UNSUBSCRIBED', label: `Unsubscribed (${unsubscribedCount})` },
          ].map((tab) => {
            const active = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'btn-lime-3d font-bold'
                    : tab.highlight
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 font-semibold'
                    : 'glass-btn-3d font-medium hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-botanical-sage absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email or product title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input-3d w-full pl-9 pr-4 py-2 rounded-xl text-xs placeholder:text-botanical-sage/60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-botanical-sage">Loading stock alert subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="w-8 h-8 text-botanical-sage/40 mx-auto" />
            <p className="text-sm font-semibold text-white">No alert subscriptions found</p>
            <p className="text-xs text-botanical-sage">Subscribers will appear here when an out-of-stock item is requested.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 font-semibold">Product / Sellable</th>
                  <th className="py-3.5 px-4 font-semibold">Customer Email</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Requested On</th>
                  <th className="py-3.5 px-4 font-semibold">Notified On</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((sub) => {
                  const isWaiting = sub.status === 'ACTIVE';
                  const isNotified = sub.status === 'NOTIFIED';
                  const isBusy = actionLoadingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isWaiting ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-lime shrink-0" />
                          <div>
                            <p className="font-semibold text-white">{sub.sellable_title}</p>
                            <span className="text-[10px] text-botanical-sage/70 font-mono">
                              ID: {sub.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Mail className="w-3.5 h-3.5 text-botanical-sage" />
                          <span>{sub.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                            isWaiting
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                              : isNotified
                              ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                              : 'bg-white/10 text-white/80 border-white/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isWaiting ? 'bg-amber-400' : isNotified ? 'bg-emerald-400' : 'bg-white/60'
                            }`}
                          />
                          <span>{sub.status === 'ACTIVE' ? 'WAITING' : sub.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-botanical-sage whitespace-nowrap">
                        {formatDate(sub.created_at)}
                      </td>

                      <td className="py-4 px-4 text-botanical-sage whitespace-nowrap">
                        {sub.notified_at ? formatDate(sub.notified_at) : '—'}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isWaiting && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleTriggerAlert(sub.id, sub.sellable_title)}
                              className="btn-lime-3d px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Send restock email immediately"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Alert</span>
                            </button>
                          )}

                          <button
                            disabled={isBusy}
                            onClick={() => handleDelete(sub.id)}
                            className="glass-btn-3d p-1.5 rounded-xl text-botanical-sage hover:text-rose-400 hover:bg-rose-500/20 border-white/10 cursor-pointer"
                            title="Remove subscription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
