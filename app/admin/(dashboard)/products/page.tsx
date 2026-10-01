'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPKR, minorToPKR } from '@/lib/utils';
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
} from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);

  // New Product Form State
  const [name, setName] = useState('');
  const [productType, setProductType] = useState<'seed' | 'tea'>('seed');
  const [pricePKR, setPricePKR] = useState('');
  const [comparePricePKR, setComparePricePKR] = useState('');
  const [weightGrams, setWeightGrams] = useState('250');
  const [initialStock, setInitialStock] = useState('50');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [usage, setUsage] = useState('');
  const [storage, setStorage] = useState('');
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !pricePKR) {
      setErrorMsg('Product name and price are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          product_type: productType,
          price_pkr: Number(pricePKR),
          compare_price_pkr: comparePricePKR ? Number(comparePricePKR) : null,
          weight_grams: Number(weightGrams),
          initial_stock: Number(initialStock),
          short_description: shortDesc,
          description,
          ingredients,
          usage_instructions: usage,
          storage_instructions: storage,
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

      setSuccessMsg(`Product "${name}" added to catalog successfully!`);
      setIsAddModalOpen(false);
      // Reset form
      setName('');
      setPricePKR('');
      setComparePricePKR('');
      setShortDesc('');
      setDescription('');
      setIngredients('');
      setImageUrl('');
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

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editingProduct.name,
          price_minor: Math.round(Number(editingProduct.price_pkr) * 100),
          short_description: editingProduct.short_description,
          description: editingProduct.description,
          status: editingProduct.status,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Product updated successfully!`);
        setEditingProduct(null);
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
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
      if (res.ok) {
        setSuccessMsg(`Product "${prodName}" removed from catalog.`);
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
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
            Create, edit, remove, and manage all raw pantry seed and tea SKUs and warehouse stock.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-lime-3d px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(183,228,89,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Glass Table Container */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
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
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">PRODUCT</th>
                <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
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
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* PRODUCT */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lime shrink-0 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white text-xs whitespace-nowrap">{p.name}</p>
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

                      {/* CATEGORY */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/90 border border-white/10 font-medium text-[10px] capitalize">
                          {p.product_type}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {formatPKR(p.price_minor)}
                      </td>

                      {/* VARIANTS & WAREHOUSE STOCK */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {p.variants?.map((v: any) => (
                            <div key={v.id} className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-botanical-sage text-[11px]">{v.option_value}:</span>
                              <span
                                className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                                  v.inventory_quantity > 20
                                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_6px_rgba(34,197,94,0.15)]'
                                    : 'bg-rose-950/70 text-rose-300 border-rose-500/30 shadow-[0_0_6px_rgba(244,63,94,0.15)]'
                                }`}
                              >
                                {v.inventory_quantity} units
                              </span>
                              <button
                                onClick={() => {
                                  setEditingVariant(v);
                                  setNewStock(v.inventory_quantity);
                                }}
                                className="text-[11px] text-lime/90 hover:text-lime underline cursor-pointer"
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
                          onClick={() =>
                            setEditingProduct({
                              ...p,
                              price_pkr: minorToPKR(p.price_minor),
                            })
                          }
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
        <div className="fixed inset-0 z-50 bg-[#021a10]/55 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 space-y-5 my-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-xl text-white">Add New Product to Store</h3>
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
                  <label className="block font-semibold text-white/90 mb-1">Product Category *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white"
                  >
                    <option value="seed">Raw Pantry Seed</option>
                    <option value="tea">Mountain Herbal Tea</option>
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

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Price in PKR (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 950"
                    value={pricePKR}
                    onChange={(e) => setPricePKR(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Compare-At Price (Rs.)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1100"
                    value={comparePricePKR}
                    onChange={(e) => setComparePricePKR(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Pack Size / Weight (Grams)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-white/90 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-mono"
                  />
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
                  <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Full product sourcing and botanical background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#021a10]/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-serif font-bold text-lg text-white">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="glass-btn-3d p-1 rounded-full text-botanical-sage"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-white/90 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/90 mb-1">Base Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.price_pkr}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price_pkr: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/90 mb-1">Catalog Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm bg-botanical-dark text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/90 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.short_description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, short_description: e.target.value })
                  }
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/90 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="glass-input-3d w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="glass-btn-3d px-4 py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-lime-3d px-5 py-2 rounded-xl font-bold"
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
