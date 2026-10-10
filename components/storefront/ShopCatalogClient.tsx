'use client';
import { useState, useMemo, useEffect, type PointerEvent, type KeyboardEvent, type FocusEvent } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Dialog } from '@/components/ui/Dialog';
import { getCatalogPrice, hasAvailablePack, isKit, normalizeSearch, type CatalogItem } from '@/lib/catalog';
import { formatPKR } from '@/lib/utils';
type Props = { initialItems: CatalogItem[]; currentCategory?: string; currentSort?: string; currentSearch?: string; sortOptions?: {label:string;value:string}[]; categories?: {id?:string;label:string;slug:string}[]; title?: string; description?: string; lockedCategory?: string };
// Native selects can match :focus-visible even when opened with a pointer.
// Suppress that extra outline for pointer use while keeping keyboard focus visible.
const selectFocusProps = {
  onPointerDown: (event: PointerEvent<HTMLSelectElement>) => { event.currentTarget.dataset.pointerFocus = 'true'; },
  onKeyDown: (event: KeyboardEvent<HTMLSelectElement>) => { delete event.currentTarget.dataset.pointerFocus; },
  onBlur: (event: FocusEvent<HTMLSelectElement>) => { delete event.currentTarget.dataset.pointerFocus; },
};
export function ShopCatalogClient({ initialItems, title = 'The pantry', description = 'Find raw seeds, seed kits and loose teas for your daily kitchen.', lockedCategory, categories = [{label:'All products',slug:'all'},{label:'Raw seeds',slug:'seeds'},{label:'Seed kits',slug:'kits'},{label:'Mountain teas',slug:'teas'}] }: Props) {
  const params = useSearchParams(); const path = usePathname(); const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(params.get('search') || '');
  useEffect(() => { setQuery(params.get('search') || ''); }, [params]);
  const category = lockedCategory || params.get('category') || 'all';
  const sort = params.get('sort') || 'featured'; const phase = params.get('phase') || 'all'; const price = params.get('price') || 'all'; const stock = params.get('stock') === '1'; const collection = params.get('collection') || 'all';
  const change = (name: string, value: string) => { const next = new URLSearchParams(window.location.search); if(name === 'category'){next.delete('phase');next.delete('collection');} if (!value || value === 'all' || value === 'featured') next.delete(name); else next.set(name,value); window.history.replaceState(null,'',path + (next.size ? '?' + next.toString() : '')); };
  const reset = () => { setQuery(''); window.history.replaceState(null,'',path); };
  useEffect(() => { const timer = setTimeout(() => { if (query !== (new URLSearchParams(window.location.search).get('search') || '')) change('search',query.trim().slice(0,100)); },180); return () => clearTimeout(timer); },[query,path]);
  const filtered = useMemo(() => {
    const term = normalizeSearch(query).toLowerCase();
    const list = initialItems.filter(item => {
      const kind = isKit(item) ? 'kits' : item.product_type === 'tea' ? 'teas' : 'seeds';
      const selectedCategory = categories.find(option => option.slug === category);
      if (category !== 'all' && (selectedCategory?.id ? item.category_id !== selectedCategory.id : category !== kind)) return false;
      if (term && !(item.name + ' ' + item.short_description + ' ' + item.ingredients).toLowerCase().includes(term)) return false;
      const itemPhase = !isKit(item) ? item.phase || (['pumpkin-seeds','flax-seeds','golden-flaxseed'].includes(item.slug) ? 'follicular' : ['sunflower-seeds','sesame-seeds','white-sesame'].includes(item.slug) ? 'luteal' : null) : null;
      if (phase !== 'all' && itemPhase !== phase) return false;
      if(collection === 'herbal' && (isKit(item) || item.product_type !== 'tea' || item.slug === 'green-tea'))return false;
      if(collection === 'green' && (isKit(item) || item.product_type !== 'tea' || item.slug !== 'green-tea'))return false;
      if(collection === 'complete' && (!isKit(item) || item.items.length < 4))return false;
      if(collection === 'pairings' && (!isKit(item) || item.items.length >= 4))return false;
      if (stock && !hasAvailablePack(item)) return false;
      const amount = getCatalogPrice(item);
      if (price === 'under1000' && amount >= 100000) return false;
      if (price === '1000to2000' && (amount < 100000 || amount > 200000)) return false;
      if (price === 'above2000' && amount <= 200000) return false;
      return true;
    });
    return list.sort((a,b) => sort === 'price-asc' ? getCatalogPrice(a) - getCatalogPrice(b) : sort === 'price-desc' ? getCatalogPrice(b) - getCatalogPrice(a) : Number(!!b.is_featured) - Number(!!a.is_featured));
  },[initialItems,query,category,sort,phase,price,stock,collection,categories]);
  const count = Number(phase !== 'all') + Number(price !== 'all') + Number(stock) + Number(collection !== 'all');
  const complete = initialItems.find(item => isKit(item) && item.slug === 'complete-cycle-kit');
  const select = (name:string,label:string,value:string,options:[string,string][],prefix:string) => <div><label htmlFor={prefix+'-'+name} className="field-label">{label}</label><select id={prefix+'-'+name} className="form-input catalog-select" {...selectFocusProps} value={value} onChange={e => change(name,e.target.value)}>{options.map(([v,l]) => <option value={v} key={v}>{l}</option>)}</select></div>;
  const filterControls = (prefix:string) => <div className="space-y-6">{!lockedCategory && select('category','Collection',category,categories.map(c => [c.slug,c.label]),prefix)}{category !== 'teas' && category !== 'kits' && select('phase','Seed pairing',phase,[['all','All pairings'],['follicular','Pumpkin & flax'],['luteal','Sunflower & sesame']],prefix)}{select('price','Price range',price,[['all','All prices'],['under1000','Under Rs. 1,000'],['1000to2000','Rs. 1,000–2,000'],['above2000','Above Rs. 2,000']],prefix)}<div className="border-t border-border-gray pt-5"><label className="flex items-center gap-3 min-h-11 text-sm cursor-pointer"><input type="checkbox" className="h-4 w-4 accent-seedly-dark" checked={stock} onChange={e => change('stock',e.target.checked ? '1' : '')} />Available packs only</label><p className="mt-2 text-xs text-muted-gray leading-relaxed">Prices reflect the default pack. Check product details for other sizes.</p></div><button type="button" className="min-h-11 text-sm underline underline-offset-4 disabled:opacity-40" disabled={!count && !query} onClick={reset}>Reset filters</button></div>;
  return <div className="store-container py-8 sm:py-12"><nav className="text-sm text-muted-gray mb-6" aria-label="Breadcrumb"><Link href="/">Home</Link> / <span>{title}</span></nav><h1 className="text-3xl sm:text-4xl">{title}</h1><p className="mt-3 text-muted-gray max-w-2xl">{description}</p>
    {!lockedCategory && <div className="flex overflow-x-auto gap-6 border-b border-border-gray mt-8">{categories.map(cat => <button key={cat.slug} type="button" onClick={() => change('category',cat.slug)} aria-pressed={category === cat.slug} className={'category-tab ' + (category === cat.slug ? 'active' : '')}>{cat.label}</button>)}</div>}
    {(category === "teas" || category === "kits") && <div className="flex flex-wrap gap-3 mt-5">{(category === "teas" ? [["all","All teas"],["herbal","Herbal teas"],["green","Green tea"]] : [["all","All kits"],["pairings","Two-seed pairings"],["complete","Four-seed kits"]]).map(([value,label])=><button key={value} type="button" className={"button-secondary " + (collection === value ? "bg-seedly-light" : "")} aria-pressed={collection===value} onClick={()=>change("collection",value)}>{label}</button>)}</div>}
    <div className="flex flex-wrap items-center gap-3 justify-between py-6"><div className="flex items-center gap-4"><button className="button-secondary lg:hidden" type="button" onClick={() => setOpen(true)}><SlidersHorizontal size={16} />Filters{count ? ' (' + count + ')' : ''}</button><p className="text-sm text-muted-gray" role="status">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p></div><div className="flex items-center gap-3 flex-wrap"><input type="search" className="form-input w-48 sm:w-56" aria-label="Search this collection" placeholder="Search this collection" maxLength={100} value={query} onChange={e => setQuery(e.target.value)} /><label htmlFor="sort" className="sr-only">Sort products</label><select id="sort" className="form-input catalog-select w-auto" {...selectFocusProps} value={sort} onChange={e => change('sort',e.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div></div>
    {(count > 0 || query) && <button type="button" className="text-sm underline mb-6 min-h-11" onClick={reset}>Clear search & filters</button>}
    <div className="grid items-start gap-7 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-9"><aside aria-label="Product filters" className="hidden lg:block lg:sticky lg:top-28 rounded-2xl border border-border-gray bg-white p-5"><div className="flex items-center gap-2 mb-6"><SlidersHorizontal size={17} /><h2 className="text-lg">Filters</h2>{count > 0 && <span className="ml-auto rounded-full bg-seedly-light px-2 py-1 text-xs">{count}</span>}</div>{filterControls('sidebar')}</aside><div className="min-w-0">
    {filtered.length ? <div className="product-grid catalog-grid">{filtered.map(item => <ProductCard key={item.id} product={item} />)}</div> : <div className="text-center py-20 rounded-xl border border-border-gray"><h2 className="text-xl">No products match these filters</h2><p className="text-muted-gray mt-3">Try another ingredient or clear your filters.</p><button type="button" className="button-secondary mt-6" onClick={reset}>Clear filters</button></div>}
    </div></div>
    {lockedCategory === 'kits' && <section className="mt-14" aria-labelledby="compare-kits-heading"><h2 id="compare-kits-heading" className="text-2xl mb-6">Compare the kits</h2><div className="grid md:grid-cols-3 gap-5">{initialItems.filter(isKit).map(kit=><article key={kit.id} className="checkout-section flex flex-col"><h3 className="text-lg font-medium">{kit.name}</h3><p className="text-2xl font-semibold mt-3">{formatPKR(kit.price_minor)}</p><p className="text-sm text-muted-gray mt-2">{kit.package_size}</p><ul className="text-sm text-muted-gray space-y-2 my-5">{kit.items.map(item=><li key={item.id}>{item.quantity} × {item.product_name}{item.variant_name ? ' · ' + item.variant_name : ''}</li>)}</ul><Link href={'/kits/'+kit.slug} className="button-secondary mt-auto">View kit details</Link></article>)}</div></section>}
    {complete && lockedCategory !== "kits" && <section className="mt-16 py-8 border-t border-border-gray flex flex-wrap justify-between gap-6"><div><h2 className="text-2xl">Bring the routine together</h2><p className="text-muted-gray mt-2">{complete.name} · {formatPKR(getCatalogPrice(complete))}</p></div><Link className="button-secondary self-center" href={'/kits/' + complete.slug}>Explore the kit</Link></section>}
    <Dialog open={open} onClose={() => setOpen(false)} title="Product filters" className="filter-dialog"><div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-border-gray p-5"><h2 className="text-2xl">Filters</h2><button type="button" className="icon-button" aria-label="Close filters" onClick={() => setOpen(false)}><X size={20} /></button></div><div className="flex-1 overflow-y-auto p-6">{filterControls('drawer')}</div><div className="border-t border-border-gray p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><p className="text-sm text-muted-gray mb-3" role="status">{filtered.length} products · Filters apply instantly</p><button type="button" className="button-primary w-full" onClick={() => setOpen(false)}>View products</button></div></div></Dialog>
  </div>;
}
export default ShopCatalogClient;
