import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getKits } from '../../../lib/services/kits';
import { formatPKR } from '../../../lib/utils';
import { Layers, Box, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default async function AdminKitsPage() {
  const kits = await getKits();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Curated Seed Kits
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Nutritional cycle kits formulated from component raw pantry seed SKUs.
          </p>
        </div>
      </div>

      {/* Compliance & Bottleneck Invariant Card */}
      <div className="glass-panel-3d p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 border border-emerald-500/30">
        <ShieldCheck className="w-5 h-5 text-lime shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-sm font-semibold text-white">Kit Inventory &amp; Bottleneck Invariant (Section 8.4)</strong>
          <p className="text-botanical-sage">
            Curated kits do not hold detached phantom inventory. Instead, their available quantity is mathematically computed in real-time from the bottleneck inventory level of its constituent seeds.
          </p>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="glass-card-3d rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-white/10"
          >
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                  {kit.compliance_status}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-white leading-tight">{kit.name}</h3>
                <p className="text-xs text-botanical-sage mt-1">{kit.package_size}</p>
                <p className="font-mono font-bold text-base text-lime mt-2">
                  {formatPKR(kit.price_minor)}
                </p>
              </div>

              {/* Component breakdown */}
              <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
                <span className="font-semibold text-botanical-sage text-[10px] uppercase tracking-wider block">
                  Constituent Components
                </span>
                <div className="divide-y divide-white/10">
                  {kit.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-1.5 flex justify-between">
                      <span className="text-white/90 font-medium">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-mono text-botanical-sage text-[11px]">
                        Reserve: {item.available_stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Computed Stock Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-botanical-sage">Available to Order:</span>
              <span className="font-mono font-bold text-xs bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.2)]">
                {kit.computed_stock} kits
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
