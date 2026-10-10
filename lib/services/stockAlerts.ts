import { RequestError } from '../request-guards';
import crypto from 'node:crypto';
import { createPublicClient } from '../supabase/public';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { StockAlertSubscription, StockAlertDelivery } from '../types';
import { dispatchStockAlertNotification } from './notifications';
import { getKitById } from './kits';

export interface SubscribeInput {
  productId?: string;
  variantId?: string;
  kitId?: string;
  sellableTitle: string;
  email: string;
  userId?: string;
}

export interface SubscribeResult {
  success: boolean;
  message: string;
  alreadyInStock?: boolean;
  subscription?: StockAlertSubscription;
}

/**
 * Normalizes email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check authoritative stock availability on server
 */
export async function isSellableAvailable(input: { variantId?: string; kitId?: string }): Promise<boolean> {
  const supabase = createPublicClient();
  if (input.kitId) {
    const kit = await getKitById(input.kitId);
    return (kit?.computed_stock ?? 0) > 0;
  }
  if (input.variantId) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select('inventory_quantity')
      .eq('id', input.variantId)
      .single();
    return (variant?.inventory_quantity ?? 0) > 0;
  }
  return true;
}

/**
 * Subscribe customer to back-in-stock alert
 */
export async function subscribeToStockAlert(input: SubscribeInput): Promise<SubscribeResult> {
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('Restock requests are temporarily unavailable.',503);
  const normalizedEmail = normalizeEmail(input.email);
  const catalog = createPublicClient();
  if (input.kitId) {
    const kit = await getKitById(input.kitId);
    if (!kit || kit.status !== 'ACTIVE') throw new RequestError('This kit is not available.');
    input.sellableTitle = kit.name;
  } else {
    const { data: variant, error } = await catalog.from('product_variants').select('id,product_id,option_value,status,products(name,status)').eq('id',input.variantId || '').eq('product_id',input.productId || '').eq('status','ACTIVE').single();
    const product = variant?.products as unknown as { name: string; status: string } | undefined;
    if (error || !variant || !product || product.status !== 'ACTIVE') throw new RequestError('Choose an available product pack.');
    input.sellableTitle = product.name + ' (' + variant.option_value + ')';
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  // 1. Authoritative availability check: If already in stock, do not subscribe
  const inStock = await isSellableAvailable({ variantId: input.variantId, kitId: input.kitId });
  if (inStock) {
    return {
      success: false,
      alreadyInStock: true,
      message: 'Good news! This botanical harvest is currently in stock. You can add it to your basket now.',
    };
  }

  const supabase = createAdminClient();

  // 2. Prevent duplicate ACTIVE subscriptions for same sellable + normalized email
  let existingQuery = supabase
    .from('stock_alert_subscriptions')
    .select('*')
    .eq('normalized_email', normalizedEmail)
    .eq('status', 'ACTIVE');

  if (input.variantId) {
    existingQuery = existingQuery.eq('product_variant_id', input.variantId);
  } else if (input.kitId) {
    existingQuery = existingQuery.eq('kit_id', input.kitId);
  } else if (input.productId) {
    existingQuery = existingQuery.eq('product_id', input.productId);
  }

  const { data: existingRows, error: lookupError } = await existingQuery.limit(1);
  if (lookupError) throw new Error('Restock persistence is unavailable.');
  if (existingRows && existingRows.length > 0) {
    return {
      success: true,
      message: "Your restock request has been saved.",
      subscription: existingRows[0] as StockAlertSubscription,
    };
  }

  // 3. Create new subscription
  const subId = `sub-${crypto.randomUUID()}`;
  const token = "unsub_" + crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const newSub = {
    id: subId,
    product_id: input.productId || null,
    product_variant_id: input.variantId || null,
    kit_id: input.kitId || null,
    sellable_title: input.sellableTitle,
    user_id: input.userId || null,
    email: input.email.trim(),
    normalized_email: normalizedEmail,
    status: 'ACTIVE',
    unsubscribe_token: token,
    unsubscribe_token_hash: tokenHash,
    created_at: new Date().toISOString(),
  };

  const { data: insertedSub, error: insertErr } = await supabase
    .from('stock_alert_subscriptions')
    .insert([newSub])
    .select()
    .single();

  if (insertErr) {
    throw new Error(`Failed to create stock alert: ${insertErr.message}`);
  }

  // 4. Record unavailable delivery attempts truthfully until a provider is configured
  const deliveries = [
    {
      id: `deliv-conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subscription_id: subId,
      channel: 'EMAIL',
      notification_type: 'CONFIRMATION',
      status: 'FAILED',
      attempt_count: 0,
      error_message: "Notification delivery provider is not configured.",
      sent_at: null,
    },
    {
      id: `deliv-adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subscription_id: subId,
      channel: 'EMAIL',
      notification_type: 'ADMIN_ALERT',
      status: 'FAILED',
      attempt_count: 0,
      error_message: "Notification delivery provider is not configured.",
      sent_at: null,
    },
  ];

  await supabase.from('stock_alert_deliveries').insert(deliveries);

  // 5. Prepare notification content; the adapter truthfully reports no delivery.
  await dispatchStockAlertNotification({
    type: 'STOCK_ALERT_CONFIRMATION',
    email: input.email.trim(),
    sellableTitle: input.sellableTitle,
    unsubscribeToken: token,
  });

  await dispatchStockAlertNotification({
    type: 'STOCK_ALERT_ADMIN_ALERT',
    email: input.email.trim(),
    sellableTitle: input.sellableTitle,
  });

  return {
    success: true,
    message: "Your restock request has been saved.",
    subscription: (insertedSub || newSub) as StockAlertSubscription,
  };
}

/**
 * Handle unsubscribe by token
 */
export async function unsubscribeFromStockAlert(token: string): Promise<boolean> {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{16,200}$/.test(token)) throw new RequestError('Invalid unsubscribe link.');
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('Restock preferences are temporarily unavailable. Please contact our team.',503);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('stock_alert_subscriptions')
    .update({ status: 'UNSUBSCRIBED' })
    .eq('unsubscribe_token_hash', crypto.createHash('sha256').update(token).digest('hex'))
    .eq('status', 'ACTIVE')
    .select('id');

  if (error) {
    throw new Error('Restock preferences could not be updated.');
  }

  return Boolean(data && data.length > 0);
}

