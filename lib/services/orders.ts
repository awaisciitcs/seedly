import crypto from 'node:crypto';
import { createPublicClient } from '../supabase/public';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../types';
import { generateOrderNumber } from '../utils';
import { getSiteSettings } from './settings';
import { dispatchNotification } from './notifications';
import { getKitById } from './kits';
import { assertOrderStatusUpdate, getInitialOrderState } from '../order-status';

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string;
  shipping_notes?: string;
  payment_method: PaymentMethod;
  receipt_path?: string;
  idempotency_key?: string;
  items: {
    product_id: string;
    variant_id?: string;
    kit_id?: string;
    quantity: number;
    name?: string;
    sku?: string;
    image_url?: string;
  }[];
}

export async function validateAndQuote(
  items: { product_id: string; variant_id?: string; kit_id?: string; quantity: number }[]
) {
  const supabase = createPublicClient();
  const settings = await getSiteSettings();

  let subtotal_minor = 0;
  const validatedItems: {
    product_id: string;
    variant_id?: string;
    kit_id?: string;
    name: string;
    sku: string;
    quantity: number;
    unit_price_minor: number;
    line_total_minor: number;
    image_url: string;
  }[] = [];

  for (const item of items) {
    if (item.kit_id) {
      const kit = await getKitById(item.kit_id);
      if (!kit) continue;

      if (kit.computed_stock < item.quantity) {
        throw new Error(
          kit.computed_stock <= 0
            ? `"${kit.name}" is currently out of stock.`
            : `"${kit.name}" only has ${kit.computed_stock} kits available in stock.`
        );
      }

      const unitPrice = kit.price_minor;
      const lineTotal = unitPrice * item.quantity;
      subtotal_minor += lineTotal;

      validatedItems.push({
        product_id: kit.id,
        kit_id: kit.id,
        name: kit.name,
        sku: `KIT-${kit.slug.toUpperCase()}`,
        quantity: item.quantity,
        unit_price_minor: unitPrice,
        line_total_minor: lineTotal,
        image_url: kit.image_url,
      });
    } else {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (!product) continue;

      let unitPrice = Number(product.price_minor);
      let sku = product.sku;
      let variantLabel = '';

      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('*')
          .eq('id', item.variant_id)
          .single();

        if (variant) {
          if ((variant.inventory_quantity ?? 0) < item.quantity) {
            throw new Error(
              (variant.inventory_quantity ?? 0) <= 0
                ? `"${product.name} (${variant.option_value})" is currently out of stock.`
                : `"${product.name} (${variant.option_value})" only has ${variant.inventory_quantity} available in stock.`
            );
          }
          unitPrice = Number(variant.price_minor);
          sku = variant.sku;
          variantLabel = ` (${variant.option_value})`;
        }
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal_minor += lineTotal;

      validatedItems.push({
        product_id: product.id,
        variant_id: item.variant_id,
        name: `${product.name}${variantLabel}`,
        sku: sku || 'SKU-ITEM',
        quantity: item.quantity,
        unit_price_minor: unitPrice,
        line_total_minor: lineTotal,
        image_url: product.image_url || '/images/products/pumpkin-seeds.jpg',
      });
    }
  }

  const shipping_minor =
    subtotal_minor >= settings.free_delivery_threshold_minor ? 0 : settings.delivery_fee_minor;
  const total_minor = subtotal_minor + shipping_minor;

  return {
    subtotal_minor,
    shipping_minor,
    total_minor,
    items: validatedItems,
  };
}

export interface CreateOrderResult {
  order: Order;
  trackingToken: string;
  isIdempotentReplay: boolean;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = createAdminClient();

