import { parseCheckoutLines } from './checkout-validation';

export const PENDING_CHECKOUT_KEY = 'seedly_pending_checkout';
export interface CheckoutAttempt {
  signature: string;
  key: string;
  receipt?: { path: string; proof: string };
  submitted?: Record<string, unknown>;
}

type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Keep an uncertain submission in this tab so refreshing cannot create a new order. */
export function savePendingCheckout(storage: SessionStore, attempt: CheckoutAttempt): boolean {
  if (!attempt.submitted) return false;
  try { storage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(attempt)); return true; } catch { return false; }
}

export function readPendingCheckout(storage: SessionStore): CheckoutAttempt | null {
  try {
    const raw = storage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw || raw.length > 50000) return null;
    const value = JSON.parse(raw) as CheckoutAttempt;
    const body = value?.submitted;
    if (!body || typeof body !== 'object' || Array.isArray(body) || typeof value.key !== 'string' || !/^[a-zA-Z0-9_-]{16,200}$/.test(value.key) || typeof value.signature !== 'string' || body.idempotency_key !== value.key) return null;
    for (const field of ['customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'shipping_city', 'shipping_province', 'quote_token']) {
      if (typeof body[field] !== 'string' || !(body[field] as string).length || (body[field] as string).length > 10000) return null;
    }
    if (!['COD', 'bank_transfer', 'wallet_aggregator'].includes(String(body.payment_method))) return null;
    parseCheckoutLines(body.items);
    return value;
  } catch { return null; }
}

export function clearPendingCheckout(storage: SessionStore): void {
  try { storage.removeItem(PENDING_CHECKOUT_KEY); } catch { /* In-memory recovery remains available. */ }
}
