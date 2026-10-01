'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPKR, minorToPKR } from '@/lib/utils';
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  ShieldCheck,
  Plus,
  Search,
  Check,
  AlertCircle,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Package,
} from 'lucide-react';

interface KitItemDetail {
  id?: string;
  kit_id?: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  available_stock: number;
}

interface KitDetail {
  id: string;
  name: string;
  slug: string;
  package_size: string;
  price_minor: number;
  compare_price_minor?: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  compliance_status: string;
  short_description: string;
  description: string;
  ingredients: string;
  usage_instructions: string;
  storage_instructions: string;
  image_url: string;
  badge?: string;
  items: KitItemDetail[];
  computed_stock: number;
}

interface AdminKitsClientProps {
  initialKits: KitDetail[];
  initialProducts: any[];
}

export function AdminKitsClient({ initialKits, initialProducts }: AdminKitsClientProps) {
  const [kits, setKits] = useState<KitDetail[]>(initialKits);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<any | null>(null);

  // New Kit Form State
  const [name, setName] = useState('');
  const [packageSize, setPackageSize] = useState('4 x 250g Pouches + Wooden Scoop + Cycle Calendar');
  const [pricePKR, setPricePKR] = useState('');
  const [comparePricePKR, setComparePricePKR] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [complianceStatus, setComplianceStatus] = useState('APPROVED');
  const [badge, setBadge] = useState('CYCLE RITUAL');
  const [imageUrl, setImageUrl] = useState('/images/products/complete-kit.jpg');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [usage, setUsage] = useState('');
  const [storage, setStorage] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<{ product_id: string; variant_id: string; quantity: number }>
  >([]);

  const fetchKits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/kits');
      const json = await res.json();
      if (json.data) {
        setKits(json.data);
      }
    } catch (err) {
      console.error('Failed to load kits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (json.data) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    if (initialKits.length === 0) fetchKits();
    if (initialProducts.length === 0) fetchProducts();
  }, []);

  // Compute bottleneck stock preview for draft/create items
  const computePreviewStock = (items: Array<{ product_id: string; quantity: number }>) => {
    if (items.length === 0) return 0;
    let minUnits = 999999;
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product_id);
      const totalStock = (prod?.variants || []).reduce(
        (sum: number, v: any) => sum + (v.inventory_quantity || 0),
        0
      );
      const maxFulfillable = Math.floor(totalStock / (item.quantity || 1));
      if (maxFulfillable < minUnits) minUnits = maxFulfillable;
    }
    return minUnits === 999999 ? 0 : Math.max(0, minUnits);
  };

  const handleAddItemToForm = () => {
    const rawSeeds = products.filter((p) => p.product_type === 'seed');
    const defaultProd = rawSeeds[0] || products[0];
    if (!defaultProd) return;
    const defaultVariant = defaultProd.variants?.[0]?.id || '';
    setSelectedItems((prev) => [
      ...prev,
      {
        product_id: defaultProd.id,
        variant_id: defaultVariant,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItemFromForm = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    const firstVariantId = prod?.variants?.[0]?.id || '';
    setSelectedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, product_id: newProductId, variant_id: firstVariantId } : item
      )
    );
  };

  const handleItemQuantityChange = (index: number, newQty: number) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, newQty) } : item))
    );
  };

  // Open Edit Modal and prefill
  const handleOpenEdit = (kit: KitDetail) => {
    setEditingKit({
      ...kit,
      price_pkr: minorToPKR(kit.price_minor),
      compare_price_pkr: kit.compare_price_minor ? minorToPKR(kit.compare_price_minor) : '',
      ingredients: kit.ingredients || '',
      usage_instructions: kit.usage_instructions || '',
      storage_instructions: kit.storage_instructions || '',
      items: (kit.items || []).map((it) => ({
        product_id: it.product_id,
        variant_id: it.variant_id || '',
        quantity: it.quantity || 1,
      })),
    });
    setErrorMsg('');
  };

  const handleCreateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !pricePKR) {
      setErrorMsg('Kit name and price are required.');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMsg('Please add at least one constituent seed SKU to formulate this kit.');
      return;
    }

    try {
      const res = await fetch('/api/admin/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          package_size: packageSize,
          price_pkr: Number(pricePKR),
          compare_price_pkr: comparePricePKR ? Number(comparePricePKR) : null,
          short_description: shortDesc,
          description,
          ingredients,
          usage_instructions: usage,
          storage_instructions: storage,
          image_url: imageUrl || '/images/products/complete-kit.jpg',
          badge: badge || null,
          status,
          compliance_status: complianceStatus,
          items: selectedItems,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create kit');

      setSuccessMsg(`Curated Kit "${name}" created successfully!`);
      setIsAddModalOpen(false);
      // Reset form
      setName('');
      setPricePKR('');
      setComparePricePKR('');
      setShortDesc('');
      setDescription('');
      setIngredients('');
      setUsage('');
      setStorage('');
      setSelectedItems([]);
      fetchKits();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating kit');
    }
  };

  const handleUpdateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKit) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/kits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKit.id,
          name: editingKit.name,
          package_size: editingKit.package_size,
          price_pkr: Number(editingKit.price_pkr),
          compare_price_pkr: editingKit.compare_price_pkr ? Number(editingKit.compare_price_pkr) : null,
          short_description: editingKit.short_description,
          description: editingKit.description,
          ingredients: editingKit.ingredients,
          usage_instructions: editingKit.usage_instructions,
          storage_instructions: editingKit.storage_instructions,
          image_url: editingKit.image_url,
          badge: editingKit.badge || null,
          status: editingKit.status,
          compliance_status: editingKit.compliance_status,
          items: editingKit.items,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update kit');

      setSuccessMsg(`Curated Kit "${editingKit.name}" updated successfully!`);
      setEditingKit(null);
      fetchKits();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating kit');
    }
  };

  const handleDeleteKit = async (id: string, kitName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${kitName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kits?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(json.message || `Kit "${kitName}" removed.`);
        fetchKits();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(json.error?.message || 'Failed to delete kit');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting kit');
    }
  };

  const filteredKits = kits.filter((k) => {
    if (statusFilter !== 'ALL' && k.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      k.package_size?.toLowerCase().includes(q) ||
      k.short_description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Curated Seed Kits &amp; Rituals
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Nutritional cycle kits formulated from component raw pantry seed SKUs. Managed directly here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="glass-btn-3d px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-lime" />
            <span>Products &amp; Stock</span>
          </Link>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsAddModalOpen(true);
              if (selectedItems.length === 0) {
                // Initialize with first 2 seed products if available
                const rawSeeds = products.filter((p) => p.product_type === 'seed');
                if (rawSeeds.length >= 2) {
                  setSelectedItems([
                    { product_id: rawSeeds[0].id, variant_id: rawSeeds[0].variants?.[0]?.id || '', quantity: 1 },
                    { product_id: rawSeeds[1].id, variant_id: rawSeeds[1].variants?.[0]?.id || '', quantity: 1 },
                  ]);
                } else if (rawSeeds.length === 1) {
                  setSelectedItems([
                    { product_id: rawSeeds[0].id, variant_id: rawSeeds[0].variants?.[0]?.id || '', quantity: 1 },
                  ]);
                }
              }
            }}
            className="btn-lime-3d px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(183,228,89,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Kit</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Compliance & Bottleneck Invariant Card */}
      <div className="glass-panel-3d p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 border border-emerald-500/30">
        <ShieldCheck className="w-5 h-5 text-lime shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-sm font-semibold text-white">
            Kit Inventory &amp; Bottleneck Invariant (Section 8.4)
          </strong>
          <p className="text-botanical-sage">
            Curated kits do not hold detached phantom inventory. Instead, their available quantity is mathematically computed in real-time from the bottleneck inventory level of its constituent seeds.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel-3d rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search curated kits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-xl text-xs placeholder:text-botanical-sage/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="glass-input-3d px-3 py-2 rounded-xl text-xs bg-botanical-dark text-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <Link
            href="/shop?category=kits"
            target="_blank"
            className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-lime" />
            <span>Storefront Kits Tab</span>
          </Link>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-botanical-sage text-xs">
            Loading curated kits...
          </div>
        ) : filteredKits.length === 0 ? (
          <div className="col-span-full py-16 text-center text-botanical-sage text-xs border border-white/10 rounded-3xl glass-panel-3d">
            No curated kits found matching your search.
          </div>
        ) : (
          filteredKits.map((kit) => (
            <div
              key={kit.id}
              className="glass-card-3d rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-white/10 hover:border-lime/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                  <Image
                    src={kit.image_url}
                    alt={kit.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                      {kit.compliance_status}
                    </span>
                    {kit.badge && (
                      <span className="px-2 py-0.5 bg-lime/25 text-lime border border-lime/40 text-[9px] font-mono font-bold rounded-full">
                        {kit.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      kit.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/10 text-white/70 border-white/20'
                    }`}
                  >
                    {kit.status}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-lg text-white leading-tight">
                      {kit.name}
                    </h3>
                    <Link
                      href={`/kits/${kit.slug}`}
                      target="_blank"
                      className="text-botanical-sage hover:text-white"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <p className="text-xs text-botanical-sage mt-1">{kit.package_size}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono font-bold text-base text-lime">
                      {formatPKR(kit.price_minor)}
                    </span>
                    {kit.compare_price_minor && (
                      <span className="font-mono text-xs text-botanical-sage line-through">
                        {formatPKR(kit.compare_price_minor)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Component breakdown */}
                <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-botanical-sage text-[10px] uppercase tracking-wider block">
                      Constituent Components
                    </span>
                    <span className="text-[10px] text-lime font-mono">
                      {kit.items?.length || 0} seeds
                    </span>
                  </div>
                  <div className="divide-y divide-white/10">
                    {(kit.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span className="text-white/90 font-medium">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-mono text-botanical-sage text-[10px]">
                          Reserve: <strong className="text-white">{item.available_stock}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Computed Stock Footer & Action Buttons */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-botanical-sage">Available to Order:</span>
                  <span
                    className={`font-mono font-bold text-xs px-3 py-1 rounded-full border shadow-[0_0_8px_rgba(34,197,94,0.2)] ${
                      kit.computed_stock > 10
                        ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30'
                        : kit.computed_stock > 0
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                        : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {kit.computed_stock} kits
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(kit)}
                    className="glass-btn-3d px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-lime" />
                    <span>Edit Kit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteKit(kit.id, kit.name)}
                    className="glass-btn-3d p-1.5 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-rose-500/20 cursor-pointer inline-flex items-center"
                    title="Delete Kit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Kit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 space-y-5 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Create New Curated Kit</h3>
                <p className="text-xs text-botanical-sage mt-0.5">
                  Formulate a bundled seed cycle ritual. Its available stock will be computed dynamically.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="glass-btn-3d p-1.5 rounded-full text-botanical-sage hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateKit} className="space-y-4 text-xs">
              {/* Kit Picture Upload Area */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  label="Curated Kit Picture (Upload File or Enter URL) *"
                  helperText="Upload JPG, PNG, WebP, or SVG. Stored securely on CDN."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Kit Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete 28-Day Seed Cycling Ritual Kit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Package Size Descriptor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 x 250g Pouches + Wooden Scoop + Cycle Calendar"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Price in PKR (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2850"
                    value={pricePKR}
                    onChange={(e) => setPricePKR(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Compare-At Price (Rs.)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3200"
                    value={comparePricePKR}
                    onChange={(e) => setComparePricePKR(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Catalog Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. CYCLE RITUAL, BESTSELLER"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="1-line summary displayed on kit cards and shop preview"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation of the protocol, phases, and benefits"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Ingredients (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Raw Pumpkin, Flaxseed, Sunflower, and Sesame Seeds"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Usage Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Days 1-14: 1 tbsp Pumpkin + 1 tbsp Flaxseed daily"
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Storage Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Store pouches in a cool, dry place away from direct heat"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Constituent Seed Components Formulation Builder */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-xs">Constituent Seed Formulation *</h4>
                    <p className="text-[11px] text-botanical-sage">
                      Select component raw seed SKUs. Bottleneck inventory calculates automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="btn-lime-3d px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Seed SKU</span>
                  </button>
                </div>

                {selectedItems.length === 0 ? (
                  <p className="text-xs text-rose-300 py-3 text-center">
                    No components added yet. Please add at least 1 seed component.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map((item, index) => {
                      const selectedProd = products.find((p) => p.id === item.product_id);
                      const totalStock = (selectedProd?.variants || []).reduce(
                        (sum: number, v: any) => sum + (v.inventory_quantity || 0),
                        0
                      );

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/10"
                        >
                          <div className="flex-1 min-w-0">
                            <label className="block text-[10px] text-botanical-sage mb-0.5">
                              Component Seed #{index + 1}
                            </label>
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemProductChange(index, e.target.value)}
                              className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs bg-botanical-dark text-white cursor-pointer"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <label className="block text-[10px] text-botanical-sage mb-0.5">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemQuantityChange(index, parseInt(e.target.value, 10))
                              }
                              className="glass-input-3d w-full px-2 py-1.5 rounded-lg text-xs font-mono font-bold text-center"
                            />
                          </div>

                          <div className="w-24 text-right">
                            <span className="block text-[10px] text-botanical-sage">Stock Reserve</span>
                            <span className="font-mono text-xs text-emerald-300 font-bold">
                              {totalStock} units
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromForm(index)}
                            className="glass-btn-3d p-2 rounded-lg text-rose-300 hover:text-white mt-3"
                            title="Remove Component"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Stock preview badge */}
                    <div className="pt-2 flex items-center justify-between text-xs bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-300 font-medium">Computed Kit Availability:</span>
                      <span className="font-mono font-bold text-lime">
                        {computePreviewStock(selectedItems)} kits can be made from current stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="glass-btn-3d px-4 py-2 rounded-xl text-botanical-sage font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-lime-3d px-6 py-2 rounded-xl font-bold shadow-card"
                >
                  Publish Curated Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Kit Modal */}
      {editingKit && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 space-y-5 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Edit Curated Kit</h3>
                <p className="text-xs text-botanical-sage mt-0.5">Slug: {editingKit.slug}</p>
              </div>
              <button
                onClick={() => setEditingKit(null)}
                className="glass-btn-3d p-1.5 rounded-full text-botanical-sage hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateKit} className="space-y-4 text-xs">
              {/* Kit Picture Upload Area */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <ImageUpload
                  value={editingKit.image_url || ''}
                  onChange={(url) => setEditingKit({ ...editingKit, image_url: url })}
                  label="Curated Kit Picture (Upload File or Enter URL)"
                  helperText="Upload JPG, PNG, WebP, or SVG. Stored securely on CDN."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Kit Title</label>
                  <input
                    type="text"
                    value={editingKit.name}
                    onChange={(e) => setEditingKit({ ...editingKit, name: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Package Size Descriptor</label>
                  <input
                    type="text"
                    value={editingKit.package_size || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, package_size: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Price in PKR (Rs.)</label>
                  <input
                    type="number"
                    value={editingKit.price_pkr}
                    onChange={(e) => setEditingKit({ ...editingKit, price_pkr: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Compare-At Price (PKR)</label>
                  <input
                    type="number"
                    value={editingKit.compare_price_pkr || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, compare_price_pkr: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Catalog Status</label>
                  <select
                    value={editingKit.status}
                    onChange={(e) => setEditingKit({ ...editingKit, status: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. CYCLE RITUAL, BESTSELLER"
                    value={editingKit.badge || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, badge: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingKit.short_description || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, short_description: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={editingKit.description || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, description: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Ingredients (Optional)</label>
                  <input
                    type="text"
                    value={editingKit.ingredients || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, ingredients: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Usage Instructions (Optional)</label>
                  <input
                    type="text"
                    value={editingKit.usage_instructions || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, usage_instructions: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Storage Instructions (Optional)</label>
                  <input
                    type="text"
                    value={editingKit.storage_instructions || ''}
                    onChange={(e) => setEditingKit({ ...editingKit, storage_instructions: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Constituent Seed Components Formulation Builder */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-xs">Constituent Seed Formulation</h4>
                    <p className="text-[11px] text-botanical-sage">
                      Configure the exact raw seed SKUs that comprise this ritual kit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rawSeeds = products.filter((p) => p.product_type === 'seed');
                      const defaultProd = rawSeeds[0] || products[0];
                      if (!defaultProd) return;
                      setEditingKit({
                        ...editingKit,
                        items: [
                          ...(editingKit.items || []),
                          {
                            product_id: defaultProd.id,
                            variant_id: defaultProd.variants?.[0]?.id || '',
                            quantity: 1,
                          },
                        ],
                      });
                    }}
                    className="btn-lime-3d px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Seed SKU</span>
                  </button>
                </div>

                {(!editingKit.items || editingKit.items.length === 0) ? (
                  <p className="text-xs text-rose-300 py-3 text-center">
                    No components configured for this kit.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editingKit.items.map((item: any, index: number) => {
                      const selectedProd = products.find((p) => p.id === item.product_id);
                      const totalStock = (selectedProd?.variants || []).reduce(
                        (sum: number, v: any) => sum + (v.inventory_quantity || 0),
                        0
                      );

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/10"
                        >
                          <div className="flex-1 min-w-0">
                            <label className="block text-[10px] text-botanical-sage mb-0.5">
                              Component Seed #{index + 1}
                            </label>
                            <select
                              value={item.product_id}
                              onChange={(e) => {
                                const newProductId = e.target.value;
                                const prod = products.find((p) => p.id === newProductId);
                                const firstVariantId = prod?.variants?.[0]?.id || '';
                                setEditingKit({
                                  ...editingKit,
                                  items: editingKit.items.map((it: any, i: number) =>
                                    i === index
                                      ? { ...it, product_id: newProductId, variant_id: firstVariantId }
                                      : it
                                  ),
                                });
                              }}
                              className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs bg-botanical-dark text-white cursor-pointer"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <label className="block text-[10px] text-botanical-sage mb-0.5">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = Math.max(1, parseInt(e.target.value, 10));
                                setEditingKit({
                                  ...editingKit,
                                  items: editingKit.items.map((it: any, i: number) =>
                                    i === index ? { ...it, quantity: newQty } : it
                                  ),
                                });
                              }}
                              className="glass-input-3d w-full px-2 py-1.5 rounded-lg text-xs font-mono font-bold text-center"
                            />
                          </div>

                          <div className="w-24 text-right">
                            <span className="block text-[10px] text-botanical-sage">Stock Reserve</span>
                            <span className="font-mono text-xs text-emerald-300 font-bold">
                              {totalStock} units
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingKit({
                                ...editingKit,
                                items: editingKit.items.filter((_: any, i: number) => i !== index),
                              });
                            }}
                            className="glass-btn-3d p-2 rounded-lg text-rose-300 hover:text-white mt-3"
                            title="Remove Component"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Stock preview badge */}
                    <div className="pt-2 flex items-center justify-between text-xs bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-300 font-medium">Computed Kit Availability:</span>
                      <span className="font-mono font-bold text-lime">
                        {computePreviewStock(editingKit.items)} kits can be made from current stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingKit(null)}
                  className="glass-btn-3d px-4 py-2 rounded-xl text-botanical-sage font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-lime-3d px-6 py-2 rounded-xl font-bold shadow-card"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
