'use client';

import React, { useState } from 'react';
import { X, Search, PackageCheck, AlertCircle, Loader2 } from 'lucide-react';
import { formatPKR } from '../../lib/utils';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [orderQuery, setOrderQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError('');
    setOrderResult(null);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.data && data.data.length > 0) {
        setOrderResult(data.data[0]);
      } else {
        setError('No active order found with this Order ID or Phone Number. Please check and try again.');
      }
    } catch {
      setError('Unable to reach order tracking service. Please try again or WhatsApp our helpline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Track your order"
    >
      <div className="card-brutal w-full max-w-lg bg-paper p-6 sm:p-8 animate-fadeIn relative">
        <button
          type="button"
          onClick={onClose}
          className="btn-brutal absolute right-5 top-5 h-9 w-9 bg-white text-ink hover:bg-seed-lime"
          aria-label="Close track order modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full border-2 border-ink bg-seed-lime flex items-center justify-center shadow-brutal-sm">
            <PackageCheck className="h-5 w-5 text-ink" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
              Track Your Order
            </h2>
            <p className="text-xs text-muted-gray">Dispatched from our Lahore pantry</p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="mt-4 space-y-4">
          <div>
            <label htmlFor="order-search" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Order ID or Phone Number
            </label>
            <div className="relative">
              <input
                id="order-search"
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="e.g. SED-1042 or 03001234567"
                required
                className="w-full rounded-full border-2 border-ink bg-white px-5 py-3 text-sm text-ink placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-seed-lime shadow-brutal-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-brutal absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-seed-lime text-ink text-xs font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-[16px] border-2 border-ink bg-kit-coral/15 p-3.5 text-xs font-medium text-ink flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-kit-coral shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {orderResult && (
          <div className="mt-5 rounded-[20px] border-2 border-ink bg-white p-4 shadow-brutal-sm">
            <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">Order Reference</span>
                <p className="font-heading font-extrabold text-base text-ink">{orderResult.order_number || orderResult.id}</p>
              </div>
              <span className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-[11px] font-extrabold text-ink uppercase tracking-wider shadow-brutal-sm">
                {orderResult.status || 'CONFIRMED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-muted-gray">Recipient:</span>
                <p className="font-bold text-ink">{orderResult.customer_name || 'Customer'}</p>
              </div>
              <div>
                <span className="text-muted-gray">Destination:</span>
                <p className="font-bold text-ink">{orderResult.shipping_city || 'Pakistan'}</p>
              </div>
              <div>
                <span className="text-muted-gray">Payment Method:</span>
                <p className="font-bold text-ink uppercase">{orderResult.payment_method || 'Cash on Delivery'}</p>
              </div>
              <div>
                <span className="text-muted-gray">Total:</span>
                <p className="font-bold text-ink">{formatPKR(orderResult.total_minor || 0)}</p>
              </div>
            </div>

            {orderResult.tracking_number && (
              <div className="rounded-full border-2 border-ink bg-pistachio-sage/40 px-3.5 py-1.5 text-xs flex items-center justify-between">
                <span className="font-medium text-ink">Courier Tracking:</span>
                <span className="font-mono font-bold text-ink">{orderResult.tracking_number}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-4 border-t-2 border-ink/10 text-center">
          <p className="text-xs text-muted-gray">
            Need urgent assistance?{' '}
            <a
              href="https://wa.me/923719055758?text=Hi%20Seedly%2C%20I%20need%20help%20tracking%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-ink underline hover:text-seed-lime transition-colors"
            >
              Chat on WhatsApp: 0371 9055758
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
