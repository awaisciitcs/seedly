'use client';

import React, { useEffect, useState } from 'react';
import { formatPKR, minorToPKR, pkrToMinor } from '@/lib/utils';
import { Settings, Check, Building, Truck, Phone, ShieldCheck, Wallet } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  // Form states
  const [deliveryFeePKR, setDeliveryFeePKR] = useState(200);
  const [freeThresholdPKR, setFreeThresholdPKR] = useState(2500);
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [jazzcashNumber, setJazzcashNumber] = useState('');
  const [jazzcashTitle, setJazzcashTitle] = useState('');
  const [easypaisaNumber, setEasypaisaNumber] = useState('');
  const [easypaisaTitle, setEasypaisaTitle] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const s = json.data;
          setSettings(s);
          setDeliveryFeePKR(minorToPKR(s.delivery_fee_minor));
          setFreeThresholdPKR(minorToPKR(s.free_delivery_threshold_minor));
          setBankName(s.bank_name || 'Meezan Bank Limited');
          setAccountTitle(s.bank_account_title || 'Seedly Naturals Pakistan');
          setAccountNumber(s.bank_account_number || '0102-0104882910');
          setIban(s.bank_iban || 'PK36MEZN0001020104882910');
          setJazzcashNumber(s.jazzcash_number || '0371 9055758');
          setJazzcashTitle(s.jazzcash_title || 'Seedly Care');
          setEasypaisaNumber(s.easypaisa_number || '0371 9055758');
          setEasypaisaTitle(s.easypaisa_title || 'Seedly Care');
          setWhatsapp(s.whatsapp_number || '+92 371 9055758');
          setEmail(s.support_email || 'care@seedly.pk');
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_fee_minor: String(pkrToMinor(deliveryFeePKR)),
          free_delivery_threshold_minor: String(pkrToMinor(freeThresholdPKR)),
          bank_name: bankName,
          bank_account_title: accountTitle,
          bank_account_number: accountNumber,
          bank_iban: iban,
          jazzcash_number: jazzcashNumber,
          jazzcash_title: jazzcashTitle,
          easypaisa_number: easypaisaNumber,
          easypaisa_title: easypaisaTitle,
          whatsapp_number: whatsapp,
          support_email: email,
        }),
      });

      if (res.ok) {
        setSavedMsg('Store settings updated and active across checkout and customer portal.');
        setTimeout(() => setSavedMsg(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-botanical-sage">Loading store configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
          Store &amp; Payment Settings
        </h1>
        <p className="text-xs text-botanical-sage mt-1">
          Configure Pakistani nationwide delivery rules, bank accounts, and customer helplines.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_12px_rgba(34,197,94,0.2)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
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
                value={deliveryFeePKR}
                onChange={(e) => setDeliveryFeePKR(parseInt(e.target.value, 10))}
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
                value={freeThresholdPKR}
                onChange={(e) => setFreeThresholdPKR(parseInt(e.target.value, 10))}
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

        {/* Customer Support Channels */}
        <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-lime" />
            <span>Support &amp; Helpline Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-sage uppercase tracking-wider mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-sm text-white"
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
            Save All Store Settings
          </button>
        </div>
      </form>
    </div>
  );
}
