'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide your admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Invalid administrator credentials. Access restricted.');
        setLoading(false);
        return;
      }

      // Check admin status via /api/admin/me
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        await supabase.auth.signOut();
        setError(errorJson?.error?.message || 'Access denied: account is not an authorized active administrator.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign-in.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel-3d rounded-3xl p-8 sm:p-10 border border-white/15 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-3">
          {/* Logo */}
          <div className="flex justify-center mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center text-botanical-deep shadow-[0_0_15px_rgba(183,228,89,0.5)]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-10 6-1.5 3-1 6.5-1 6.5s2.5-.5 5.5-2.5C18.5 11.5 19 8 19 8Z" />
                </svg>
              </div>
              <span className="font-serif text-3xl font-bold tracking-tight text-white lowercase">seedly</span>
            </div>
          </div>

          <span className="text-[9px] uppercase font-bold font-mono tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 inline-block shadow-[0_0_8px_rgba(34,197,94,0.2)]">
            INTERNAL OPERATIONS PORTAL
          </span>

          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">Sign In to Operations Desk</h1>
          <p className="text-xs text-botanical-sage">
            Authoritative inventory control, order fulfillment &amp; payment verification.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="owner@seedly.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-botanical-sage/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset requests must be processed by the system owner or via Supabase Admin.')}
                className="text-[11px] text-lime hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-botanical-sage/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-lime-3d w-full py-3 rounded-xl font-bold text-xs transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-botanical-deep" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-xs text-botanical-sage hover:text-white transition-colors"
          >
            ← Return to Seedly Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
