'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { minorToPKR, pkrToMinor } from '@/lib/utils';
import { Check, Building, Truck, ShieldCheck, Wallet } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(''), [error, setError] = useState('');
  const [deliveryFeePKR, setDeliveryFeePKR] = useState(''), [freeThresholdPKR, setFreeThresholdPKR] = useState('');
  const [bankName, setBankName] = useState(''), [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState(''), [iban, setIban] = useState('');
  const [jazzcashNumber, setJazzcashNumber] = useState(''), [jazzcashTitle, setJazzcashTitle] = useState('');
  const [easypaisaNumber, setEasypaisaNumber] = useState(''), [easypaisaTitle, setEasypaisaTitle] = useState('');
  const [cities, setCities] = useState('');
  const [orderingEnabled, setOrderingEnabled] = useState(false), [codEnabled, setCodEnabled] = useState(false);
  const [bankEnabled, setBankEnabled] = useState(false), [walletEnabled, setWalletEnabled] = useState(false);
  const savingRef = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/settings', { cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
      const json = await response.json();
      if (!response.ok || !json.data) throw new Error(json.error?.message || 'Store configuration could not be loaded.');
      if (signal?.aborted) return;
      const s: SiteSettings = json.data;
      setSettings(s);
      setDeliveryFeePKR(String(minorToPKR(s.delivery_fee_minor))); setFreeThresholdPKR(String(minorToPKR(s.free_delivery_threshold_minor)));
      setBankName(s.bank_name); setAccountTitle(s.bank_account_title); setAccountNumber(s.bank_account_number); setIban(s.bank_iban);
      setJazzcashNumber(s.jazzcash_number); setJazzcashTitle(s.jazzcash_title); setEasypaisaNumber(s.easypaisa_number); setEasypaisaTitle(s.easypaisa_title);
      setCities(s.serviceable_cities.join('\n'));
      setOrderingEnabled(s.ordering_enabled); setCodEnabled(s.cod_enabled); setBankEnabled(s.bank_transfer_enabled); setWalletEnabled(s.wallet_enabled);
    } catch (error) {
      if (!signal?.aborted) { setSettings(null); setError(error instanceof Error ? error.message : 'Store configuration could not be loaded.'); }
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings || savingRef.current) return;
    setError(''); setSavedMsg('');
    const amount = (value: string, label: string, minimum: number) => {
      if (!/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) < minimum || Number(value) > 1_000_000) throw new Error(label + ' must be a valid amount with at most two decimals.');
      return pkrToMinor(Number(value));
    };
    try {
      const body = {
        serviceable_cities: cities.split(/[\n,]/).map(city => city.trim()).filter(Boolean),
        delivery_fee_minor: amount(deliveryFeePKR, 'Delivery fee', 0), free_delivery_threshold_minor: amount(freeThresholdPKR, 'Free delivery threshold', 0.01),
        bank_name: bankName, bank_account_title: accountTitle, bank_account_number: accountNumber, bank_iban: iban,
        jazzcash_number: jazzcashNumber, jazzcash_title: jazzcashTitle, easypaisa_number: easypaisaNumber, easypaisa_title: easypaisaTitle,
        ordering_enabled: orderingEnabled, cod_enabled: codEnabled, bank_transfer_enabled: bankEnabled, wallet_enabled: walletEnabled,
      };
      savingRef.current = true; setSaving(true);
      const response = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
      const json = await response.json();
      if (!response.ok || !json.data) throw new Error(json.error?.message || 'Settings could not be saved. Please try again.');
      setSettings(json.data); setSavedMsg('Store settings saved. Delivery rates and ordering controls now use this configuration.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Settings could not be saved. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-sm text-botanical-sage" role="status">Loading store configuration?</div>;
  if (!settings) return <div className="max-w-2xl mx-auto p-8 space-y-4"><h1 className="text-2xl font-bold">Store settings unavailable</h1><p role="alert">{error}</p><button className="btn-lime-3d px-5 py-3 rounded-xl" type="button" onClick={() => void load()}>Try again</button></div>;
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
          Store &amp; Payment Settings
        </h1>
        <p className="text-xs text-botanical-sage mt-1">
          Configure delivery rules, payment accounts, and ordering availability.
        </p>
      </div>

      {error && <p role="alert" className="p-4 rounded-xl bg-rose-500/10 text-rose-300">{error}</p>}
      {savedMsg && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_12px_rgba(34,197,94,0.2)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6" aria-busy={saving}>
        <fieldset disabled={saving} className="space-y-6">
        <section className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck size={20} />Ordering controls</h2>
          <p className="text-sm text-botanical-sage">Pausing new orders preserves existing orders and safely recoverable checkout attempts.</p>
          <div className="grid gap-3 sm:grid-cols-2">{[
            { label: "Accept new orders", value: orderingEnabled, update: setOrderingEnabled },
            { label: "Cash on delivery", value: codEnabled, update: setCodEnabled },
            { label: "Bank transfers", value: bankEnabled, update: setBankEnabled },
            { label: "JazzCash / Easypaisa", value: walletEnabled, update: setWalletEnabled },
          ].map(control => <label className="flex items-center gap-3 min-h-11" key={control.label}><input type="checkbox" checked={control.value} onChange={event => control.update(event.target.checked)} />{control.label}</label>)}</div>
          <p className="text-xs text-botanical-sage">Bank and wallet payments also require their complete destination account details.</p>
        </section>
        <section className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold">Branding &amp; customer contact</h2>
          <p className="text-sm text-botanical-sage">Manage the store name, tagline, support email, and WhatsApp details in Website Content. Save a draft, then publish it to update the website and email templates.</p>
          <Link href="/admin/content/site" className="btn-lime-3d inline-flex px-5 py-3 rounded-xl text-sm font-semibold">Edit website branding &amp; contact</Link>
        </section>
        <section className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold">Delivery cities</h2>
          <div><label className="block text-sm mb-1" htmlFor="store-cities">Delivery cities, one per line</label><textarea id="store-cities" className="glass-input-3d w-full px-4 py-3 rounded-xl" rows={5} value={cities} onChange={event => setCities(event.target.value)} required /></div>
        </section>
        {/* Delivery Rates */}
        <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-lime" />
            <span>Shipping &amp; Delivery Rates (PKR)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Standard Nationwide Shipping (PKR)
              </label>
              <input
                type="number"
                min="0" step="0.01" required
                value={deliveryFeePKR}
                onChange={(e) => setDeliveryFeePKR(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm font-bold font-mono text-white"
              />
              <p className="text-[11px] text-botanical-sage mt-1">Applied on orders below the free threshold.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                min="0" step="0.01" required
                value={freeThresholdPKR}
                onChange={(e) => setFreeThresholdPKR(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm font-bold font-mono text-white"
              />
              <p className="text-[11px] text-botanical-sage mt-1">Orders above this qualify for free shipping.</p>
            </div>
          </div>
        </div>

        {/* Mobile Wallet Accounts (JazzCash & Easypaisa) */}
        <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-lime" />
            <span>Official Mobile Wallet Accounts (JazzCash &amp; Easypaisa)</span>
          </h2>
          <p className="text-xs text-botanical-sage">
            These numbers and titles will be displayed to customers at checkout to transfer payment directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* JazzCash */}
            <div className="glass-card-3d p-4 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/30 inline-block">
                JazzCash Account
              </span>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">Account Title</label>
                <input
                  type="text"
                  value={jazzcashTitle}
                  onChange={(e) => setJazzcashTitle(e.target.value)}
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">Account Number</label>
                <input
                  type="text"
                  value={jazzcashNumber}
                  onChange={(e) => setJazzcashNumber(e.target.value)}
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono font-bold"
                />
              </div>
            </div>

            {/* Easypaisa */}
            <div className="glass-card-3d p-4 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                Easypaisa Account
              </span>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">Account Title</label>
                <input
                  type="text"
                  value={easypaisaTitle}
                  onChange={(e) => setEasypaisaTitle(e.target.value)}
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">Account Number</label>
                <input
                  type="text"
                  value={easypaisaNumber}
                  onChange={(e) => setEasypaisaNumber(e.target.value)}
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-lime" />
            <span>Manual Bank Transfer Details (Pakistan)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Account Title
              </label>
              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn-lime-3d px-8 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {saving ? "Saving?" : "Save all store settings"}
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
