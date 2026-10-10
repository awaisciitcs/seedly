import { RequestError } from './request-guards';
import type { CheckoutLine } from './types';

export function parseCheckoutLines(input: unknown): CheckoutLine[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) throw new RequestError('Choose between 1 and 50 basket items.');
  const seen = new Set<string>();
  return input.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new RequestError('Invalid basket item.');
    const item = value as Record<string, unknown>;
    const identifier = (key: string, required = false): string | undefined => {
      const val = item[key];
      if (!required && (val === undefined || val === null || val === '')) return undefined;
      if (typeof val !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(val)) throw new RequestError('Invalid product or pack identifier.');
      return val;
    };
    const product_id = identifier('product_id', true)!;
    const variant_id = identifier('variant_id');
    const kit_id = identifier('kit_id');
    if (kit_id && (kit_id !== product_id || variant_id)) throw new RequestError('Invalid kit selection.');
    if (!kit_id && !variant_id) throw new RequestError('Select a pack size before checking out.');
    if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new RequestError('Quantity must be between 1 and 99.');
    const key = `${product_id}:${kit_id || variant_id}`;
    if (seen.has(key)) throw new RequestError('Combine duplicate packs in your basket before checking out.');
    seen.add(key);
    return { product_id, variant_id, kit_id, quantity: item.quantity };
  });
}

export function quoteFingerprint(items: CheckoutLine[]): string {
  return JSON.stringify(items.map(i => ({ p: i.product_id, v: i.variant_id || '', k: i.kit_id || '', q: i.quantity })).sort((a, b) => `${a.p}:${a.v}:${a.k}`.localeCompare(`${b.p}:${b.v}:${b.k}`)));
}
