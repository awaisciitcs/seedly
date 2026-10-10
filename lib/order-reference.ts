import 'server-only';
import { createAdminClient } from './supabase/admin';
import { RequestError } from './request-guards';

export function sequentialOrderReferencesEnabled(): boolean {
  const mode = process.env.ORDER_REFERENCE_MODE || 'legacy';
  if (!['legacy', 'sequential'].includes(mode)) throw new Error('Invalid order reference configuration.');
  return mode === 'sequential';
}

async function referenceRpc(name: 'find_checkout_order_reference' | 'allocate_checkout_order_reference', checkoutReference: string, fingerprint: string): Promise<string | null> {
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('Ordering is temporarily unavailable. Please contact Seedly before retrying.', 503);
  const { data, error } = await createAdminClient().rpc(name, { p_checkout_reference: checkoutReference, p_request_fingerprint: fingerprint });
  if (error?.code === 'P0001') throw new RequestError('This checkout attempt has changed. Restore the previous details to recover your order.', 409);
  if (error) throw new RequestError('We could not confirm your order reference. Please retry with the same details.', 503);
  if (data === null && name === 'find_checkout_order_reference') return null;
  if (typeof data !== 'string' || !/^SED-[0-9]{6,12}$/.test(data)) throw new RequestError('We could not confirm your order reference. Please retry with the same details.', 503);
  return data;
}
export function findCheckoutOrderReference(checkoutReference: string, fingerprint: string) {
  return referenceRpc('find_checkout_order_reference', checkoutReference, fingerprint);
}
export async function allocateCheckoutOrderReference(checkoutReference: string, fingerprint: string): Promise<string> {
  return (await referenceRpc('allocate_checkout_order_reference', checkoutReference, fingerprint))!;
}
