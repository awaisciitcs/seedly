'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPKR, minorToPKR } from '@/lib/utils';
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  Package,
  Search,
  Plus,
  Edit,
  Check,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: string;
}

interface VariantFormRow {
  id?: string;
  weight_grams: number | string;
  price_pkr: number | string;
  compare_price_pkr: number | string;
  inventory_quantity: number | string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);

  // New Product Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cat-seeds');
  const [productType, setProductType] = useState<'seed' | 'tea'>('seed');
  const [addVariants, setAddVariants] = useState<VariantFormRow[]>([
    { weight_grams: 250, price_pkr: '', compare_price_pkr: '', inventory_quantity: 50, status: 'ACTIVE' },
  ]);
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [usage, setUsage] = useState('');
  const [storage, setStorage] = useState('');
  const [flavorProfile, setFlavorProfile] = useState('');
  const [caffeineLevel, setCaffeineLevel] = useState('');
  const [steepTime, setSteepTime] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      setProducts(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    if (catId === 'cat-teas') {
      setProductType('tea');
      if (!imageUrl || imageUrl.includes('pumpkin-seeds')) {
        setImageUrl('/images/products/chamomile-tea.svg');
      }
    } else {
      setProductType('seed');
      if (!imageUrl || imageUrl.includes('chamomile-tea')) {
        setImageUrl('/images/products/pumpkin-seeds.svg');
      }
    }
  };

  // Variant Helpers for Add Modal
  const handleAddPresetAddVariant = (grams: number) => {
    setAddVariants((prev) => [
      ...prev,
      { weight_grams: grams, price_pkr: '', compare_price_pkr: '', inventory_quantity: 50, status: 'ACTIVE' },
    ]);
  };

  const handleUpdateAddVariant = (idx: number, field: keyof VariantFormRow, val: any) => {
    setAddVariants((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row)));
  };

  const handleRemoveAddVariant = (idx: number) => {
    if (addVariants.length <= 1) return;
    setAddVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Variant Helpers for Edit Modal
  const handleAddPresetEditVariant = (grams: number) => {
    if (!editingProduct) return;
    const currentVars = editingProduct.variants || [];
    setEditingProduct({
      ...editingProduct,
      variants: [
        ...currentVars,
        { weight_grams: grams, price_pkr: '', compare_price_pkr: '', inventory_quantity: 50, status: 'ACTIVE' },
      ],
    });
  };

  const handleUpdateEditVariant = (idx: number, field: keyof VariantFormRow, val: any) => {
    if (!editingProduct) return;
    const updated = (editingProduct.variants || []).map((row: VariantFormRow, i: number) =>
      i === idx ? { ...row, [field]: val } : row
    );
    setEditingProduct({
      ...editingProduct,
      variants: updated,
    });
  };

  const handleRemoveEditVariant = (idx: number) => {
    if (!editingProduct || (editingProduct.variants || []).length <= 1) return;
    const updated = (editingProduct.variants || []).filter((_: any, i: number) => i !== idx);
    setEditingProduct({
      ...editingProduct,
      variants: updated,
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Product title is required.');
      return;
    }

    if (!addVariants || addVariants.length === 0) {
      setErrorMsg('At least one pack size / gram variant is required.');
      return;
    }

    for (let i = 0; i < addVariants.length; i++) {
      const v = addVariants[i];
      if (!v.weight_grams || Number(v.weight_grams) <= 0) {
        setErrorMsg(`Pack size #${i + 1} has an invalid weight in grams.`);
        return;
      }
      if (!v.price_pkr || Number(v.price_pkr) <= 0) {
        setErrorMsg(`Pack size #${i + 1} (${v.weight_grams}g) must have a valid price in PKR.`);
        return;
      }
    }

    const primaryVar = addVariants[0];

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category_id: categoryId,
          product_type: productType,
          price_pkr: Number(primaryVar.price_pkr),
          compare_price_pkr: primaryVar.compare_price_pkr ? Number(primaryVar.compare_price_pkr) : null,
          weight_grams: Number(primaryVar.weight_grams),
          variants: addVariants.map((v) => ({
            weight_grams: Number(v.weight_grams),
            price_pkr: Number(v.price_pkr),
            compare_price_pkr: v.compare_price_pkr ? Number(v.compare_price_pkr) : null,
            inventory_quantity: Number(v.inventory_quantity ?? 50),
          })),
          short_description: shortDesc,
          description,
          ingredients,
          usage_instructions: usage,
          storage_instructions: storage,
          flavor_profile: productType === 'tea' ? flavorProfile || null : null,
          caffeine_level: productType === 'tea' ? caffeineLevel || null : null,
          steep_time: productType === 'tea' ? steepTime || null : null,
          water_temp: productType === 'tea' ? waterTemp || null : null,
          image_url:
            imageUrl ||
            (productType === 'tea'
              ? '/images/products/chamomile-tea.svg'
              : '/images/products/pumpkin-seeds.svg'),
          badge: badge || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create product');

      setSuccessMsg(`Product "${name}" added with ${addVariants.length} pack size(s) successfully!`);
      setIsAddModalOpen(false);
      // Reset form
      setName('');
      setAddVariants([
        { weight_grams: 250, price_pkr: '', compare_price_pkr: '', inventory_quantity: 50, status: 'ACTIVE' },
      ]);
      setShortDesc('');
      setDescription('');
      setIngredients('');
      setUsage('');
      setStorage('');
      setFlavorProfile('');
      setCaffeineLevel('');
      setSteepTime('');
      setWaterTemp('');
      setImageUrl('');
      setBadge('');
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating product');
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: editingVariant.id,
          inventory_quantity: Number(newStock),
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Stock updated for ${editingVariant.sku} to ${newStock} units`);
        setEditingVariant(null);
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setErrorMsg('');

    const editVariants: VariantFormRow[] = editingProduct.variants || [];
    if (editVariants.length === 0) {
      setErrorMsg('At least one pack size / gram variant is required.');
      return;
    }

    for (let i = 0; i < editVariants.length; i++) {
      const v = editVariants[i];
      if (!v.weight_grams || Number(v.weight_grams) <= 0) {
        setErrorMsg(`Pack size #${i + 1} has an invalid weight in grams.`);
        return;
      }
      if (!v.price_pkr || Number(v.price_pkr) <= 0) {
        setErrorMsg(`Pack size #${i + 1} (${v.weight_grams}g) must have a valid price in PKR.`);
        return;
      }
    }

    const activeVar = editVariants.find((v) => v.status !== 'INACTIVE') || editVariants[0];

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editingProduct.name,
          category_id: editingProduct.category_id,
          product_type: editingProduct.category_id === 'cat-teas' ? 'tea' : 'seed',
          price_pkr: Number(activeVar.price_pkr),
          compare_price_pkr: activeVar.compare_price_pkr ? Number(activeVar.compare_price_pkr) : null,
          weight_grams: Number(activeVar.weight_grams),
          variants: editVariants.map((v) => ({
            id: v.id,
            weight_grams: Number(v.weight_grams),
            price_pkr: Number(v.price_pkr),
            compare_price_pkr: v.compare_price_pkr ? Number(v.compare_price_pkr) : null,
            inventory_quantity: Number(v.inventory_quantity ?? 0),
            status: v.status || 'ACTIVE',
          })),
          short_description: editingProduct.short_description,
          description: editingProduct.description,
          ingredients: editingProduct.ingredients,
          usage_instructions: editingProduct.usage_instructions,
          storage_instructions: editingProduct.storage_instructions,
          flavor_profile: editingProduct.flavor_profile,
          caffeine_level: editingProduct.caffeine_level,
          steep_time: editingProduct.steep_time,
          water_temp: editingProduct.water_temp,
          image_url: editingProduct.image_url,
          badge: editingProduct.badge || null,
          status: editingProduct.status,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Product "${editingProduct.name}" and variants updated successfully!`);
        setEditingProduct(null);
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to update product');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error updating product');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${prodName}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(json.message || `Product "${prodName}" removed from catalog.`);
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(json.error?.message || 'Failed to delete product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting product');
    }
  };

  const filteredProducts = products.filter((p) => {
    // Category tab filter
    if (selectedCategoryTab === 'seeds' && p.product_type !== 'seed') return false;
    if (selectedCategoryTab === 'teas' && p.product_type !== 'tea') return false;

    // Search filter
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.product_type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Catalog &amp; Inventory
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Create, edit, upload pictures, and manage all raw pantry seed and mountain tea SKUs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/kits"
            className="glass-btn-3d px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-lime" />
            <span>Manage Curated Kits</span>
          </Link>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsAddModalOpen(true);
            }}
            className="btn-lime-3d px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(183,228,89,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Glass Table Container */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
        {/* Category Tabs Aligned with Storefront Shop All Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/10 text-xs">
          <span className="text-botanical-sage text-[11px] uppercase font-semibold tracking-wider mr-1">
            Tabs:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategoryTab === 'all'
                ? 'bg-lime text-botanical-deep font-bold shadow-[0_0_10px_rgba(183,228,89,0.3)]'
                : 'glass-btn-3d text-botanical-sage hover:text-white'
            }`}
          >
            All Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategoryTab('seeds')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategoryTab === 'seeds'
                ? 'bg-lime text-botanical-deep font-bold shadow-[0_0_10px_rgba(183,228,89,0.3)]'
                : 'glass-btn-3d text-botanical-sage hover:text-white'
            }`}
          >
            Raw seeds ({products.filter((p) => p.product_type === 'seed').length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategoryTab('teas')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategoryTab === 'teas'
                ? 'bg-lime text-botanical-deep font-bold shadow-[0_0_10px_rgba(183,228,89,0.3)]'
                : 'glass-btn-3d text-botanical-sage hover:text-white'
            }`}
          >
            Mountain teas ({products.filter((p) => p.product_type === 'tea').length})
          </button>

          <Link
            href="/admin/kits"
            className="glass-btn-3d px-3.5 py-1.5 rounded-xl font-medium text-emerald-300 hover:text-white flex items-center gap-1.5 ml-auto"
            title="Curated Kits are managed under Curated Kits"
          >
            <Layers className="w-3.5 h-3.5 text-lime" />
            <span>Cycle kits (Curated Kits)</span>
            <ArrowRight className="w-3 h-3 text-botanical-sage" />
          </Link>
        </div>

        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-2xl text-xs placeholder:text-botanical-sage/60"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href="/shop"
              target="_blank"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-lime" />
              <span>View Shop</span>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">PRODUCT &amp; PICTURE</th>
                <th className="py-3.5 px-4 font-semibold">STORE CATEGORY</th>
                <th className="py-3.5 px-4 font-semibold">PRICE (PKR)</th>
                <th className="py-3.5 px-4 font-semibold">VARIANTS &amp; WAREHOUSE STOCK</th>
                <th className="py-3.5 px-4 font-semibold">STATUS</th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-botanical-sage text-xs">
                    Loading catalog inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-botanical-sage text-xs">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = (p.variants || []).some((v: any) => v.inventory_quantity <= 20);
                  const categoryLabel = p.product_type === 'tea' ? 'Mountain teas' : 'Raw seeds';

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* PRODUCT & PICTURE */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(74,222,128,0.15)]">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Leaf className="w-5 h-5 text-lime" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white text-xs whitespace-nowrap">{p.name}</p>
                              {p.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-lime/20 text-lime border border-lime/30">
                                  {p.badge}
                                </span>
                              )}
                              <Link
                                href={`/${p.product_type === 'tea' ? 'teas' : 'seeds'}/${p.slug}`}
                                target="_blank"
                                className="text-botanical-sage hover:text-white"
                                title="View on Storefront"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <p className="text-[10px] text-botanical-sage font-mono mt-0.5">{p.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* STORE CATEGORY */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white/90 border border-white/10 font-medium text-[10px]">
                          {categoryLabel}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {(() => {
                          const activeVars = (p.variants || []).filter((v: any) => v.status === 'ACTIVE');
                          if (activeVars.length > 1) {
                            const prices = activeVars
                              .map((v: any) => Number(v.price_minor) || 0)
                              .filter((pr: number) => pr > 0);
                            const minP = Math.min(...prices);
                            const maxP = Math.max(...prices);
                            if (minP !== maxP && Number.isFinite(minP) && Number.isFinite(maxP)) {
                              return (
                                <div>
                                  <span className="text-white text-xs">{formatPKR(minP)} – {formatPKR(maxP)}</span>
                                  <span className="text-[10px] text-lime block font-normal font-sans mt-0.5">
                                    {activeVars.length} pack sizes
                                  </span>
                                </div>
                              );
                            }
                          }
                          return (
                            <div>
                              <span>{formatPKR(p.price_minor)}</span>
                              {p.compare_price_minor && (
                                <span className="text-[10px] text-botanical-sage line-through block font-normal">
                                  {formatPKR(p.compare_price_minor)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* VARIANTS & WAREHOUSE STOCK */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                          {p.variants?.map((v: any) => (
                            <div
                              key={v.id}
                              className="flex items-center gap-1.5 whitespace-nowrap bg-white/[0.04] border border-white/10 px-2 py-1 rounded-xl text-[11px]"
                            >
                              <span className="text-white font-semibold">{v.option_value}</span>
                              <span className="text-lime/90 font-mono text-[10px]">
                                ({formatPKR(v.price_minor)})
                              </span>
                              <span
                                className={`font-mono font-bold px-1.5 py-0.2 rounded-md text-[9px] border ${
                                  v.inventory_quantity > 20
                                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                                }`}
                              >
                                {v.inventory_quantity}u
                              </span>
                              <button
                                onClick={() => {
                                  setEditingVariant(v);
                                  setNewStock(v.inventory_quantity);
                                }}
                                className="text-[10px] text-botanical-sage hover:text-white underline cursor-pointer ml-0.5"
                                title={`Adjust stock for ${v.option_value}`}
                              >
                                Adjust
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            p.status === 'ACTIVE'
                              ? isLow
                                ? 'bg-amber-950/70 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                : 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                              : 'bg-white/10 text-white/80 border-white/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'ACTIVE'
                                ? isLow
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                                : 'bg-white/60'
                            }`}
                          />
                          {p.status === 'ACTIVE' ? (isLow ? 'LOW STOCK' : 'ACTIVE') : p.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            const prodVariants: VariantFormRow[] =
                              p.variants && p.variants.length > 0
                                ? p.variants.map((v: any) => ({
                                    id: v.id,
                                    weight_grams: v.weight_grams || 250,
                                    price_pkr: minorToPKR(v.price_minor),
                                    compare_price_pkr: v.compare_price_minor
                                      ? minorToPKR(v.compare_price_minor)
                                      : '',
                                    inventory_quantity: v.inventory_quantity ?? 0,
                                    status: v.status || 'ACTIVE',
                                  }))
                                : [
                                    {
                                      weight_grams: p.weight_grams || 250,
                                      price_pkr: minorToPKR(p.price_minor),
                                      compare_price_pkr: p.compare_price_minor
                                        ? minorToPKR(p.compare_price_minor)
                                        : '',
                                      inventory_quantity: 50,
                                      status: 'ACTIVE',
                                    },
                                  ];

                            setEditingProduct({
                              ...p,
                              price_pkr: minorToPKR(p.price_minor),
                              compare_price_pkr: p.compare_price_minor
                                ? minorToPKR(p.compare_price_minor)
                                : '',
                              weight_grams: p.weight_grams || 250,
                              variants: prodVariants,
                              category_id:
                                p.category_id || (p.product_type === 'tea' ? 'cat-teas' : 'cat-seeds'),
                              usage_instructions: p.usage_instructions || '',
                              storage_instructions: p.storage_instructions || '',
                              flavor_profile: p.flavor_profile || '',
                              caffeine_level: p.caffeine_level || '',
                              steep_time: p.steep_time || '',
                              water_temp: p.water_temp || '',
                            });
                          }}
                          className="glass-btn-3d px-3 py-1.5 rounded-xl font-semibold text-xs cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="glass-btn-3d p-1.5 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-rose-500/20 cursor-pointer inline-flex items-center"
                          title="Remove Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-botanical-sage">
          <p>
            Showing 1–{filteredProducts.length} of {products.length} products
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded-lg bg-lime text-botanical-deep font-bold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(183,228,89,0.4)]">
              1
            </span>
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal (3D Glass) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 space-y-5 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Add New Product to Store</h3>
                <p className="text-xs text-botanical-sage mt-0.5">
                  Creates an SKU visible on the storefront under the chosen category tab.
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

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              {/* Product Picture Upload Area */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  label="Product Picture (Upload File or Enter URL) *"
                  helperText="Upload JPG, PNG, WebP, or SVG. Stored securely on CDN."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Black Chia Seeds or Lavender Blossom Tea"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">
                    Storefront Tab / Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white cursor-pointer"
                  >
                    <option value="cat-seeds">Raw seeds (seeds tab)</option>
                    <option value="cat-teas">Mountain teas (teas tab)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, BESTSELLER, LIMITED"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm uppercase"
                  />
                </div>

                {/* Helpful note regarding Cycle Kits */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-lime/10 border border-lime/25 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-lime">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span className="text-white/90">
                      Need to add a <strong>Cycle kit</strong>? Curated kits combine multiple seed SKUs and are managed under Curated Kits.
                    </span>
                  </div>
                  <Link
                    href="/admin/kits"
                    className="btn-lime-3d px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 ml-2"
                  >
                    Go to Kits
                  </Link>
                </div>

                {/* Pack Sizes, Grams & Pricing Section */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lime text-xs uppercase tracking-wider">
                          Pack Sizes, Grams &amp; Pricing *
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white">
                          {addVariants.length} {addVariants.length === 1 ? 'Size' : 'Sizes'}
                        </span>
                      </div>
                      <p className="text-[11px] text-botanical-sage mt-0.5">
                        Set weight and prices for each option. Storefront customers select grams and the price updates dynamically.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-botanical-sage uppercase font-semibold">Quick add:</span>
                      <button
                        type="button"
                        onClick={() => handleAddPresetAddVariant(250)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 250g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetAddVariant(500)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 500g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetAddVariant(1000)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 1kg
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {addVariants.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/35 border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        {/* Gram weight */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Weight (Grams) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="10"
                              required
                              value={v.weight_grams}
                              onChange={(e) => handleUpdateAddVariant(idx, 'weight_grams', e.target.value)}
                              placeholder="250"
                              className="glass-input-3d w-full pl-3 pr-7 py-1.5 rounded-lg text-xs font-mono font-bold"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-botanical-sage pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>

                        {/* Price PKR */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Price in PKR (Rs.) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={v.price_pkr}
                            onChange={(e) => handleUpdateAddVariant(idx, 'price_pkr', e.target.value)}
                            placeholder="e.g. 950"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-lime"
                          />
                        </div>

                        {/* Compare Price */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Compare Price (Rs.)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={v.compare_price_pkr}
                            onChange={(e) => handleUpdateAddVariant(idx, 'compare_price_pkr', e.target.value)}
                            placeholder="e.g. 1100"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Stock Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Stock Units
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={v.inventory_quantity}
                            onChange={(e) => handleUpdateAddVariant(idx, 'inventory_quantity', e.target.value)}
                            placeholder="50"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Remove Button */}
                        <div className="sm:col-span-1 flex items-center justify-end pt-2 sm:pt-4">
                          <button
                            type="button"
                            disabled={addVariants.length <= 1}
                            onClick={() => handleRemoveAddVariant(idx)}
                            className={`p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-all ${
                              addVariants.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title={addVariants.length <= 1 ? 'At least 1 size required' : 'Remove size option'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddPresetAddVariant(250)}
                      className="glass-btn-3d px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-lime hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Pack Size / Gram Variant</span>
                    </button>
                    {addVariants.length > 0 && addVariants[0].price_pkr && (
                      <span className="text-[11px] text-botanical-sage font-mono">
                        Base starting price: <strong className="text-white">Rs. {addVariants[0].price_pkr}</strong> ({addVariants[0].weight_grams}g)
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Short Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-line benefit descriptor shown on cards"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Ingredients (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Raw Unsalted Pumpkin Seed Kernels"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Full product sourcing and botanical background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Usage Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Eat 1-2 tbsp daily in smoothies, salads, or bowls"
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Storage Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Store tightly sealed in a cool, dry pantry"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                {productType === 'tea' && (
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <span className="font-semibold text-lime text-xs block">
                      Mountain Herbal Tea Attributes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Flavor Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Floral, Sweet Honey, Calming"
                          value={flavorProfile}
                          onChange={(e) => setFlavorProfile(e.target.value)}
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Caffeine Level</label>
                        <input
                          type="text"
                          placeholder="e.g. Caffeine-free, Low, Medium"
                          value={caffeineLevel}
                          onChange={(e) => setCaffeineLevel(e.target.value)}
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Brew / Steep Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 4–5 mins"
                          value={steepTime}
                          onChange={(e) => setSteepTime(e.target.value)}
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Water Temperature</label>
                        <input
                          type="text"
                          placeholder="e.g. 90°C – 95°C"
                          value={waterTemp}
                          onChange={(e) => setWaterTemp(e.target.value)}
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
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
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Edit Modal */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-3d rounded-3xl p-6 max-w-sm w-full border border-white/15 space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-white">Adjust Variant Inventory</h3>
            <p className="text-xs text-botanical-sage">
              SKU: <strong className="font-mono text-white">{editingVariant.sku}</strong> ({editingVariant.option_value})
            </p>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">On-Hand Quantity (Units)</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                  className="glass-input-3d w-full px-4 py-2 rounded-xl text-sm font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="glass-btn-3d px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-lime-3d px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Edit Product Details</h3>
                <p className="text-xs text-botanical-sage mt-0.5">SKU: {editingProduct.sku}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="glass-btn-3d p-1 rounded-full text-botanical-sage"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              {/* Product Picture Upload Area */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <ImageUpload
                  value={editingProduct.image_url || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                  label="Product Picture (Upload File or Enter URL)"
                  helperText="Upload JPG, PNG, WebP, or SVG. Stored securely on CDN."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Store Category Tab</label>
                  <select
                    value={editingProduct.category_id || (editingProduct.product_type === 'tea' ? 'cat-teas' : 'cat-seeds')}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                        product_type: e.target.value === 'cat-teas' ? 'tea' : 'seed',
                      })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white cursor-pointer"
                  >
                    <option value="cat-seeds">Raw seeds (seeds tab)</option>
                    <option value="cat-teas">Mountain teas (teas tab)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Catalog Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                {/* Pack Sizes, Grams & Pricing Section */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lime text-xs uppercase tracking-wider">
                          Pack Sizes, Grams &amp; Pricing *
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white">
                          {(editingProduct.variants || []).length}{' '}
                          {(editingProduct.variants || []).length === 1 ? 'Size' : 'Sizes'}
                        </span>
                      </div>
                      <p className="text-[11px] text-botanical-sage mt-0.5">
                        Manage all pack sizes and pricing. Customers select their desired weight on the storefront with instant price updating.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-botanical-sage uppercase font-semibold">Quick add:</span>
                      <button
                        type="button"
                        onClick={() => handleAddPresetEditVariant(250)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 250g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetEditVariant(500)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 500g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetEditVariant(1000)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium glass-btn-3d hover:text-white"
                      >
                        + 1kg
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(editingProduct.variants || []).map((v: VariantFormRow, idx: number) => (
                      <div
                        key={v.id || idx}
                        className="p-3 rounded-xl bg-black/35 border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        {/* Gram weight */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Weight (Grams) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="10"
                              required
                              value={v.weight_grams}
                              onChange={(e) => handleUpdateEditVariant(idx, 'weight_grams', e.target.value)}
                              placeholder="250"
                              className="glass-input-3d w-full pl-3 pr-7 py-1.5 rounded-lg text-xs font-mono font-bold"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-botanical-sage pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>

                        {/* Price PKR */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Price in PKR (Rs.) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={v.price_pkr}
                            onChange={(e) => handleUpdateEditVariant(idx, 'price_pkr', e.target.value)}
                            placeholder="e.g. 950"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-lime"
                          />
                        </div>

                        {/* Compare Price */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Compare (Rs.)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={v.compare_price_pkr || ''}
                            onChange={(e) => handleUpdateEditVariant(idx, 'compare_price_pkr', e.target.value)}
                            placeholder="e.g. 1100"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Stock Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-botanical-sage mb-0.5">
                            Stock Units
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={v.inventory_quantity}
                            onChange={(e) => handleUpdateEditVariant(idx, 'inventory_quantity', e.target.value)}
                            placeholder="50"
                            className="glass-input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Status Toggle & Remove */}
                        <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 sm:pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateEditVariant(
                                idx,
                                'status',
                                v.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE'
                              )
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                              v.status === 'INACTIVE'
                                ? 'bg-white/10 text-white/50 border-white/10'
                                : 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30'
                            }`}
                            title="Toggle active status"
                          >
                            {v.status === 'INACTIVE' ? 'Hidden' : 'Active'}
                          </button>

                          <button
                            type="button"
                            disabled={(editingProduct.variants || []).length <= 1}
                            onClick={() => handleRemoveEditVariant(idx)}
                            className={`p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-all ${
                              (editingProduct.variants || []).length <= 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                            title={
                              (editingProduct.variants || []).length <= 1
                                ? 'At least 1 size required'
                                : 'Remove size option'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddPresetEditVariant(500)}
                      className="glass-btn-3d px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-lime hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Pack Size / Gram Variant</span>
                    </button>
                    {(editingProduct.variants || []).length > 0 && (
                      <span className="text-[11px] text-botanical-sage font-mono">
                        Base starting price: <strong className="text-white">Rs. {editingProduct.variants[0].price_pkr}</strong> ({editingProduct.variants[0].weight_grams}g)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER, NEW, LIMITED"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingProduct.short_description || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, short_description: e.target.value })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Ingredients</label>
                  <input
                    type="text"
                    value={editingProduct.ingredients || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, ingredients: e.target.value })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Usage Instructions (Optional)</label>
                  <input
                    type="text"
                    value={editingProduct.usage_instructions || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, usage_instructions: e.target.value })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Storage Instructions (Optional)</label>
                  <input
                    type="text"
                    value={editingProduct.storage_instructions || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, storage_instructions: e.target.value })
                    }
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                {editingProduct.category_id === 'cat-teas' && (
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <span className="font-semibold text-lime text-xs block">
                      Mountain Herbal Tea Attributes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Flavor Notes</label>
                        <input
                          type="text"
                          value={editingProduct.flavor_profile || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, flavor_profile: e.target.value })
                          }
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Caffeine Level</label>
                        <input
                          type="text"
                          value={editingProduct.caffeine_level || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, caffeine_level: e.target.value })
                          }
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Brew / Steep Time</label>
                        <input
                          type="text"
                          value={editingProduct.steep_time || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, steep_time: e.target.value })
                          }
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1">Water Temperature</label>
                        <input
                          type="text"
                          value={editingProduct.water_temp || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, water_temp: e.target.value })
                          }
                          className="glass-input-3d w-full px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="glass-btn-3d px-4 py-2 rounded-xl font-semibold"
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