  if (!input.items || input.items.length === 0) {
    throw new Error('Order items cannot be empty or invalid');
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = generateOrderNumber();

  // Generate unguessable capability token for tracking
  const trackingToken = crypto.randomBytes(24).toString('hex');
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');

  // Compute request fingerprint for idempotency conflict detection
  const fingerprintPayload = JSON.stringify({
    items: input.items.map(i => ({ p: i.product_id, v: i.variant_id, k: i.kit_id, q: i.quantity })),
    email: input.customer_email.trim().toLowerCase(),
    phone: input.customer_phone.trim(),
    totalMethod: input.payment_method,
  });
  const requestFingerprint = crypto.createHash('sha256').update(fingerprintPayload).digest('hex');

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_transactional', {
    p_order_id: orderId,
    p_order_number: orderNumber,
    p_customer_name: input.customer_name,
    p_customer_email: input.customer_email,
    p_customer_phone: input.customer_phone,
    p_shipping_address: input.shipping_address,
    p_shipping_city: input.shipping_city,
    p_shipping_province: input.shipping_province,
    p_shipping_postal_code: input.shipping_postal_code || '',
    p_shipping_notes: input.shipping_notes || '',
    p_payment_method: input.payment_method,
    p_receipt_path: input.receipt_path || '',
    p_idempotency_key: input.idempotency_key || '',
    p_request_fingerprint: requestFingerprint,
    p_tracking_token_hash: trackingTokenHash,
    p_items: input.items.map((it) => ({
      product_id: it.product_id,
      variant_id: it.variant_id || null,
      kit_id: it.kit_id || null,
      quantity: it.quantity,
      name: it.name || null,
      sku: it.sku || null,
      image_url: it.image_url || null,
    })),
  });

  if (rpcError) {
    if (rpcError.code === 'P0001') {
      throw new Error('Checkout conflict: idempotency key reused with different items or customer details.');
    }
    if (rpcError.code === 'P0002') {
      throw new Error(rpcError.message || 'One or more items in your cart are currently out of stock.');
    }
    if (rpcError.code === 'P0003') {
      throw new Error(rpcError.message || 'Product or kit is no longer active.');
    }
    throw new Error(`Checkout failed: ${rpcError.message}`);
  }

  const effectiveOrderNumber = (rpcResult as any)?.order_number || orderNumber;
  const isReplay = Boolean((rpcResult as any)?.is_idempotent_replay);

  const createdOrder = await getOrder(effectiveOrderNumber);
  if (!createdOrder) {
    throw new Error('Failed to retrieve order after creation');
  }

  if (!isReplay) {
    dispatchNotification({
      type: 'ORDER_CREATED',
      orderNumber: effectiveOrderNumber,
      customerName: input.customer_name,
      customerEmail: input.customer_email,
      customerPhone: input.customer_phone,
      totalMinor: createdOrder.total_minor,
      paymentMethod: input.payment_method,
    });
  }

  return {
    order: createdOrder,
    trackingToken,
    isIdempotentReplay: isReplay,
  };
}

function mapRowToOrder(row: any, items: OrderItem[]): Order {
  return {
    id: row.id,
    order_number: row.order_number,
    user_id: row.user_id || undefined,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_province: row.shipping_province,
    shipping_postal_code: row.shipping_postal_code || undefined,
    shipping_notes: row.shipping_notes || undefined,
    currency: row.currency || 'PKR',
    subtotal_minor: Number(row.subtotal_minor),
    shipping_minor: Number(row.shipping_minor),
    discount_minor: Number(row.discount_minor || 0),
    total_minor: Number(row.total_minor),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    order_status: row.order_status,
    tracking_courier: row.tracking_courier || row.courier_name || undefined,
    tracking_number: row.tracking_number || undefined,
    idempotency_key: row.idempotency_key || undefined,
    receipt_path: row.receipt_path || undefined,
    admin_note: row.admin_note || row.notes || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
  };
}

export async function lookupOrderWithCapability(
  orderNumber: string,
  token?: string,
  verify?: string
): Promise<{ order: Order; items: OrderItem[]; isAuthorized: boolean } | null> {
  const supabase = createPublicClient();
  const { data, error } = await (supabase.rpc as any)('lookup_order_with_capability', {
    p_order_number: orderNumber,
    p_token: token || null,
    p_verify: verify || null,
  });

  if (error || !data) return null;
  const res = data as any;
  if (!res.order) return null;

  const items: OrderItem[] = (res.items || []).map((it: any) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id || it.kit_id || '',
    variant_id: it.variant_id || undefined,
    kit_id: it.kit_id || undefined,
    name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
    sku_snapshot: it.sku_snapshot || '',
    quantity: Number(it.quantity),
    unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
    line_total_minor: Number(it.line_total_minor || 0),
    image_url: it.image_url || undefined,
  }));

  const order = mapRowToOrder(res.order, items);
  return {
    order,
    items,
    isAuthorized: Boolean(res.is_authorized),
  };
}

