'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Dialog } from '@/components/ui/Dialog';
import { CatalogSelect } from '@/components/ui/CatalogSelect';
import { getCatalogPrice, isKit, type CatalogItem } from '@/lib/catalog';
import { catalogFilterKeys, catalogFilterOptions, categoryItems, matchCatalog, readCatalogFilters, type CatalogCategory, type FilterOption } from '@/lib/catalog-filters';
import { formatPKR } from '@/lib/utils';

type Props = { initialItems: CatalogItem[]; categories?: CatalogCategory[]; title?: string; description?: string; lockedCategory?: string };
const allOption = (label: string, options: FilterOption[]): FilterOption[] => [{value:'all',label},...options];
const priceOptions = [{value:'all',label:'All prices'},{value:'under1000',label:'Under Rs. 1,000'},{value:'1000to2000',label:'Rs. 1,000\u20132,000'},{value:'above2000',label:'Above Rs. 2,000'}];
const pairingOptions = [{value:'all',label:'All pairings'},{value:'follicular',label:'Pumpkin & flax'},{value:'luteal',label:'Sunflower & sesame'}];
export function ShopCatalogClient({initialItems,title='The pantry',description='Find raw seeds, seed kits and loose teas for your daily kitchen.',lockedCategory,categories=[{label:'All products',slug:'all'},{label:'Raw seeds',slug:'seeds'},{label:'Seed kits',slug:'kits'},{label:'Mountain teas',slug:'teas'}]}: Props) {
 const params = useSearchParams(); const path = usePathname(); const [open,setOpen] = useState(false);
 const searchParam = params.get('search') || '';
 const [query,setQuery] = useState(searchParam);
 useEffect(()=>{setQuery(searchParam);},[searchParam]);
 const filters = useMemo(()=>readCatalogFilters(params,initialItems,categories,lockedCategory),[params,initialItems,categories,lockedCategory]);
 const options = useMemo(()=>catalogFilterOptions(categoryItems(initialItems,filters.category,categories)),[initialItems,filters.category,categories]);
 const change = (name: string,value: string) => {
  const next = new URLSearchParams(window.location.search);
  if (name === 'category') for (const key of ['phase','collection','pack','caffeine','highlight']) next.delete(key);
  if (!value || value === 'all' || name === 'sort' && value === 'featured') next.delete(name); else next.set(name,value);
  window.history.replaceState(null,'',path + (next.size ? '?' + next.toString() : ''));
 };
 const reset = () => {
  setQuery(''); const next = new URLSearchParams(window.location.search);
  for (const key of [...catalogFilterKeys,'search']) next.delete(key);
  window.history.replaceState(null,'',path + (next.size ? '?' + next.toString() : ''));
 };
 useEffect(()=>{const timer=setTimeout(()=>{if(query!==(new URLSearchParams(window.location.search).get('search')||''))change('search',query.trim().slice(0,100));},180);return()=>clearTimeout(timer);},[query,path]);
 const filtered = useMemo(()=>matchCatalog(initialItems,filters,categories,query),[initialItems,filters,categories,query]);
 const collections = options.kind === 'teas' ? [{value:'all',label:'All teas'},{value:'herbal',label:'Herbal teas'},{value:'green',label:'Green tea'}] : options.kind === 'kits' ? [{value:'all',label:'All kits'},{value:'pairings',label:'Two-seed pairings'},{value:'complete',label:'Four-seed kits'}] : [];
 const active = [
  ...(!lockedCategory && filters.category !== 'all' ? [{name:'category',label:categories.find(option=>option.slug===filters.category)?.label || filters.category}] : []),
  ...(filters.phase !== 'all' ? [{name:'phase',label:pairingOptions.find(option=>option.value===filters.phase)?.label || ''}] : []),
  ...(filters.price !== 'all' ? [{name:'price',label:priceOptions.find(option=>option.value===filters.price)?.label || ''}] : []),
  ...(filters.collection !== 'all' ? [{name:'collection',label:collections.find(option=>option.value===filters.collection)?.label || ''}] : []),
  ...(filters.pack !== 'all' ? [{name:'pack',label:options.packs.find(option=>option.value===filters.pack)?.label + ' pack'}] : []),
  ...(filters.caffeine !== 'all' ? [{name:'caffeine',label:options.caffeine.find(option=>option.value===filters.caffeine)?.label || ''}] : []),
  ...(filters.highlight !== 'all' ? [{name:'highlight',label:options.highlights.find(option=>option.value===filters.highlight)?.label || ''}] : []),
  ...(filters.stock ? [{name:'stock',label:'Available packs'}] : []),
 ];
 const count=active.length; const complete=initialItems.find(item=>isKit(item)&&item.slug==='complete-cycle-kit');
 const select=(name:string,label:string,value:string,values:FilterOption[],prefix:string)=><CatalogSelect id={prefix+'-'+name} label={label} value={value} options={values} onChange={value=>change(name,value)}/>;
 const filterControls=(prefix:string)=><div className="space-y-5">
  {!lockedCategory && select('category','Collection',filters.category,categories.map(category=>({value:category.slug,label:category.label})),prefix)}
  {options.hasSeeds && select('phase','Seed pairing',filters.phase,pairingOptions,prefix)}
  {select('price','Price range',filters.price,priceOptions,prefix)}
  {options.packs.length>0 && select('pack','Pack size',filters.pack,allOption('All pack sizes',options.packs),prefix)}
  {options.caffeine.length>0 && select('caffeine','Caffeine level',filters.caffeine,allOption('All caffeine levels',options.caffeine),prefix)}
  {options.highlights.length>0 && select('highlight','Product highlights',filters.highlight,allOption('All products',options.highlights),prefix)}
  <div className="border-t border-border-gray pt-4"><label className="flex items-center gap-3 min-h-11 text-sm cursor-pointer"><input type="checkbox" className="h-4 w-4 accent-seedly-dark" checked={filters.stock} onChange={event=>change('stock',event.target.checked?'1':'')}/>Available packs only</label><p className="mt-2 text-xs text-muted-gray leading-relaxed">{filters.pack !== 'all' ? 'Prices and availability reflect your selected pack size.' : 'Prices reflect the displayed pack. Choose a size to compare matching packs.'}</p></div>
  <button type="button" className="min-h-11 text-sm underline underline-offset-4 disabled:opacity-40" disabled={!count&&!query} onClick={reset}>Reset filters</button>
 </div>;
 return <div className="store-container py-8 sm:py-12">
  <nav className="text-sm text-muted-gray mb-6" aria-label="Breadcrumb"><Link href="/">Home</Link> / <span>{title}</span></nav><h1 className="text-3xl sm:text-4xl">{title}</h1><p className="mt-3 text-muted-gray max-w-2xl">{description}</p>
  {!lockedCategory && <div className="flex overflow-x-auto gap-6 border-b border-border-gray mt-8">{categories.map(category=><button key={category.slug} type="button" onClick={()=>change('category',category.slug)} aria-pressed={filters.category===category.slug} className={'category-tab '+(filters.category===category.slug?'active':'')}>{category.label}</button>)}</div>}
  {collections.length>0 && <div className="flex flex-wrap gap-3 mt-5">{collections.map(option=><button key={option.value} type="button" className={'button-secondary '+(filters.collection===option.value?'bg-seedly-light':'')} aria-pressed={filters.collection===option.value} onClick={()=>change('collection',option.value)}>{option.label}</button>)}</div>}
  <div className="flex flex-wrap items-center gap-3 justify-between py-6">
   <div className="flex items-center gap-4"><button className="button-secondary lg:hidden" type="button" aria-haspopup="dialog" onClick={()=>setOpen(true)}><SlidersHorizontal size={16}/>Filters{count?' ('+count+')':''}</button><p className="text-sm text-muted-gray" role="status" aria-live="polite">{filtered.length} {filtered.length===1?'product':'products'}</p></div>
   <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto"><input type="search" className="form-input min-w-0 flex-1 sm:w-56 sm:flex-none" aria-label="Search this collection" placeholder="Search collection" maxLength={100} value={query} onChange={event=>setQuery(event.target.value)}/><CatalogSelect id="sort" label="Sort products" hideLabel className="w-[48%] max-w-52 shrink-0 sm:w-48" value={filters.sort} onChange={value=>change('sort',value)} options={[{value:'featured',label:'Featured'},{value:'price-asc',label:'Price: low to high'},{value:'price-desc',label:'Price: high to low'}]}/></div>
  </div>
  {(count>0||query) && <div className="flex flex-wrap items-center gap-2 mb-6" aria-label="Active filters">{active.map(filter=><button type="button" key={filter.name} onClick={()=>change(filter.name,'all')} className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full bg-seedly-light px-3 text-xs text-seedly-dark" aria-label={'Remove '+filter.label+' filter'}><span className="break-words">{filter.label}</span><X size={14} className="shrink-0"/></button>)}{query && <button type="button" onClick={()=>{setQuery('');change('search','');}} className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full bg-seedly-light px-3 text-xs text-seedly-dark" aria-label="Remove search filter"><span className="break-all">Search: {query}</span><X size={14} className="shrink-0"/></button>}<button type="button" className="min-h-10 px-2 text-sm underline underline-offset-4" onClick={reset}>Clear all</button></div>}
  <div className="grid items-start gap-7 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-9">
   <aside data-select-scroll-container aria-label="Product filters" className="hidden lg:block lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto rounded-2xl border border-border-gray bg-white p-5"><div className="flex items-center gap-2 mb-6"><SlidersHorizontal size={17}/><h2 className="text-lg">Filters</h2>{count>0&&<span className="ml-auto rounded-full bg-seedly-light px-2 py-1 text-xs">{count}</span>}</div>{filterControls('sidebar')}</aside>
   <div className="min-w-0">{filtered.length ? <div className="product-grid catalog-grid">{filtered.map(({item,variant})=><ProductCard key={item.id} product={item} selectedVariantId={variant?.id}/>)}</div> : <div className="text-center py-20 rounded-xl border border-border-gray"><h2 className="text-xl">No products match these filters</h2><p className="text-muted-gray mt-3">Try another ingredient or clear your filters.</p><button type="button" className="button-secondary mt-6" onClick={reset}>Clear filters</button></div>}</div>
  </div>
  {lockedCategory==='kits'&&<section className="mt-14" aria-labelledby="compare-kits-heading"><h2 id="compare-kits-heading" className="text-2xl mb-6">Compare the kits</h2><div className="grid md:grid-cols-3 gap-5">{initialItems.filter(isKit).map(kit=><article key={kit.id} className="checkout-section flex flex-col"><h3 className="text-lg font-medium">{kit.name}</h3><p className="text-2xl font-semibold mt-3">{formatPKR(kit.price_minor)}</p><p className="text-sm text-muted-gray mt-2">{kit.package_size}</p><ul className="text-sm text-muted-gray space-y-2 my-5">{kit.items.map(item=><li key={item.id}>{item.quantity} {' \u00d7 '} {item.product_name}{item.variant_name?' \u00b7 '+item.variant_name:''}</li>)}</ul><Link href={'/kits/'+kit.slug} className="button-secondary mt-auto">View kit details</Link></article>)}</div></section>}
  {complete&&lockedCategory!=='kits'&&<section className="mt-16 py-8 border-t border-border-gray flex flex-wrap justify-between gap-6"><div><h2 className="text-2xl">Bring the routine together</h2><p className="text-muted-gray mt-2">{complete.name} {' \u00b7 '} {formatPKR(getCatalogPrice(complete))}</p></div><Link className="button-secondary self-center" href={'/kits/'+complete.slug}>Explore the kit</Link></section>}
  <Dialog open={open} onClose={()=>setOpen(false)} title="Product filters" className="filter-dialog"><div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-border-gray p-5"><h2 className="text-2xl">Filters</h2><button type="button" className="icon-button" aria-label="Close filters" onClick={()=>setOpen(false)}><X size={20}/></button></div><div data-select-scroll-container className="flex-1 overflow-y-auto p-6">{filterControls('drawer')}</div><div className="border-t border-border-gray p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><p className="text-sm text-muted-gray mb-3" role="status">{filtered.length} products{' \u00b7 '}Filters apply instantly</p><button type="button" className="button-primary w-full" onClick={()=>setOpen(false)}>View products</button></div></div></Dialog>
 </div>;
}
export default ShopCatalogClient;
