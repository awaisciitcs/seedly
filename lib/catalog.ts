import type { CartItem, Kit, Product, ProductVariant } from './types';

export type CatalogItem = Product | Kit;

export function isKit(item: CatalogItem): item is Kit {
  return 'items' in item || 'package_size' in item;
}

export function getDefaultVariant(product: Product): ProductVariant | undefined {
  const variants = product.variants?.filter(v => v.status === 'ACTIVE') || [];
  return variants.find(v => v.weight_grams === product.weight_grams) || variants.find(v => v.weight_grams === 250) || variants[0];
}

export function getCatalogPrice(item: CatalogItem): number {
  return isKit(item) ? item.price_minor : getDefaultVariant(item)?.price_minor ?? item.price_minor;
}

export function getCatalogStock(item: CatalogItem): number {
  return isKit(item) ? item.computed_stock : getDefaultVariant(item)?.inventory_quantity ?? 0;
}

export function hasAvailablePack(item: CatalogItem): boolean {
  return isKit(item) ? item.computed_stock > 0 : Boolean(item.variants?.some(v => v.status === 'ACTIVE' && v.inventory_quantity > 0));
}

export function toCartItem(item: CatalogItem, quantity = 1, variant?: ProductVariant): CartItem {
  const kit = isKit(item);
  const selected = kit ? undefined : variant || getDefaultVariant(item);
  return {
    id: `${item.id}-${kit ? 'kit' : selected?.id || 'default'}`,
    product_id: item.id, kit_id: kit ? item.id : undefined, variant_id: selected?.id,
    name: item.name, slug: item.slug, image_url: item.image_url,
    variant_label: kit ? item.package_size : selected?.option_value,
    price_minor: selected?.price_minor ?? item.price_minor,
    product_type: kit ? 'kit' : item.product_type,
    quantity, max_quantity: kit ? item.computed_stock : selected?.inventory_quantity ?? 0,
  };
}

export function normalizeSearch(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}
