import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getKits } from '../../../lib/services/kits';
import { formatPKR } from '../../../lib/utils';
import { Layers, Box, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminKitsPage() {
  const kits = getKits();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Curated Seed Kits</h1>
          <p className="text-xs text-muted-gray mt-1">
            Nutritional cycle kits formulated from component raw pantry seed SKUs.
          </p>
        </div>
      </div>

      {/* Compliance & Bottleneck Invariant Card */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-sm font-semibold">Kit Inventory & Bottleneck Invariant (Section 8.4)</strong>
          <p>
            Curated kits do not hold detached phantom inventory. Instead, their available quantity is mathematically computed in real-time from the bottleneck inventory level of its constituent seeds.
          </p>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="bg-white rounded-3xl p-6 border border-border-gray shadow-card flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-cream border border-border-gray">
                <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded-full">
                  {kit.compliance_status}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal">{kit.name}</h3>
                <p className="text-xs text-muted-gray mt-1">{kit.package_size}</p>
                <p className="font-serif font-bold text-base text-seedly-dark mt-2">
                  {formatPKR(kit.price_minor)}
                </p>
              </div>

              {/* Component breakdown */}
              <div className="bg-cream/40 p-3.5 rounded-2xl border border-border-gray space-y-2 text-xs">
                <span className="font-semibold text-charcoal text-[11px] uppercase tracking-wider block">
                  Constituent Components
                </span>
                <div className="divide-y divide-border-gray/50">
                  {kit.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-1.5 flex justify-between">
                      <span className="text-charcoal font-medium">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-mono text-muted-gray text-[11px]">
                        Reserve: {item.available_stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Computed Stock Footer */}
            <div className="pt-3 border-t border-border-gray flex items-center justify-between">
              <span className="text-xs text-muted-gray">Available to Order:</span>
              <span className="font-mono font-bold text-sm bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                {kit.computed_stock} kits
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
