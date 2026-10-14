import 'server-only';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { couponCode, couponDiscount, couponInput, type AdminCoupon } from '../coupons';
import { RequestError } from '../request-guards';
import { adminId } from '../admin-validation';

export async function quoteCoupon(codeInput: unknown, subtotal: number, customerEmail?: string) {
  const code = couponCode(codeInput);
  if (!code) return { discount_minor: 0, coupon_code: '' };
  const client = createAdminClient();
  const { data: coupon, error } = await client.from('coupons').select('*').eq('code', code).maybeSingle();
  if (error) throw new RequestError('Discount codes are temporarily unavailable. Retry or remove the code.', 503);
  if (!coupon) throw new RequestError('This discount code is not valid.', 409);
  const email = customerEmail?.trim().toLowerCase();
  const [{ count: uses, error: usageError }, customer] = await Promise.all([
    client.from('coupon_redemptions').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id),
    email && coupon.per_customer_limit !== null ? client.from('coupon_redemptions').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('customer_email', email) : Promise.resolve({ count: 0, error: null }),
  ]);
  if (usageError || customer.error || uses === null || customer.count === null) throw new RequestError('Discount validation is temporarily unavailable.', 503);
  return { discount_minor: couponDiscount(coupon, subtotal, uses, customer.count), coupon_code: coupon.code, coupon_id: coupon.id, coupon_version: coupon.updated_at };
}
export async function listAdminCoupons(): Promise<AdminCoupon[]> {
  const client = await getScopedClient();
  const { data, error } = await client.from('admin_coupons').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error || !data) throw new RequestError('Coupons could not load. Please retry.', 503);
  return data as AdminCoupon[];
}
export async function saveCoupon(body: Record<string, unknown>, create: boolean) {
  const input = couponInput(body), client = await getScopedClient();
  if (!create && (typeof body.expected_updated_at !== 'string' || !Number.isFinite(Date.parse(body.expected_updated_at)))) throw new RequestError('Reload this coupon before saving.');
  const result = create ? await client.from('coupons').insert(input).select('*').single() : await client.from('coupons').update(input).eq('id', adminId(body.id)).eq('updated_at', body.expected_updated_at as string).select('*').maybeSingle();
  if (result.error) {
    if (result.error.code === '23505') throw new RequestError('This discount code already exists.', 409);
    if (result.error.code === '22023') throw new RequestError('Coupon codes cannot be renamed. Pause this code and create another.', 409);
    if (result.error.code === '42501') throw new RequestError('Owner privileges are required to save coupons.', 403);
    throw new RequestError('Coupon could not be saved. Please retry.', 503);
  }
  if (!result.data) throw new RequestError('This coupon changed while you were editing. Reload before saving.', 409);
  return result.data;
}
