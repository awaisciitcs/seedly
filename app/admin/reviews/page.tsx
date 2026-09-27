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
  Sparkles,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Customer Reviews & Feedback</h1>
          <p className="text-xs text-muted-gray mt-1">
            Moderate submitted botanical reviews. Only approved reviews appear on customer product pages.
          </p>
        </div>
        <button
          onClick={fetchReviews}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-muted-gray mb-1">
            <span>Total Reviews</span>
            <MessageSquare className="w-3.5 h-3.5 text-seedly-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal">{totalReviews}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-card">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Needs Moderation</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-2xl font-bold text-amber-700">{pendingCount}</p>
            {pendingCount > 0 && (
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-700">{approvedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-rose-700">{rejectedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-gray shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-muted-gray mb-1">
            <span>Avg Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal">{averageRating} / 5.0</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl border border-border-gray p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/30 border border-border-gray rounded-xl text-xs focus:outline-none focus:border-seedly-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Reviews Table / List */}
      <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-gray">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-muted-gray/50 mx-auto" />
            <p className="text-sm font-semibold text-charcoal">No reviews match your filters</p>
            <p className="text-xs text-muted-gray">Try switching the status filter tab or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-border-gray text-muted-gray uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Product & Date</th>
                  <th className="py-4 px-6">Customer & Rating</th>
                  <th className="py-4 px-6">Review Content</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray/50">
                {filteredReviews.map((rev) => {
                  const isPending = rev.status === 'PENDING';
                  const isApproved = rev.status === 'APPROVED';
                  const isRejected = rev.status === 'REJECTED';
                  const isBusy = actionLoadingId === rev.id;

                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-cream/30 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Product & Date */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-charcoal">{rev.product_name}</p>
                          <p className="text-[11px] text-muted-gray">{formatDate(rev.created_at)}</p>
                          <span className="text-[10px] text-muted-gray/70 font-mono">
                            ID: {rev.id.slice(0, 12)}
                          </span>
                        </div>
                      </td>

                      {/* Customer & Rating */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-charcoal">
                            <span>{rev.customer_name}</span>
                            {rev.verified_purchase && (
                              <span title="Verified Customer">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-500 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-border-gray fill-transparent'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-charcoal ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="space-y-1">
                          <p className="font-bold text-charcoal">{rev.title}</p>
                          <p className="text-muted-gray text-[11px] leading-relaxed">
                            "{rev.body}"
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{rev.status}</span>
                        </span>
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isApproved && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-subtle disabled:opacity-50"
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
                              className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-[11px] transition-all flex items-center gap-1 shadow-subtle disabled:opacity-50"
                              title="Reject and hide review"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            disabled={isBusy}
                            onClick={() => handleDelete(rev.id)}
                            className="p-1.5 rounded-xl text-muted-gray hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete review"
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