/**
 * Automated transition: when stock changes from <= 0 to > 0
 */
export async function handleAvailabilityTransition(input: {
  variantId?: string;
  kitId?: string;
  oldQuantity: number;
  newQuantity: number;
}): Promise<{ notifiedCount: number }> {
  // Only trigger if transitioning from OOS to In-Stock
  if (!(input.oldQuantity <= 0 && input.newQuantity > 0)) {
    return { notifiedCount: 0 };
  }

  const supabase = createAdminClient();
  let query = supabase.from('stock_alert_subscriptions').select('*').eq('status', 'ACTIVE');

  if (input.variantId) {
    query = query.eq('product_variant_id', input.variantId);
  } else if (input.kitId) {
    query = query.eq('kit_id', input.kitId);
  } else {
    return { notifiedCount: 0 };
  }

  const { data: activeSubs, error } = await query;
  if (error || !activeSubs) {
    return { notifiedCount: 0 };
  }

  let notifiedCount = 0;

  for (const sub of activeSubs) {
    try {
      // 1. Send Back-In-Stock email
      const delivered = await dispatchStockAlertNotification({
        type: 'STOCK_ALERT_BACK_IN_STOCK',
        email: sub.email || '',
        sellableTitle: sub.sellable_title || '',
        unsubscribeToken: sub.unsubscribe_token || undefined,
      });

      if (!delivered) continue;

      // 2. Mark subscription NOTIFIED
      await supabase
        .from('stock_alert_subscriptions')
        .update({ status: 'NOTIFIED', notified_at: new Date().toISOString() })
        .eq('id', sub.id);

      // 3. Record delivery log
      const deliveryId = `deliv-restock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await supabase.from('stock_alert_deliveries').insert([
        {
          id: deliveryId,
          subscription_id: sub.id,
          channel: 'EMAIL',
          notification_type: 'RESTOCK',
          status: 'SENT',
          attempt_count: 1,
          sent_at: new Date().toISOString(),
        },
      ]);

      notifiedCount++;
    } catch (err: any) {
      await supabase
        .from('stock_alert_subscriptions')
        .update({ last_error: err?.message || 'Send failed' })
        .eq('id', sub.id);
    }
  }

  console.log(`[Restock Transition] Processed ${notifiedCount} back-in-stock alerts for variant ${input.variantId || input.kitId}`);
  return { notifiedCount };
}

/**
 * Admin: Get all subscriptions with filters
 */
export async function getAllStockSubscriptions(options?: {
  status?: string;
  search?: string;
}): Promise<StockAlertSubscription[]> {
  const supabase = await getScopedClient();
  let query = supabase.from('stock_alert_subscriptions').select('*');

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    const search = options.search.replace(/[,()%"']/g,' ').trim().slice(0,80);
    if (search) query = query.or(`email.ilike.%${search}%,sellable_title.ilike.%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error('Restock subscriptions are temporarily unavailable.');
  }

  return (data || []) as StockAlertSubscription[];
}

/**
 * Admin: Manually trigger / simulate restock broadcast
 */
export async function triggerManualRestockAlert(subscriptionId: string): Promise<boolean> {
  const supabase = await getScopedClient();
  const { data: sub, error } = await supabase
    .from('stock_alert_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (error || !sub) return false;

  const delivered = await dispatchStockAlertNotification({
    type: 'STOCK_ALERT_BACK_IN_STOCK',
    email: sub.email || '',
    sellableTitle: sub.sellable_title || '',
    unsubscribeToken: sub.unsubscribe_token || undefined,
  });

  if (!delivered) return false;

  await supabase
    .from('stock_alert_subscriptions')
    .update({ status: 'NOTIFIED', notified_at: new Date().toISOString() })
    .eq('id', sub.id);

  const deliveryId = `deliv-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await supabase.from('stock_alert_deliveries').insert([
    {
      id: deliveryId,
      subscription_id: sub.id,
      channel: 'EMAIL',
      notification_type: 'RESTOCK',
      status: 'SENT',
      attempt_count: 1,
      sent_at: null,
    },
  ]);

  return true;
}

/**
 * Admin: Delete or cancel subscription
 */
export async function deleteStockSubscription(id: string): Promise<boolean> {
  const supabase = await getScopedClient();
  const { data, error } = await supabase
    .from('stock_alert_subscriptions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    throw new Error('Restock subscription could not be deleted.');
  }

  return Boolean(data && data.length > 0);
}
