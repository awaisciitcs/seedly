'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '../../../lib/utils';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Search,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Review } from '../../../lib/types';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const json = await res.json();
      setReviews(json.data || []);
    } catch {
      setNotification({ type: 'error', message: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to update review status');

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      setNotification({
        type: 'success',
        message: `Review successfully marked as ${newStatus}`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setActionLoadingId(id);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to delete review');

      setReviews((prev) => prev.filter((r) => r.id !== id));
      setNotification({
        type: 'success',
        message: 'Review deleted successfully',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Deletion failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats calculation
  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reviews.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = reviews.filter((r) => r.status === 'REJECTED').length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  const filteredReviews = reviews.filter((rev) => {
    const matchesStatus = filterStatus === 'ALL' || rev.status === filterStatus;
    const matchesSearch =
      rev.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Customer Reviews &amp; Feedback
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Moderate submitted botanical reviews. Only approved reviews appear on customer product pages.
          </p>
        </div>
        <button
          onClick={fetchReviews}
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
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-botanical-sage mb-1">
            <span>Total Reviews</span>
            <MessageSquare className="w-3.5 h-3.5 text-lime" />
          </div>
          <p className="font-serif text-2xl font-bold text-white">{totalReviews}</p>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
            <span>Needs Moderation</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-2xl font-bold text-amber-300">{pendingCount}</p>
            {pendingCount > 0 && (
              <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                Action Required
              </span>
            )}
          </div>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-300">{approvedCount}</p>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-rose-300">{rejectedCount}</p>
        </div>

        <div className="glass-card-3d p-4 rounded-2xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-botanical-sage mb-1">
            <span>Avg Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-white">{averageRating} / 5.0</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel-3d rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${totalReviews})` },
            { id: 'PENDING', label: `Pending (${pendingCount})`, highlight: pendingCount > 0 },
            { id: 'APPROVED', label: `Approved (${approvedCount})` },
            { id: 'REJECTED', label: `Rejected (${rejectedCount})` },
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

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-botanical-sage absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input-3d w-full pl-9 pr-4 py-2 rounded-xl text-xs placeholder:text-botanical-sage/60"
          />
        </div>
      </div>

      {/* Reviews Table / List */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-botanical-sage">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-botanical-sage/40 mx-auto" />
            <p className="text-sm font-semibold text-white">No reviews match your filters</p>
            <p className="text-xs text-botanical-sage">Try switching the status filter tab or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 font-semibold">Product &amp; Date</th>
                  <th className="py-3.5 px-4 font-semibold">Customer &amp; Rating</th>
                  <th className="py-3.5 px-4 font-semibold">Review Content</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredReviews.map((rev) => {
                  const isPending = rev.status === 'PENDING';
                  const isApproved = rev.status === 'APPROVED';
                  const isRejected = rev.status === 'REJECTED';
                  const isBusy = actionLoadingId === rev.id;

                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isPending ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Product & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">{rev.product_name}</p>
                          <p className="text-[11px] text-botanical-sage">{formatDate(rev.created_at)}</p>
                          <span className="text-[10px] text-botanical-sage/70 font-mono">
                            ID: {rev.id.slice(0, 12)}
                          </span>
                        </div>
                      </td>

                      {/* Customer & Rating */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-white">
                            <span>{rev.customer_name}</span>
                            {rev.verified_purchase && (
                              <span title="Verified Customer">
                                <ShieldCheck className="w-3.5 h-3.5 text-lime" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-white/20 fill-transparent'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-white ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs">{rev.title}</p>
                          <p className="text-botanical-sage text-[11px] leading-relaxed">
                            &quot;{rev.body}&quot;
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                            isApproved
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                              : isPending
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                              : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved
                                ? 'bg-emerald-400'
                                : isPending
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span>{rev.status}</span>
                        </span>
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!isApproved && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                              className="btn-lime-3d px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Approve review for public display"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                              className="glass-btn-3d px-3 py-1.5 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-rose-500/30 font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Reject and hide review"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            disabled={isBusy}
                            onClick={() => handleDelete(rev.id)}
                            className="glass-btn-3d p-1.5 rounded-xl text-botanical-sage hover:text-rose-400 hover:bg-rose-500/20 border-white/10 cursor-pointer"
                            title="Delete review"
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
