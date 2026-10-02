'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  variantId?: string;
  kitId?: string;
  sellableTitle?: string;
  itemTitle?: string;
}

export function NotifyMeModal({
  isOpen,
  onClose,
  productId,
  variantId,
  kitId,
  sellableTitle,
  itemTitle,
}: NotifyMeModalProps) {
  const displayTitle = sellableTitle || itemTitle || 'Selected Item';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stock-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId,
          kitId,
          sellableTitle: displayTitle,
          email: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to subscribe to restock alert');
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setErrorMsg('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full border border-gray-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900">You're On The List!</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto font-normal">
                We'll email <span className="font-semibold text-neutral-900">{email}</span> the moment <strong className="text-neutral-900 font-semibold">{displayTitle}</strong> is replenished and ready for dispatch.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold uppercase tracking-wider">
                <Bell className="w-3 h-3 text-neutral-600" />
                <span>Restock Notification</span>
              </div>
              <h3 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900">
                Notify Me When Available
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-normal">
                <span className="font-semibold text-neutral-900">{displayTitle}</span> is currently out of stock. Leave your email and our Lahore operations desk will notify you immediately once restocked.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all"
              />
              <p className="text-[11px] text-stone-400 font-normal">
                We&apos;ll only email you about this specific product restock. Unsubscribe anytime with 1 click.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{loading ? 'Subscribing...' : 'Send Me Restock Alert'}</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-3 rounded-full border border-gray-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NotifyMeModal;
