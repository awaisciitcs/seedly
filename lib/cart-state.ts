import type { CartItem, CheckoutLine } from './types';
export function cartIdentity(item: Pick<CartItem, 'product_id' | 'variant_id' | 'kit_id'>) {
  return item.product_id + '-' + (item.kit_id ? 'kit' : item.variant_id || 'default');
}
export function addCartItem(items: CartItem[], input: CartItem) {
  const max = Math.min(99, Math.max(0, Math.floor(input.max_quantity ?? 0)));
  if (!Number.isFinite(max) || !Number.isSafeInteger(input.price_minor) || input.price_minor < 0 || !Number.isInteger(input.quantity) || input.quantity < 1 || max === 0) return { items, added: false, message: 'This pack is unavailable. Please choose another size.' };
  const id = cartIdentity(input);
  const existing = items.find(item => cartIdentity(item) === id);
  const before = existing?.quantity ?? 0;
  const quantity = Math.min(max, before + input.quantity);
  if (quantity <= before) return { items, added: false, message: 'Stock limit reached for ' + input.name + '.' };
  const next = { ...input, id, quantity, max_quantity: max };
  return { items: existing ? items.map(item => cartIdentity(item) === id ? next : item) : [...items, next], added: true,
    message: quantity - before < input.quantity ? 'Added ' + (quantity - before) + ' of ' + input.name + '. Stock limit reached.' : 'Added ' + input.name + ' to your basket.' };
}
export function restoreCart(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  const restored: CartItem[] = [];
  for (const value of input.slice(0, 50)) {
    if (!value || typeof value !== 'object') continue;
    const item = value as CartItem;
    if (![item.product_id, item.name, item.slug, item.image_url].every(v => typeof v === 'string' && v.length > 0 && v.length <= 2000)) continue;
    if (!['seed', 'tea', 'kit'].includes(item.product_type) || !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isSafeInteger(item.price_minor) || item.price_minor < 0) continue;
    const normalized = { ...item, id: cartIdentity(item), quantity: Math.min(item.quantity, 99), max_quantity: Number.isInteger(item.max_quantity) ? Math.max(0, item.max_quantity!) : undefined };
    const existing = restored.find(i => i.id === normalized.id);
    if (existing) existing.quantity = Math.min(99, existing.max_quantity && existing.max_quantity > 0 ? existing.max_quantity : 99, existing.quantity + normalized.quantity);
    else restored.push(normalized);
  }
  return restored;
}

/** Preserve items added while an earlier order response was being recovered. */
export function removeOrderedItems(items: CartItem[], ordered: CheckoutLine[]): CartItem[] {
  const quantities = new Map(ordered.map(line => [cartIdentity(line), line.quantity]));
  return items.flatMap(item => {
    const quantity = item.quantity - (quantities.get(cartIdentity(item)) || 0);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}
