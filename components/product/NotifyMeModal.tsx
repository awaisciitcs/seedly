'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border-gray relative animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-gray hover:text-charcoal hover:bg-cream transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-charcoal">You're On The List!</h3>
              <p className="text-xs text-muted-gray leading-relaxed max-w-xs mx-auto">
                We'll email <span className="font-semibold text-charcoal">{email}</span> the moment <strong className="text-charcoal font-semibold">{displayTitle}</strong> is replenished and ready for dispatch.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-seedly-dark text-white text-xs font-semibold hover:bg-seedly-forest transition-colors shadow-subtle"
              >
                Got It
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                <Bell className="w-3 h-3 text-amber-600" />
                <span>Restock Notification</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                Notify Me When Available
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                <span className="font-semibold text-charcoal">{displayTitle}</span> is currently out of stock. Leave your email and our Lahore operations desk will notify you immediately once restocked.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal">
                Email Address *
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-xs focus:outline-none focus:border-seedly-primary focus:bg-white transition-all"
              />
              <p className="text-xs text-muted-gray">
                We&apos;ll only email you about this specific product restock. Unsubscribe anytime with 1 click.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-seedly-dark hover:bg-seedly-forest text-white text-xs font-semibold transition-all shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{loading ? 'Subscribing...' : 'Send Me Restock Alert'}</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 rounded-xl border border-border-gray text-muted-gray hover:text-charcoal text-xs font-semibold"
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
