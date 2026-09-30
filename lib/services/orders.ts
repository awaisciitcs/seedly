import { getDatabase } from '../db';
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
  items: {
    product_id: string;
    variant_id?: string;
    kit_id?: string;
    quantity: number;
  }[];
}

export function validateAndQuote(items: { product_id: string; variant_id?: string; kit_id?: string; quantity: number }[]) {
  const db = getDatabase();
  const settings = getSiteSettings();

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
      // It's a kit
      const kit = getKitById(item.kit_id);
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
      // Regular product / variant
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id) as any;
      if (!product) continue;

      let unitPrice = product.price_minor;
      let sku = product.sku;
      let variantLabel = '';

      if (item.variant_id) {
        const variant = db.prepare('SELECT * FROM product_variants WHERE id = ?').get(item.variant_id) as any;
        if (variant) {
          if ((variant.inventory_quantity ?? 0) < item.quantity) {
            throw new Error(
              (variant.inventory_quantity ?? 0) <= 0
                ? `"${product.name} (${variant.option_value})" is currently out of stock.`
                : `"${product.name} (${variant.option_value})" only has ${variant.inventory_quantity} available in stock.`
            );
          }
          unitPrice = variant.price_minor;
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
        sku,
        quantity: item.quantity,
        unit_price_minor: unitPrice,
        line_total_minor: lineTotal,
        image_url: product.image_url,
      });
    }
  }

  // Delivery fee logic
  const shipping_minor = subtotal_minor >= settings.free_delivery_threshold_minor ? 0 : settings.delivery_fee_minor;
  const total_minor = subtotal_minor + shipping_minor;

  return {
    subtotal_minor,
    shipping_minor,
    total_minor,
    items: validatedItems,
  };
}

export function createOrder(input: CreateOrderInput): Order {
  const db = getDatabase();
  const quote = validateAndQuote(input.items);

  if (quote.items.length === 0) {
    throw new Error('Order items cannot be empty or invalid');
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = generateOrderNumber();

  const { paymentStatus: initialPaymentStatus, orderStatus: initialOrderStatus } =
    getInitialOrderState(input.payment_method, Boolean(input.receipt_path));

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone,
      shipping_address, shipping_city, shipping_province, shipping_postal_code,
      shipping_notes, currency, subtotal_minor, shipping_minor, discount_minor,
      total_minor, payment_method, payment_status, order_status, receipt_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    orderId,
    orderNumber,
    input.customer_name,
    input.customer_email,
    input.customer_phone,
    input.shipping_address,
    input.shipping_city,
    input.shipping_province,
    input.shipping_postal_code || '',
    input.shipping_notes || '',
    'PKR',
    quote.subtotal_minor,
    quote.shipping_minor,
    0,
    quote.total_minor,
    input.payment_method,
    initialPaymentStatus,
    initialOrderStatus,
    input.receipt_path || null
  );

  // Insert line items & decrement stock
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, variant_id, kit_id, name_snapshot,
      sku_snapshot, quantity, unit_price_minor, line_total_minor, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of quote.items) {
    const itemId = `oi-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    insertItem.run(
      itemId,
      orderId,
      item.product_id,
      item.variant_id || null,
      item.kit_id || null,
      item.name,
      item.sku,
      item.quantity,
      item.unit_price_minor,
      item.line_total_minor,
      item.image_url
    );

    // Inventory reservation/decrement
    if (item.variant_id) {
      db.prepare(`
        UPDATE product_variants
        SET inventory_quantity = MAX(0, inventory_quantity - ?)
        WHERE id = ?
      `).run(item.quantity, item.variant_id);
    } else if (item.kit_id) {
      // Decrement each component product variant
      const kitComponents = db.prepare('SELECT * FROM kit_items WHERE kit_id = ?').all(item.kit_id) as any[];
      for (const comp of kitComponents) {
        if (comp.product_variant_id) {
          db.prepare(`
            UPDATE product_variants
            SET inventory_quantity = MAX(0, inventory_quantity - ?)
            WHERE id = ?
          `).run(comp.quantity * item.quantity, comp.product_variant_id);
        }
      }
    }
  }

  // Trigger customer notification
  dispatchNotification({
    type: 'ORDER_CREATED',
    orderNumber,
    customerName: input.customer_name,
    customerEmail: input.customer_email,
    customerPhone: input.customer_phone,
    totalMinor: quote.total_minor,
    paymentMethod: input.payment_method,
  });

  return getOrder(orderNumber)!;
}

export function getOrder(orderNumber: string): Order | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
  if (!row) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id) as unknown as OrderItem[];

  return {
    ...row,
    items,
  };
}

export function getOrderById(id: string): Order | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!row) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id) as unknown as OrderItem[];

  return {
    ...row,
    items,
  };
}

export function getOrders(options?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  limit?: number;
}): Order[] {
  const db = getDatabase();
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (options?.status) {
    query += ' AND order_status = ?';
    params.push(options.status);
  }

  if (options?.paymentStatus) {
    query += ' AND payment_status = ?';
    params.push(options.paymentStatus);
  }

  if (options?.search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((row) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id) as unknown as OrderItem[];
    return { ...row, items };
  });
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  courier?: string,
  trackingNumber?: string,
  adminNote?: string
) {
  const db = getDatabase();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  assertOrderStatusUpdate(order, newStatus);

  db.prepare(`
    UPDATE orders
    SET order_status = ?,
        tracking_courier = COALESCE(?, tracking_courier),
        tracking_number = COALESCE(?, tracking_number),
        admin_note = COALESCE(?, admin_note),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newStatus, courier || null, trackingNumber || null, adminNote || null, orderId);

  // Dispatch lifecycle notification
  if (newStatus === 'SHIPPED') {
    dispatchNotification({
      type: 'ORDER_SHIPPED',
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalMinor: order.total_minor,
      trackingCourier: courier || order.tracking_courier || 'TCS Express',
      trackingNumber: trackingNumber || order.tracking_number || 'TCS-992819',
    });
  } else if (newStatus === 'DELIVERED') {
    dispatchNotification({
      type: 'ORDER_DELIVERED',
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalMinor: order.total_minor,
    });
  }

  return getOrderById(orderId);
}

export function approveBankPayment(orderId: string, adminNote?: string) {
  const db = getDatabase();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  db.prepare(`
    UPDATE orders
    SET payment_status = 'VERIFIED',
        order_status = 'PAID',
        admin_note = COALESCE(?, admin_note),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(adminNote || 'Bank transfer verified by admin', orderId);

  dispatchNotification({
    type: 'PAYMENT_CONFIRMED',
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    totalMinor: order.total_minor,
  });

  return getOrderById(orderId);
}

export function rejectBankPayment(orderId: string, reason: string) {
  const db = getDatabase();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  db.prepare(`
    UPDATE orders
    SET payment_status = 'REJECTED',
        order_status = 'CANCELLED',
        admin_note = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(reason, orderId);

  dispatchNotification({
    type: 'PAYMENT_REJECTED',
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    totalMinor: order.total_minor,
    rejectionReason: reason,
  });

  return getOrderById(orderId);
}
