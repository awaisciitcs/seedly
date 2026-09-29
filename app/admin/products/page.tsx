'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPKR, minorToPKR } from '../../../lib/utils';
import { Package, Search, Plus, Edit, Check, Trash2, X, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
          image_url: imageUrl || (productType === 'tea'
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Catalog & Inventory</h1>
          <p className="text-xs text-muted-gray mt-1">
            Create, edit, remove, and manage all raw pantry seed and tea SKUs and warehouse stock.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold shadow-card flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-border-gray space-y-5 my-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-gray/60 pb-3">
              <h3 className="font-serif font-bold text-xl text-charcoal">Add New Product to Store</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-cream text-muted-gray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Black Chia Seeds or Lavender Blossom Tea"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Product Category *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  >
                    <option value="seed">Raw Pantry Seed</option>
                    <option value="tea">Mountain Herbal Tea</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, BESTSELLER, LIMITED"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Price in PKR (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 950"
                    value={pricePKR}
                    onChange={(e) => setPricePKR(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Compare-At Price (Rs.)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1100"
                    value={comparePricePKR}
                    onChange={(e) => setComparePricePKR(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Pack Size / Weight (Grams)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="/images/products/pumpkin-seeds.svg or custom URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Short Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-line benefit descriptor shown on cards"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Full product sourcing and botanical background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Ingredients</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Pure Organic Raw Pumpkin Seeds (Cucurbita pepo)"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/30 border border-border-gray rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border-gray flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-gray rounded-xl text-muted-gray hover:text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl font-semibold shadow-card"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-border-gray space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-gray pb-2">
              <h3 className="font-serif font-bold text-lg text-charcoal">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-cream text-muted-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-gray rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Base Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.price_pkr}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price_pkr: e.target.value })}
                    className="w-full px-3 py-2 border border-border-gray rounded-xl text-sm font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Catalog Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border-gray rounded-xl text-sm"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.short_description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, short_description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-gray rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-gray rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-border-gray rounded-xl text-muted-gray font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-seedly-dark text-white rounded-xl font-semibold shadow-card"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Edit Modal */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-border-gray space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-charcoal">Adjust Variant Inventory</h3>
            <p className="text-xs text-muted-gray">
              SKU: <strong className="font-mono text-charcoal">{editingVariant.sku}</strong> ({editingVariant.option_value})
            </p>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">On-Hand Quantity (Units)</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border border-border-gray rounded-xl text-sm font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-gray hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-seedly-dark text-white rounded-xl text-xs font-semibold shadow-subtle"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream/60 border-b border-border-gray text-muted-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price (PKR)</th>
                <th className="py-4 px-6">Variants & Warehouse Stock</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray/50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-cream shrink-0 border border-border-gray">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-charcoal">{p.name}</p>
                          <Link
                            href={`/${p.product_type === 'tea' ? 'teas' : 'seeds'}/${p.slug}`}
                            target="_blank"
                            className="text-muted-gray hover:text-seedly-dark"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <p className="text-[11px] text-muted-gray font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 capitalize">
                    <span className="px-2.5 py-0.5 rounded-full bg-cream font-medium text-[11px]">
                      {p.product_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-serif font-bold text-sm text-charcoal">
                    {formatPKR(p.price_minor)}
                  </td>
                  <td className="py-4 px-6 space-y-1">
                    {p.variants?.map((v: any) => (
                      <div key={v.id} className="flex items-center gap-2">
                        <span className="font-medium text-charcoal">{v.option_value}:</span>
                        <span
                          className={`font-mono font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            v.inventory_quantity > 20
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {v.inventory_quantity} units
                        </span>
                        <button
                          onClick={() => {
                            setEditingVariant(v);
                            setNewStock(v.inventory_quantity);
                          }}
                          className="text-[10px] text-seedly-dark underline font-medium hover:text-charcoal"
                        >
                          Adjust
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-cream text-charcoal'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() =>
                        setEditingProduct({
                          ...p,
                          price_pkr: minorToPKR(p.price_minor),
                        })
                      }
                      className="px-2.5 py-1.5 bg-cream hover:bg-seedly-light text-seedly-dark rounded-lg font-medium transition-colors"
                      title="Edit Product Details"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                      title="Remove Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
