'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [trackOrderNumber, setTrackOrderNumber] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackOrderNumber.trim()) {
      router.push(`/order/${encodeURIComponent(trackOrderNumber.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Customer Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
          My Seedly Account
        </h1>
        <p className="text-sm text-muted-gray mt-1">
          Manage your botanical orders, delivery tracking, and saved preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Order Quick Tracker */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
              <Package className="w-5 h-5 text-seedly-primary" />
              <span>Track Your Order</span>
            </h2>
            <p className="text-xs text-muted-gray leading-relaxed">
              Enter your Seedly order number (e.g., <strong className="font-mono text-charcoal">SED-20260928-1029</strong>) to inspect live packaging and courier dispatch status across Pakistan.
            </p>

            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order Number"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-cream/40 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold shadow-subtle"
              >
                Track Status
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/account/wishlist"
              className="p-5 rounded-2xl bg-white border border-border-gray shadow-subtle hover:border-seedly-primary transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal">Saved Wishlist</h3>
                <p className="text-[11px] text-muted-gray">Inspect your saved goods</p>
              </div>
            </Link>

            <Link
              href="/find-your-seed"
              className="p-5 rounded-2xl bg-white border border-border-gray shadow-subtle hover:border-seedly-primary transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal">Wellness Quiz</h3>
                <p className="text-[11px] text-muted-gray">Retake recommendation guide</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Side: Account Perks & Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal">Pakistan Customer Care</h3>
            <p className="text-xs text-muted-gray leading-relaxed">
              Need assistance modifying an address or following up on a bank receipt? Our botanical team is available directly via WhatsApp.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <a
                href="https://wa.me/923041117333"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <span>WhatsApp Helpline: +92 304 1117333</span>
              </a>
              <p className="text-[11px] text-muted-gray text-center">
                Operational Mon–Sat from 10:00 AM to 7:00 PM PKT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
