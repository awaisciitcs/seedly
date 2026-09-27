'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeedlyLogo } from '../../../components/ui/SeedlyLogo';
import { Lock, ShieldCheck, ArrowRight, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin');
  };

  const handleQuickLogin = (role: 'owner' | 'staff') => {
    setEmail(role === 'owner' ? 'owner@seedly.pk' : 'staff@seedly.pk');
    setPassword('••••••••');
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-border-gray shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <SeedlyLogo size="lg" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-seedly-dark bg-seedly-light px-2.5 py-0.5 rounded-full inline-block">
            Internal Operations Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Sign In to Seedly Admin</h1>
          <p className="text-xs text-muted-gray">Manage catalog inventory, bank transfer receipts & orders.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="owner@seedly.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl font-semibold text-xs transition-all shadow-card flex items-center justify-center gap-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Access */}
        <div className="pt-4 border-t border-border-gray/70 space-y-2">
          <p className="text-[11px] text-muted-gray text-center font-medium">Quick 1-Click Demo Access:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('owner')}
              className="py-2 px-3 rounded-xl border border-border-gray bg-cream/40 hover:bg-cream text-xs font-medium text-charcoal flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Owner Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className="py-2 px-3 rounded-xl border border-border-gray bg-cream/40 hover:bg-cream text-xs font-medium text-charcoal flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-seedly-primary" />
              <span>Staff Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
