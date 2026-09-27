'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '../../../lib/utils';
import { StockAlertSubscription } from '../../../lib/types';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Back-In-Stock Alerts</h1>
          <p className="text-xs text-muted-gray mt-1">
            Track customer demand for out-of-stock items and manage automated restock notifications.
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border-gray bg-white rounded-xl text-xs font-semibold text-charcoal hover:bg-cream/50 transition-colors shadow-subtle self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-muted-gray mb-1">
            <span>Total Requests</span>
            <Bell className="w-3.5 h-3.5 text-seedly-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal">{total}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-card">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Waiting for Stock</span>
            <Package className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-2xl font-bold text-amber-700">{activeCount}</p>
            {activeCount > 0 && (
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                Unfulfilled Demand
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>Notified (Restocked)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-700">{notifiedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-muted-gray mb-1">
            <span>Unsubscribed</span>
            <Mail className="w-3.5 h-3.5 text-muted-gray" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl border border-border-gray p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-seedly-dark text-white shadow-subtle'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    : 'bg-cream/60 text-charcoal hover:bg-cream border border-border-gray/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email or product title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/30 border border-border-gray rounded-xl text-xs focus:outline-none focus:border-seedly-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-gray">Loading stock alert subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="w-8 h-8 text-muted-gray/50 mx-auto" />
            <p className="text-sm font-semibold text-charcoal">No alert subscriptions found</p>
            <p className="text-xs text-muted-gray">Subscribers will appear here when an out-of-stock item is requested.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-border-gray text-muted-gray uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Product / Sellable</th>
                  <th className="py-4 px-6">Customer Email</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Requested On</th>
                  <th className="py-4 px-6">Notified On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray/50">
                {filtered.map((sub) => {
                  const isActive = sub.status === 'ACTIVE';
                  const isNotified = sub.status === 'NOTIFIED';
                  const isBusy = actionLoadingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-charcoal">
                        {sub.sellable_title}
                      </td>
                      <td className="py-4 px-6 font-mono text-charcoal">
                        {sub.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            isActive
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isNotified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {isActive && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {isNotified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-gray">
                        {formatDate(sub.created_at)}
                      </td>
                      <td className="py-4 px-6 text-muted-gray">
                        {sub.notified_at ? formatDate(sub.notified_at) : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isActive && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleTriggerAlert(sub.id, sub.sellable_title)}
                              className="px-3 py-1.5 rounded-xl bg-seedly-dark hover:bg-seedly-forest text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-subtle disabled:opacity-50"
                              title="Manually dispatch restock alert"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch Alert</span>
                            </button>
                          )}
                          <button
                            disabled={isBusy}
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 rounded-xl text-muted-gray hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete subscription"
                          >
                            <Trash2 className="w-4 h-4" />
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
