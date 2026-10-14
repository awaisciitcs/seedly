import { RequestError } from './request-guards';
import { adminNumber, adminText } from './admin-validation';

export interface Coupon {
  id: string; code: string; description: string; discount_type: 'percentage' | 'fixed'; discount_value: number;
  minimum_subtotal_minor: number; maximum_discount_minor: number | null; starts_at: string | null; expires_at: string | null;
  usage_limit: number | null; per_customer_limit: number | null; is_active: boolean; created_at: string; updated_at: string;
}
export type AdminCoupon = Coupon & { used_count: number };
export function couponCode(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.length > 64) throw new RequestError('Enter a valid discount code.');
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) throw new RequestError('Discount codes must be 3–32 letters, numbers, hyphens or underscores.');
  return code;
}
export function couponDiscount(coupon: Coupon, subtotal: number, uses = 0, customerUses = 0, now = Date.now()): number {
  if (!coupon.is_active || coupon.starts_at && Date.parse(coupon.starts_at) > now || coupon.expires_at && Date.parse(coupon.expires_at) <= now) throw new RequestError('This discount code is unavailable or expired.', 409);
  if (coupon.usage_limit !== null && uses >= coupon.usage_limit) throw new RequestError('This discount code has reached its usage limit.', 409);
  if (coupon.per_customer_limit !== null && customerUses >= coupon.per_customer_limit) throw new RequestError('This discount code has already been used for this email address.', 409);
  if (subtotal < coupon.minimum_subtotal_minor) throw new RequestError('Your basket does not meet this code’s minimum spend.', 409);
  const discount = Math.min(subtotal, coupon.maximum_discount_minor ?? subtotal, coupon.discount_type === 'percentage' ? Math.floor(subtotal * coupon.discount_value / 100) : coupon.discount_value);
  if (!Number.isSafeInteger(discount) || discount <= 0) throw new RequestError('This discount code cannot be applied to this basket.', 409);
  return discount;
}
export function couponInput(body: Record<string, unknown>): Omit<Coupon, 'id' | 'created_at' | 'updated_at'> {
  const code = couponCode(body.code); if (!code) throw new RequestError('A discount code is required.');
  const type = body.discount_type; if (type !== 'percentage' && type !== 'fixed') throw new RequestError('Choose percentage or fixed amount.');
  const optional = (key: string, max = 2_000_000_000) => body[key] === '' || body[key] == null ? null : adminNumber(body[key], key.replaceAll('_', ' '), 1, max);
  const date = (key: string) => {
    if (body[key] === '' || body[key] == null) return null;
    if (typeof body[key] !== 'string' || !Number.isFinite(Date.parse(body[key] as string))) throw new RequestError('Enter a valid ' + key.replaceAll('_', ' ') + ' date.');
    return new Date(body[key] as string).toISOString();
  };
  const starts_at = date('starts_at'), expires_at = date('expires_at');
  if (starts_at && expires_at && starts_at >= expires_at) throw new RequestError('Expiry must be later than the start date.');
  if (typeof body.is_active !== 'boolean') throw new RequestError('Choose whether this code is active.');
  return { code, description: adminText(body.description ?? '', 'Description', 300), discount_type: type,
    discount_value: adminNumber(body.discount_value, 'Discount value', 1, type === 'percentage' ? 100 : 2_000_000_000),
    minimum_subtotal_minor: adminNumber(body.minimum_subtotal_minor ?? 0, 'Minimum spend'), maximum_discount_minor: optional('maximum_discount_minor'),
    starts_at, expires_at, usage_limit: optional('usage_limit', 1_000_000), per_customer_limit: optional('per_customer_limit', 1_000_000), is_active: body.is_active };
}
