import { getDefaultVariant, isKit, normalizeSearch, type CatalogItem } from './catalog';
import type { Product, ProductVariant } from './types';

export type CatalogCategory = { id?: string; slug: string; label: string };
export type FilterOption = { value: string; label: string };
export type CatalogFilters = {
 category: string; phase: string; price: string; stock: boolean; collection: string;
 pack: string; caffeine: string; highlight: string; sort: string;
};
export type CatalogMatch = { item: CatalogItem; variant?: ProductVariant };
export const catalogFilterKeys = ['category', 'phase', 'price', 'stock', 'collection', 'pack', 'caffeine', 'highlight'] as const;
export function catalogKind(item: CatalogItem): string { return isKit(item) ? 'kits' : item.product_type === 'tea' ? 'teas' : 'seeds'; }
export function categoryItems(items: CatalogItem[], category: string, categories: CatalogCategory[]): CatalogItem[] {
 const selected = categories.find(option => option.slug === category);
 return items.filter(item => item.status === 'ACTIVE' && (category === 'all' || (selected?.id ? item.category_id === selected.id : catalogKind(item) === category)));
}
export function activeCatalogVariants(product: Product): ProductVariant[] {
 return (product.variants || []).filter(variant => variant.status === 'ACTIVE' && (!variant.product_id || variant.product_id === product.id));
}
export function resolveCatalogVariant(product: Product, id?: string): ProductVariant | undefined {
 const variants = activeCatalogVariants(product);
 return variants.find(variant => variant.id === id) || variants.find(variant => variant.id === getDefaultVariant(product)?.id) || variants[0];
}
const normalizeAttribute = (value: string) => value.trim().toLowerCase();
const badgeLabel = (value: string) => value.trim().replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, character => character.toUpperCase());
export function catalogFilterOptions(items: CatalogItem[]) {
 const weights = new Set<number>(); const caffeine = new Map<string, string>(); const badges = new Map<string, string>();
 for (const item of items) {
  if (!isKit(item)) {
   for (const variant of activeCatalogVariants(item)) if (Number.isFinite(variant.weight_grams) && variant.weight_grams > 0) weights.add(variant.weight_grams);
   if (item.product_type === 'tea' && item.caffeine_level?.trim()) caffeine.set(normalizeAttribute(item.caffeine_level), item.caffeine_level.trim());
  }
  if (item.badge?.trim()) badges.set('badge:' + normalizeAttribute(item.badge), badgeLabel(item.badge));
 }
 return {
  packs: [...weights].sort((a,b) => a-b).map(weight => ({value: String(weight), label: weight >= 1000 ? weight / 1000 + ' kg' : weight + 'g'})),
  caffeine: [...caffeine].sort((a,b) => a[1].localeCompare(b[1])).map(([value,label]) => ({value,label})),
  highlights: [...(items.some(item => item.is_featured) ? [{value:'featured', label:'Featured picks'}] : []), ...[...badges].sort((a,b)=>a[1].localeCompare(b[1])).map(([value,label])=>({value,label}))],
  hasSeeds: items.some(item => catalogKind(item) === 'seeds'),
  kind: items.length && items.every(item => catalogKind(item) === catalogKind(items[0])) ? catalogKind(items[0]) : 'all',
 };
}
export function readCatalogFilters(params: Pick<URLSearchParams, 'get'>, items: CatalogItem[], categories: CatalogCategory[], lockedCategory?: string): CatalogFilters {
 const requested = params.get('category') || 'all';
 const category = lockedCategory || (requested === 'all' || categories.some(option => option.slug === requested) ? requested : 'all');
 const options = catalogFilterOptions(categoryItems(items,category,categories));
 const valid = (name: string, allowed: string[]) => { const value = params.get(name) || 'all'; return allowed.includes(value) ? value : 'all'; };
 const collectionValues = options.kind === 'teas' ? ['herbal','green'] : options.kind === 'kits' ? ['complete','pairings'] : [];
 const requestedSort = params.get('sort') || 'featured';
 return {category, phase: valid('phase',options.hasSeeds ? ['follicular','luteal'] : []), price: valid('price',['under1000','1000to2000','above2000']),
  stock: params.get('stock') === '1', collection: valid('collection',collectionValues), pack: valid('pack',options.packs.map(option=>option.value)),
  caffeine: valid('caffeine',options.caffeine.map(option=>option.value)), highlight: valid('highlight',options.highlights.map(option=>option.value)),
  sort: ['featured','price-asc','price-desc'].includes(requestedSort) ? requestedSort : 'featured' };
}
export function matchCatalog(items: CatalogItem[], filters: CatalogFilters, categories: CatalogCategory[], search = ''): CatalogMatch[] {
 const term = normalizeSearch(search).toLowerCase();
 const matches: CatalogMatch[] = [];
 for (const item of categoryItems(items,filters.category,categories)) {
  const kit = isKit(item);
  if (term && !(item.name + ' ' + item.short_description + ' ' + item.ingredients).toLowerCase().includes(term)) continue;
  if (filters.phase !== 'all' && (kit || item.phase !== filters.phase)) continue;
  if (filters.collection === 'herbal' && (kit || item.product_type !== 'tea' || item.slug === 'green-tea')) continue;
  if (filters.collection === 'green' && (kit || item.product_type !== 'tea' || item.slug !== 'green-tea')) continue;
  if (filters.collection === 'complete' && (!kit || item.items.length < 4)) continue;
  if (filters.collection === 'pairings' && (!kit || item.items.length >= 4)) continue;
  if (filters.caffeine !== 'all' && (kit || item.product_type !== 'tea' || !item.caffeine_level || normalizeAttribute(item.caffeine_level) !== filters.caffeine)) continue;
  if (filters.highlight === 'featured' && !item.is_featured) continue;
  if (filters.highlight.startsWith('badge:') && 'badge:' + normalizeAttribute(item.badge || '') !== filters.highlight) continue;
  let variant: ProductVariant | undefined;
  if (kit) {
   if (filters.pack !== 'all' || filters.stock && item.computed_stock <= 0) continue;
  } else {
   const candidates = activeCatalogVariants(item).filter(value => (filters.pack === 'all' || String(value.weight_grams) === filters.pack) && (!filters.stock || value.inventory_quantity > 0));
   variant = candidates.find(value => value.id === getDefaultVariant(item)?.id) || candidates[0];
   if (!variant) continue;
  }
  const amount = variant?.price_minor ?? item.price_minor;
  if (filters.price === 'under1000' && amount >= 100000 || filters.price === '1000to2000' && (amount < 100000 || amount > 200000) || filters.price === 'above2000' && amount <= 200000) continue;
  matches.push({item,variant});
 }
 return matches.sort((a,b) => filters.sort === 'price-asc' ? (a.variant?.price_minor ?? a.item.price_minor) - (b.variant?.price_minor ?? b.item.price_minor)
  : filters.sort === 'price-desc' ? (b.variant?.price_minor ?? b.item.price_minor) - (a.variant?.price_minor ?? a.item.price_minor)
  : Number(!!b.item.is_featured) - Number(!!a.item.is_featured));
}
