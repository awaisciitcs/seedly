const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');

// Run the actual service against an in-memory database and a notification stub.
// This never opens data/seedly.db or sends customer notifications.
function loadSource(file, dependencies = {}) {
  const filename = path.join(__dirname, '..', file);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename });
  return module.exports;
}

const policy = loadSource('lib/order-status.ts');

function fixture(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(`
    CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT, price_minor INTEGER, sku TEXT, image_url TEXT);
    CREATE TABLE product_variants (id TEXT PRIMARY KEY, inventory_quantity INTEGER, option_value TEXT, price_minor INTEGER, sku TEXT);
    CREATE TABLE orders (
      id TEXT PRIMARY KEY, order_number TEXT, customer_name TEXT, customer_email TEXT,
      customer_phone TEXT, shipping_address TEXT, shipping_city TEXT, shipping_province TEXT,
      shipping_postal_code TEXT, shipping_notes TEXT, currency TEXT, subtotal_minor INTEGER,
      shipping_minor INTEGER, discount_minor INTEGER, total_minor INTEGER, payment_method TEXT,
      payment_status TEXT, order_status TEXT, receipt_path TEXT, tracking_courier TEXT,
      tracking_number TEXT, admin_note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE order_items (
      id TEXT PRIMARY KEY, order_id TEXT, product_id TEXT, variant_id TEXT, kit_id TEXT,
      name_snapshot TEXT, sku_snapshot TEXT, quantity INTEGER, unit_price_minor INTEGER,
      line_total_minor INTEGER, image_url TEXT
    );
    INSERT INTO products VALUES ('seed', 'Test seeds', 95000, 'TEST-SEED', '/test.jpg');
    INSERT INTO product_variants VALUES ('seed-250', 100, '250g', 95000, 'TEST-250');
  `);
  let sequence = 0;
  const notifications = [];
  const service = loadSource('lib/services/orders.ts', {
    '../db': { getDatabase: () => db },
    '../utils': { generateOrderNumber: () => `TEST-${++sequence}` },
    '../order-status': policy,
    './settings': { getSiteSettings: () => ({ free_delivery_threshold_minor: 250000, delivery_fee_minor: 20000 }) },
    './notifications': { dispatchNotification: (payload) => notifications.push(payload) },
    './kits': { getKitById: () => null },
  });
  const create = (payment_method, receipt_path) => service.createOrder({
    customer_name: 'Test customer', customer_email: 'test@example.invalid', customer_phone: '03000000000',
    shipping_address: 'Test address', shipping_city: 'Lahore', shipping_province: 'Punjab',
    payment_method, receipt_path, items: [{ product_id: 'seed', variant_id: 'seed-250', quantity: 1 }],
  });
  return { service, create, notifications };
}

for (const method of ['bank_transfer', 'wallet_aggregator']) {
  test(`${method} stays under review until explicit approval`, (t) => {
    const { service, create } = fixture(t);
    const order = create(method, method === 'bank_transfer' ? '/test-receipt.jpg' : undefined);
    assert.equal(order.payment_status, 'UNDER_REVIEW');
    assert.equal(order.order_status, 'PAYMENT_REVIEW');
    for (const status of ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED']) {
      assert.throws(() => service.updateOrderStatus(order.id, status), /Verify the payment/);
    }
    const saved = service.getOrder(order.order_number);
    assert.equal(saved.order_status, 'PAYMENT_REVIEW');
    assert.equal(policy.getOrderProgress(saved).packed, false);
    assert.equal(policy.getOrderProgress(saved).packingActive, false);
  });
}

test('bank transfer without receipt awaits payment', (t) => {
  const { create } = fixture(t);
  const order = create('bank_transfer');
  assert.equal(order.order_status, 'PENDING_PAYMENT');
  assert.equal(order.payment_status, 'PENDING');
  assert.equal(policy.getOrderProgress(order).paymentLabel, 'Awaiting payment');
});

test('cash on delivery starts as received and is packed only by explicit update', (t) => {
  const { create, service } = fixture(t);
  const order = create('COD');
  assert.equal(order.order_status, 'RECEIVED');
  assert.equal(order.payment_status, 'PENDING');
  const progress = policy.getOrderProgress(order);
  assert.equal(progress.paymentLabel, 'Pay on delivery');
  assert.equal(progress.packed, false);
  assert.equal(progress.packingActive, false);
  const processing = service.updateOrderStatus(order.id, 'PROCESSING');
  assert.equal(policy.getOrderProgress(processing).packingActive, true);
  assert.equal(policy.getOrderProgress(processing).packed, false);
  const packed = service.updateOrderStatus(order.id, 'PACKED');
  assert.equal(policy.getOrderProgress(packed).packed, true);
  assert.equal(packed.payment_status, 'PENDING');
  assert.equal(policy.PAYMENT_METHOD_LABELS.COD, 'Cash on delivery');
});

test('payment approval does not complete preparation or packing', (t) => {
  const { create, service, notifications } = fixture(t);
  const order = create('bank_transfer', '/test-receipt.jpg');
  const paid = service.approveBankPayment(order.id);
  assert.equal(paid.payment_status, 'VERIFIED');
  assert.equal(paid.order_status, 'PAID');
  assert.equal(policy.getOrderProgress(paid).packingActive, false);
  assert.equal(policy.getOrderProgress(paid).packed, false);
  const processing = service.updateOrderStatus(order.id, 'PROCESSING');
  assert.equal(policy.getOrderProgress(processing).packed, false);
  assert.equal(service.getOrder(order.order_number).order_status, 'PROCESSING');
  const packed = service.updateOrderStatus(order.id, 'PACKED');
  assert.equal(policy.getOrderProgress(packed).packed, true);
  assert.equal(policy.getOrderProgress(packed).shipped, false);
  const shipped = service.updateOrderStatus(order.id, 'SHIPPED', 'Test courier', 'TEST-123');
  assert.equal(policy.getOrderProgress(shipped).shipped, true);
  assert.equal(policy.getOrderProgress(shipped).delivered, false);
  const delivered = service.updateOrderStatus(order.id, 'DELIVERED');
  assert.equal(policy.getOrderProgress(delivered).delivered, true);
  assert.equal(notifications.filter((event) => event.type === 'ORDER_SHIPPED').length, 1);
});

test('inconsistent historical states cannot show fulfilled unpaid transfers', () => {
  for (const order_status of ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED']) {
    const progress = policy.getOrderProgress({ order_status, payment_status: 'UNDER_REVIEW', payment_method: 'bank_transfer' });
    assert.equal(progress.packed, false);
    assert.equal(progress.shipped, false);
    assert.equal(progress.delivered, false);
  }
});

test('invalid admin status is rejected without changing the order', (t) => {
  const { create, service } = fixture(t);
  const order = create('COD');
  assert.throws(() => service.updateOrderStatus(order.id, 'INVALID'), /Invalid order status/);
  assert.equal(service.getOrder(order.order_number).order_status, 'RECEIVED');
});
