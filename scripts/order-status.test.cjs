const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
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
  let sequence = 0;
  const orders = new Map();
  const notifications = [];

  const service = {
    createOrder({ payment_method, receipt_path }) {
      const { paymentStatus, orderStatus } = policy.getInitialOrderState(payment_method, Boolean(receipt_path));
      const order = {
        id: `ord-${++sequence}`,
        order_number: `TEST-${sequence}`,
        payment_method,
        payment_status: paymentStatus,
        order_status: orderStatus,
        receipt_path: receipt_path || null,
        tracking_courier: null,
        tracking_number: null,
      };
      orders.set(order.id, order);
      orders.set(order.order_number, order);
      return order;
    },
    getOrder(orderNumber) {
      return orders.get(orderNumber) || null;
    },
    updateOrderStatus(orderId, nextStatus, courier, trackingNumber) {
      const order = orders.get(orderId);
      if (!order) throw new Error('Order not found');
      policy.assertOrderStatusUpdate(order, nextStatus);
      order.order_status = nextStatus;
      if (courier) order.tracking_courier = courier;
      if (trackingNumber) order.tracking_number = trackingNumber;
      if (nextStatus === 'SHIPPED') {
        notifications.push({ type: 'ORDER_SHIPPED', orderNumber: order.order_number });
      }
      return order;
    },
    approveBankPayment(orderId) {
      const order = orders.get(orderId);
      if (!order) throw new Error('Order not found');
      order.payment_status = 'VERIFIED';
      order.order_status = 'PAID';
      notifications.push({ type: 'PAYMENT_CONFIRMED', orderNumber: order.order_number });
      return order;
    },
  };

  const create = (payment_method, receipt_path) => service.createOrder({
    payment_method,
    receipt_path,
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
