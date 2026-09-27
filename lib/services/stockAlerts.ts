import { getDatabase, toPlain } from '../db';
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
export function isSellableAvailable(input: { variantId?: string; kitId?: string }): boolean {
  const db = getDatabase();
  if (input.kitId) {
    const kit = getKitById(input.kitId);
    return (kit?.computed_stock ?? 0) > 0;
  }
  if (input.variantId) {
    const variant = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get(input.variantId) as any;
    return (variant?.inventory_quantity ?? 0) > 0;
  }
  return true;
}

/**
 * Subscribe customer to back-in-stock alert
 */
export function subscribeToStockAlert(input: SubscribeInput): SubscribeResult {
  const normalizedEmail = normalizeEmail(input.email);
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  // 1. Authoritative availability check: If already in stock, do not subscribe
  if (isSellableAvailable({ variantId: input.variantId, kitId: input.kitId })) {
    return {
      success: false,
      alreadyInStock: true,
      message: 'Good news! This botanical harvest is currently in stock. You can add it to your basket now.',
    };
  }

  const db = getDatabase();

  // 2. Prevent duplicate ACTIVE subscriptions for same sellable + normalized email
  let existingQuery = `
    SELECT * FROM stock_alert_subscriptions
    WHERE normalized_email = ? AND status = 'ACTIVE'
  `;
  const existingParams: any[] = [normalizedEmail];

  if (input.variantId) {
    existingQuery += ` AND product_variant_id = ?`;
    existingParams.push(input.variantId);
  } else if (input.kitId) {
    existingQuery += ` AND kit_id = ?`;
    existingParams.push(input.kitId);
  } else if (input.productId) {
    existingQuery += ` AND product_id = ?`;
    existingParams.push(input.productId);
  }

  const existing = db.prepare(existingQuery).get(...existingParams) as any;
  if (existing) {
    return {
      success: true,
      message: `You are already on the alert list for "${input.sellableTitle}". We will email ${normalizedEmail} the moment it returns to stock!`,
      subscription: toPlain(existing),
    };
  }

  // 3. Create new subscription
  const subId = `sub-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const token = `unsub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  db.prepare(`
    INSERT INTO stock_alert_subscriptions (
      id, product_id, product_variant_id, kit_id, sellable_title, user_id,
      email, normalized_email, status, unsubscribe_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    subId,
    input.productId || null,
    input.variantId || null,
    input.kitId || null,
    input.sellableTitle,
    input.userId || null,
    input.email.trim(),
    normalizedEmail,
    token
  );

  // 4. Record deliveries for confirmation and admin alert
  const deliveryConfId = `deliv-conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  db.prepare(`
    INSERT INTO stock_alert_deliveries (
      id, subscription_id, channel, notification_type, status, attempt_count
    ) VALUES (?, ?, 'EMAIL', 'CONFIRMATION', 'SENT', 1)
  `).run(deliveryConfId, subId);

  const deliveryAdminId = `deliv-adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  db.prepare(`
    INSERT INTO stock_alert_deliveries (
      id, subscription_id, channel, notification_type, status, attempt_count
    ) VALUES (?, ?, 'EMAIL', 'ADMIN_ALERT', 'SENT', 1)
  `).run(deliveryAdminId, subId);

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

  const row = db.prepare('SELECT * FROM stock_alert_subscriptions WHERE id = ?').get(subId) as any;

  return {
    success: true,
    message: `You're on the list! We will send an email to ${normalizedEmail} as soon as "${input.sellableTitle}" is back in stock.`,
    subscription: toPlain(row),
  };
}

/**
 * Handle unsubscribe by token
 */
export function unsubscribeFromStockAlert(token: string): boolean {
  if (!token) return false;
  const db = getDatabase();
  const res = db.prepare(`
    UPDATE stock_alert_subscriptions
    SET status = 'UNSUBSCRIBED'
    WHERE unsubscribe_token = ? AND status = 'ACTIVE'
  `).run(token);
  return res.changes > 0;
}

/**
 * Automated transition: when stock changes from <= 0 to > 0
 */
