'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SeedlyLogo } from '../../../components/ui/SeedlyLogo';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-border-gray shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <SeedlyLogo size="lg" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-seedly-dark bg-seedly-light px-3 py-1 rounded-full inline-block">
            Internal Operations Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Sign In to Seedly Admin</h1>
          <p className="text-xs text-muted-gray">
            Authoritative inventory control, order fulfillment &amp; payment verification.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="owner@seedly.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50 text-charcoal"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset requests must be processed by the system owner or via Supabase Admin.')}
                className="text-[11px] text-seedly-dark hover:underline font-medium"
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
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50 text-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-seedly-dark hover:bg-seedly-forest disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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

        <div className="pt-4 border-t border-border-gray/70 text-center">
          <Link
            href="/"
            className="text-xs text-muted-gray hover:text-charcoal transition-colors"
          >
            ← Return to Seedly Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