export async function getOrder(orderNumber: string): Promise<Order | null> {
  const lookup = await lookupOrderWithCapability(orderNumber);
  if (lookup) return lookup.order;
  const supabase = await getScopedClient();
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error || !row) return null;

  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', row.id);

  const items: OrderItem[] = (itemRows || []).map((it: any) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id || it.kit_id || '',
    variant_id: it.variant_id || undefined,
    kit_id: it.kit_id || undefined,
    name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
    sku_snapshot: it.sku_snapshot || '',
    quantity: Number(it.quantity),
    unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
    line_total_minor: Number(it.line_total_minor || 0),
    image_url: it.image_url || undefined,
  }));

  return mapRowToOrder(row, items);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await getScopedClient();
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !row) return null;

  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', row.id);

  const items: OrderItem[] = (itemRows || []).map((it: any) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id || it.kit_id || '',
    variant_id: it.variant_id || undefined,
    kit_id: it.kit_id || undefined,
    name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
    sku_snapshot: it.sku_snapshot || '',
    quantity: Number(it.quantity),
    unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
    line_total_minor: Number(it.line_total_minor || 0),
    image_url: it.image_url || undefined,
  }));

  return mapRowToOrder(row, items);
}

export async function getOrders(options?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  limit?: number;
}): Promise<Order[]> {
  const supabase = await getScopedClient();
  let query = supabase.from('orders').select(`
    *,
    order_items ( * )
  `);

  if (options?.status) {
    query = query.eq('order_status', options.status);
  }

  if (options?.paymentStatus) {
    query = query.eq('payment_status', options.paymentStatus);
  }

  if (options?.search) {
    const s = options.search;
    query = query.or(
      `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%,customer_phone.ilike.%${s}%`
    );
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: rows, error } = await query;

  if (error || !rows) {
    console.error('Failed to fetch orders:', error);
    return [];
  }

  return rows.map((row: any) => {
    const items: OrderItem[] = (row.order_items || []).map((it: any) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id || it.kit_id || '',
      variant_id: it.variant_id || undefined,
      kit_id: it.kit_id || undefined,
      name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
      sku_snapshot: it.sku_snapshot || '',
      quantity: Number(it.quantity),
      unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
      line_total_minor: Number(it.line_total_minor || 0),
      image_url: it.image_url || undefined,
    }));
    return mapRowToOrder(row, items);
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  courier?: string,
  trackingNumber?: string,
  adminNote?: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  assertOrderStatusUpdate(order, newStatus);

  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_fulfillment_transactional', {
    p_order_id: orderId,
    p_order_status: newStatus,
    p_tracking_number: trackingNumber || '',
    p_courier_name: courier || '',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: adminNote || '',
  });

  if (rpcErr) {
    throw new Error(`Failed to update order fulfillment: ${rpcErr.message}`);
  }

  // Dispatch lifecycle notifications after commit
  if (newStatus === 'SHIPPED') {
    dispatchNotification({
      type: 'ORDER_SHIPPED',
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      totalMinor: order.total_minor,
      trackingCourier: courier || order.tracking_courier || 'TCS Express',
      trackingNumber: trackingNumber || order.tracking_number || 'TCS-992819',
    });
  } else if (newStatus === 'DELIVERED') {
    dispatchNotification({
      type: 'ORDER_DELIVERED',
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      totalMinor: order.total_minor,
    });
  }

  return getOrderById(orderId);
}

export async function approveBankPayment(
  orderId: string,
  adminNote?: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_payment_transactional', {
    p_order_id: orderId,
    p_payment_status: 'VERIFIED',
    p_order_status: 'PAID',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: adminNote || 'Bank transfer verified by administrator',
  });

  if (rpcErr) {
    throw new Error(`Failed to approve payment: ${rpcErr.message}`);
  }

  dispatchNotification({
    type: 'PAYMENT_CONFIRMED',
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone || '',
    totalMinor: order.total_minor,
  });

  return getOrderById(orderId);
}

export async function rejectBankPayment(
  orderId: string,
  reason: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_payment_transactional', {
    p_order_id: orderId,
    p_payment_status: 'REJECTED',
    p_order_status: 'CANCELLED',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: reason,
  });

  if (rpcErr) {
    throw new Error(`Failed to reject payment: ${rpcErr.message}`);
  }

  dispatchNotification({
    type: 'PAYMENT_REJECTED',
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone || '',
    totalMinor: order.total_minor,
    rejectionReason: reason,
  });

  return getOrderById(orderId);
}