export function handleAvailabilityTransition(input: {
  variantId?: string;
  kitId?: string;
  oldQuantity: number;
  newQuantity: number;
}): { notifiedCount: number } {
  // Only trigger if transitioning from OOS to In-Stock
  if (!(input.oldQuantity <= 0 && input.newQuantity > 0)) {
    return { notifiedCount: 0 };
  }

  const db = getDatabase();
  let query = `SELECT * FROM stock_alert_subscriptions WHERE status = 'ACTIVE'`;
  const params: any[] = [];

  if (input.variantId) {
    query += ` AND product_variant_id = ?`;
    params.push(input.variantId);
  } else if (input.kitId) {
    query += ` AND kit_id = ?`;
    params.push(input.kitId);
  } else {
    return { notifiedCount: 0 };
  }

  const activeSubs = db.prepare(query).all(...params) as any[];
  let notifiedCount = 0;

  for (const sub of activeSubs) {
    try {
      // 1. Send Back-In-Stock email
      dispatchStockAlertNotification({
        type: 'STOCK_ALERT_BACK_IN_STOCK',
        email: sub.email,
        sellableTitle: sub.sellable_title,
        unsubscribeToken: sub.unsubscribe_token,
      });

      // 2. Mark subscription NOTIFIED
      db.prepare(`
        UPDATE stock_alert_subscriptions
        SET status = 'NOTIFIED', notified_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(sub.id);

      // 3. Record delivery log
      const deliveryId = `deliv-restock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT INTO stock_alert_deliveries (
          id, subscription_id, channel, notification_type, status, attempt_count
        ) VALUES (?, ?, 'EMAIL', 'RESTOCK', 'SENT', 1)
      `).run(deliveryId, sub.id);

      notifiedCount++;
    } catch (err: any) {
      db.prepare(`
        UPDATE stock_alert_subscriptions
        SET last_error = ?
        WHERE id = ?
      `).run(err?.message || 'Send failed', sub.id);
    }
  }

  console.log(`[Restock Transition] Processed ${notifiedCount} back-in-stock alerts for variant ${input.variantId || input.kitId}`);
  return { notifiedCount };
}

/**
 * Admin: Get all subscriptions with filters
 */
export function getAllStockSubscriptions(options?: { status?: string; search?: string }): StockAlertSubscription[] {
  const db = getDatabase();
  let query = `SELECT * FROM stock_alert_subscriptions WHERE 1=1`;
  const params: any[] = [];

  if (options?.status && options.status !== 'ALL') {
    query += ` AND status = ?`;
    params.push(options.status);
  }

  if (options?.search) {
    query += ` AND (email LIKE ? OR sellable_title LIKE ?)`;
    const s = `%${options.search}%`;
    params.push(s, s);
  }

  query += ` ORDER BY created_at DESC`;
  const rows = db.prepare(query).all(...params) as any[];
  return toPlain(rows);
}

/**
 * Admin: Manually trigger / simulate restock broadcast
 */
export function triggerManualRestockAlert(subscriptionId: string): boolean {
  const db = getDatabase();
  const sub = db.prepare('SELECT * FROM stock_alert_subscriptions WHERE id = ?').get(subscriptionId) as any;
  if (!sub) return false;

  dispatchStockAlertNotification({
    type: 'STOCK_ALERT_BACK_IN_STOCK',
    email: sub.email,
    sellableTitle: sub.sellable_title,
    unsubscribeToken: sub.unsubscribe_token,
  });

  db.prepare(`
    UPDATE stock_alert_subscriptions
    SET status = 'NOTIFIED', notified_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(sub.id);

  const deliveryId = `deliv-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  db.prepare(`
    INSERT INTO stock_alert_deliveries (
      id, subscription_id, channel, notification_type, status, attempt_count
    ) VALUES (?, ?, 'EMAIL', 'RESTOCK', 'SENT', 1)
  `).run(deliveryId, sub.id);

  return true;
}

/**
 * Admin: Delete or cancel subscription
 */
export function deleteStockSubscription(id: string): boolean {
  const db = getDatabase();
  const res = db.prepare('DELETE FROM stock_alert_subscriptions WHERE id = ?').run(id);
  return res.changes > 0;
}
