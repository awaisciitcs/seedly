import { readJson, requireSameOrigin, RequestError } from './request-guards';

export { RequestError as AdminInputError };

export async function readAdminJson(request: Request): Promise<Record<string, any>> {
  requireSameOrigin(request);
  return readJson(request, 128 * 1024);
}

export function adminId(value: unknown, label = 'ID'): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) {
    throw new RequestError(`A valid ${label} is required.`);
  }
  return value;
}

export function adminText(value: unknown, label: string, max = 500, required = false): string {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new RequestError(`${label} must be text of at most ${max} characters.`);
  }
  if (required && !value.trim()) throw new RequestError(`${label} is required.`);
  return value.trim();
}

export function adminNumber(value: unknown, label: string, min = 0, max = 2_000_000_000, integer = true): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || typeof value === 'string' && !value.trim()) {
    throw new RequestError(`${label} must be a valid number.`);
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max || integer && !Number.isSafeInteger(result)) {
    throw new RequestError(`${label} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
  }
  return result;
}

export function adminEnum(value: unknown, allowed: readonly string[], label: string): string {
  if (typeof value !== 'string' || !allowed.includes(value)) throw new RequestError(`Invalid ${label}.`);
  return value;
}

export function adminImageUrl(value: unknown): string {
  const result = adminText(value, 'Image URL', 2048);
  if (!result) return result;
  if (/^\/(?!\/)[^\\\s#\u0000-\u001f]*$/.test(result)) return result;
  try {
    const url = new URL(result);
    let storageHost = '';
    try { if (process.env.NEXT_PUBLIC_SUPABASE_URL) storageHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { /* Missing configuration cannot authorize a remote URL. */ }
    if (url.protocol === 'https:' && !url.username && !url.password && !url.hash && !url.port && (url.hostname === 'images.unsplash.com' || url.hostname === storageHost && url.pathname.startsWith('/storage/v1/object/public/product-images/'))) return result;
  } catch { /* Rejected below. */ }
  throw new RequestError('Use a local image path, an Unsplash image, or this store’s Supabase Storage image URL.');
}

export function validateCatalogBody(body: Record<string, any>, kind: 'product' | 'kit', create: boolean): Record<string, any> {
  const result = { ...body };
  const fields = ['name', 'slug', 'short_description', 'description', 'ingredients', 'usage_instructions', 'storage_instructions', 'flavor_profile', 'caffeine_level', 'steep_time', 'water_temp', 'badge', 'package_size'];
  for (const key of fields) {
    if (result[key] !== undefined && result[key] !== null) result[key] = adminText(result[key], key.replaceAll('_', ' '), key === 'description' ? 12000 : key.endsWith('instructions') ? 4000 : key === 'short_description' ? 2000 : 500, key === 'name');
  }
  if (create) result.name = adminText(result.name, 'Name', 500, true);
  if (result.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug)) throw new RequestError('Slug must contain lowercase words separated by hyphens.');
  for (const key of ['id', 'variant_id', 'category_id']) if (result[key] !== undefined) result[key] = adminId(result[key], key);
  if (!create && !result.id && !result.variant_id) throw new RequestError('A product or kit ID is required.');
  for (const key of ['price_minor', 'compare_price_minor', 'inventory_quantity', 'initial_stock', 'weight_grams']) {
    if (result[key] !== undefined && result[key] !== null) result[key] = adminNumber(result[key], key, key === 'price_minor' || key === 'weight_grams' ? 1 : 0);
  }
  for (const key of ['price_pkr', 'compare_price_pkr']) {
    if (result[key] !== undefined && result[key] !== null && result[key] !== '') {
      result[key] = adminNumber(result[key], key, key === 'price_pkr' ? 0.01 : 0, 20_000_000, false);
      if (Math.abs(result[key] * 100 - Math.round(result[key] * 100)) > 0.000001) throw new RequestError('Prices may have at most two decimal places.');
    }
  }
  if (result.image_url !== undefined) result.image_url = adminImageUrl(result.image_url);
  if (result.status !== undefined) adminEnum(result.status, ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT'], 'status');
  if (result.product_type !== undefined) adminEnum(result.product_type, ['seed', 'tea'], 'product type');
  if (result.compliance_status !== undefined) adminEnum(result.compliance_status, ['APPROVED', 'PENDING', 'REJECTED'], 'compliance status');
  if (result.variants !== undefined) {
    if (!Array.isArray(result.variants) || result.variants.length < 1 || result.variants.length > 40) throw new RequestError('Provide between 1 and 40 product variants.');
    const weights = new Set<number>(); const ids = new Set<string>();
    result.variants = result.variants.map((variant: any) => {
      if (!variant || typeof variant !== 'object' || Array.isArray(variant)) throw new RequestError('Invalid product variant.');
      const weight = adminNumber(variant.weight_grams, 'Variant weight', 1, 100000);
      if (weights.has(weight)) throw new RequestError('Each pack size must be unique.'); weights.add(weight);
      if (variant.id) { adminId(variant.id, 'variant ID'); if (ids.has(variant.id)) throw new RequestError('Duplicate variant ID.'); ids.add(variant.id); }
      const price = adminNumber(variant.price_pkr, 'Variant price', 0.01, 20_000_000, false);
      if (Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) throw new RequestError('Prices may have at most two decimal places.');
      const compare = variant.compare_price_pkr === '' || variant.compare_price_pkr == null ? null : adminNumber(variant.compare_price_pkr, 'Compare price', price, 20_000_000, false);
      return { ...variant, weight_grams: weight, price_pkr: price, compare_price_pkr: compare,
        inventory_quantity: adminNumber(variant.inventory_quantity ?? 0, 'Stock', 0, 1_000_000),
        status: adminEnum(variant.status || 'ACTIVE', ['ACTIVE', 'INACTIVE', 'ARCHIVED'], 'variant status') };
    });
  }
  if (kind === 'kit' && (create || result.items !== undefined)) {
    if (!Array.isArray(result.items) || result.items.length < 1 || result.items.length > 40) throw new RequestError('A kit must contain between 1 and 40 items.');
    const componentIds = new Set<string>();
    result.items = result.items.map((item: any) => {
      if (!item || typeof item !== 'object') throw new RequestError('Invalid kit item.');
      const productId = adminId(item.product_id, 'component product ID');
      const variantId = item.variant_id || item.product_variant_id;
      if (variantId) adminId(variantId, 'component variant ID');
      const identity = variantId || productId;
      if (componentIds.has(identity)) throw new RequestError('Duplicate kit components must be combined into one quantity.'); componentIds.add(identity);
      return { ...item, product_id: productId, variant_id: variantId || null, quantity: adminNumber(item.quantity, 'Component quantity', 1, 100) };
    });
  }
  if (create && !(result.price_pkr > 0) && !result.variants?.length) throw new RequestError('A positive price is required.');
  return result;
}
