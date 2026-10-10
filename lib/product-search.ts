import type { Kit, Product } from './types';

export interface ProductSearchResult {
  id: string;
  name: string;
  href: string;
  image: string;
  category: string;
  size: string;
  priceMinor: number;
}

export interface ProductSearchResponse {
  items: ProductSearchResult[];
  total: number;
}

// Use the same default size and price as the product cards.
export function toSearchResult(item: Product | Kit): ProductSearchResult {
  if ('package_size' in item) {
    return {
      id: 'kit-' + item.id,
      name: item.name,
      href: '/kits/' + item.slug,
      image: item.image_url,
      category: 'Cycle kit',
      size: item.package_size,
      priceMinor: item.price_minor,
    };
  }

  const variants = item.variants?.filter((variant) => variant.status === 'ACTIVE') || [];
  const variant = variants.find((candidate) => candidate.weight_grams === item.weight_grams) || variants[0];
  const weight = variant?.weight_grams ?? item.weight_grams;

  return {
    id: 'product-' + item.id,
    name: item.name,
    href: '/' + (item.product_type === 'tea' ? 'teas' : 'seeds') + '/' + item.slug,
    image: item.image_url,
    category: item.product_type === 'tea' ? 'Mountain tea' : 'Raw seeds',
    size: variant?.option_value || (weight ? weight + 'g' : ''),
    priceMinor: variant?.price_minor ?? item.price_minor,
  };
}