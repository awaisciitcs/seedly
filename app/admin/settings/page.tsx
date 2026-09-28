'use client';

import React, { useEffect, useState } from 'react';
import { formatPKR, minorToPKR, pkrToMinor } from '../../../lib/utils';
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
          setJazzcashNumber(s.jazzcash_number || '0304 1117333');
          setJazzcashTitle(s.jazzcash_title || 'Seedly Care');
          setEasypaisaNumber(s.easypaisa_number || '0304 1117333');
          setEasypaisaTitle(s.easypaisa_title || 'Seedly Care');
          setWhatsapp(s.whatsapp_number || '+92 304 1117333');
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
    return <div className="p-12 text-center text-xs text-muted-gray">Loading store configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Store & Payment Settings</h1>
        <p className="text-xs text-muted-gray mt-1">
          Configure Pakistani nationwide delivery rules, bank accounts, and customer helplines.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery Rates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
          <h2 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Truck className="w-5 h-5 text-seedly-primary" />
            <span>Shipping & Delivery Rates (PKR)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Standard Nationwide Shipping (PKR)
              </label>
              <input
                type="number"
                value={deliveryFeePKR}
                onChange={(e) => setDeliveryFeePKR(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-bold font-mono text-charcoal"
              />
              <p className="text-[11px] text-muted-gray mt-1">Applied on orders below the free threshold.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                value={freeThresholdPKR}
                onChange={(e) => setFreeThresholdPKR(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-bold font-mono text-charcoal"
              />
              <p className="text-[11px] text-muted-gray mt-1">Orders above this qualify for free shipping.</p>
            </div>
          </div>
        </div>

        {/* Mobile Wallet Accounts (JazzCash & Easypaisa) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
          <h2 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Wallet className="w-5 h-5 text-seedly-primary" />
            <span>Official Mobile Wallet Accounts (JazzCash & Easypaisa)</span>
          </h2>
          <p className="text-xs text-muted-gray">
            These numbers and titles will be displayed to customers at checkout to transfer payment directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* JazzCash */}
            <div className="p-4 rounded-2xl bg-cream/30 border border-border-gray space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block">
                JazzCash Account
              </span>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Account Title</label>
                <input
                  type="text"
                  value={jazzcashTitle}
                  onChange={(e) => setJazzcashTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Account Number</label>
                <input
                  type="text"
                  value={jazzcashNumber}
                  onChange={(e) => setJazzcashNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-sm font-mono font-bold"
                />
              </div>
            </div>

            {/* Easypaisa */}
            <div className="p-4 rounded-2xl bg-cream/30 border border-border-gray space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                Easypaisa Account
              </span>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Account Title</label>
                <input
                  type="text"
                  value={easypaisaTitle}
                  onChange={(e) => setEasypaisaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Account Number</label>
                <input
                  type="text"
                  value={easypaisaNumber}
                  onChange={(e) => setEasypaisaNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-sm font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
          <h2 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Building className="w-5 h-5 text-seedly-primary" />
            <span>Manual Bank Transfer Details (Pakistan)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Account Title
              </label>
              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono text-charcoal"
              />
            </div>
          </div>
        </div>

        {/* Customer Care Channels */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
          <h2 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Phone className="w-5 h-5 text-seedly-primary" />
            <span>Helpline Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                WhatsApp Customer Helpline
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono text-charcoal"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-semibold text-xs transition-all shadow-card"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
