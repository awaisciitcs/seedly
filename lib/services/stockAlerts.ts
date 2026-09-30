import crypto from 'node:crypto';
import { createPublicClient } from '../supabase/public';
import { createAdminClient } from '../supabase/admin';
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
  const normalizedEmail = normalizeEmail(input.email);
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

  const { data: existingRows } = await existingQuery.limit(1);
  if (existingRows && existingRows.length > 0) {
    return {
      success: true,
      message: `You are already on the alert list for "${input.sellableTitle}". We will email ${normalizedEmail} the moment it returns to stock!`,
      subscription: existingRows[0] as StockAlertSubscription,
    };
  }

  // 3. Create new subscription
  const subId = `sub-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const token = `unsub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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

  // 4. Record deliveries for confirmation and admin alert
  const deliveries = [
    {
      id: `deliv-conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subscription_id: subId,
      channel: 'EMAIL',
      notification_type: 'CONFIRMATION',
      status: 'SENT',
      attempt_count: 1,
      sent_at: new Date().toISOString(),
    },
    {
      id: `deliv-adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subscription_id: subId,
      channel: 'EMAIL',
      notification_type: 'ADMIN_ALERT',
      status: 'SENT',
      attempt_count: 1,
      sent_at: new Date().toISOString(),
    },
  ];

  await supabase.from('stock_alert_deliveries').insert(deliveries);

  // 5. Dispatch notification emails (customer confirmation + admin alert)
  dispatchStockAlertNotification({
    type: 'STOCK_ALERT_CONFIRMATION',
    email: input.email.trim(),
    sellableTitle: input.sellableTitle,
    unsubscribeToken: token,
  });

  dispatchStockAlertNotification({
    type: 'STOCK_ALERT_ADMIN_ALERT',
    email: input.email.trim(),
    sellableTitle: input.sellableTitle,
  });

  return {
    success: true,
    message: `You're on the list! We will send an email to ${normalizedEmail} as soon as "${input.sellableTitle}" is back in stock.`,
    subscription: (insertedSub || newSub) as StockAlertSubscription,
  };
}

/**
 * Handle unsubscribe by token
 */
export async function unsubscribeFromStockAlert(token: string): Promise<boolean> {
  if (!token) return false;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('stock_alert_subscriptions')
    .update({ status: 'UNSUBSCRIBED' })
    .eq('unsubscribe_token', token)
    .eq('status', 'ACTIVE')
    .select('id');

  if (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
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
      dispatchStockAlertNotification({
        type: 'STOCK_ALERT_BACK_IN_STOCK',
        email: sub.email || '',
        sellableTitle: sub.sellable_title || '',
        unsubscribeToken: sub.unsubscribe_token || undefined,
      });

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
  const supabase = createAdminClient();
  let query = supabase.from('stock_alert_subscriptions').select('*');

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    query = query.or(`email.ilike.%${options.search}%,sellable_title.ilike.%${options.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch stock subscriptions:', error);
    return [];
  }

  return (data || []) as StockAlertSubscription[];
}

/**
 * Admin: Manually trigger / simulate restock broadcast
 */
export async function triggerManualRestockAlert(subscriptionId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: sub, error } = await supabase
    .from('stock_alert_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (error || !sub) return false;

  dispatchStockAlertNotification({
    type: 'STOCK_ALERT_BACK_IN_STOCK',
    email: sub.email || '',
    sellableTitle: sub.sellable_title || '',
    unsubscribeToken: sub.unsubscribe_token || undefined,
  });

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
      sent_at: new Date().toISOString(),
    },
  ]);

  return true;
}

/**
 * Admin: Delete or cancel subscription
 */
export async function deleteStockSubscription(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('stock_alert_subscriptions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Failed to delete subscription:', error);
    return false;
  }

  return Boolean(data && data.length > 0);
}
