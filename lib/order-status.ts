import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from './types';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'RECEIVED', 'PENDING_PAYMENT', 'PAYMENT_REVIEW', 'PAID', 'PROCESSING',
  'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
];

export class OrderStatusError extends Error {}

export function getInitialOrderState(paymentMethod: PaymentMethod, hasReceipt = false): {
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
} {
  if (paymentMethod === 'COD') return { paymentStatus: 'PENDING', orderStatus: 'RECEIVED' };
  // Wallet transfers and uploaded receipts still require manual verification.
  if (paymentMethod === 'wallet_aggregator' || hasReceipt) {
    return { paymentStatus: 'UNDER_REVIEW', orderStatus: 'PAYMENT_REVIEW' };
  }
  return { paymentStatus: 'PENDING', orderStatus: 'PENDING_PAYMENT' };
}

type OrderState = Pick<Order, 'order_status' | 'payment_status' | 'payment_method'>;

export function assertOrderStatusUpdate(order: OrderState, nextStatus: OrderStatus) {
  if (!ORDER_STATUSES.includes(nextStatus)) throw new OrderStatusError('Invalid order status.');
  const requiresPayment = nextStatus === 'PAID' || (
    order.payment_method !== 'COD' && ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(nextStatus)
  );
  if (requiresPayment && order.payment_status !== 'VERIFIED') {
    throw new OrderStatusError('Verify the payment before updating fulfillment.');
  }
}

export function getOrderProgress(order: OrderState) {
  const stopped = ['CANCELLED', 'REFUNDED'].includes(order.order_status);
  const canFulfill = !stopped && (order.payment_method === 'COD' || order.payment_status === 'VERIFIED');
  const paymentLabel = order.payment_status === 'VERIFIED' ? 'Payment verified'
    : order.payment_method === 'COD' ? 'Pay on delivery'
    : order.payment_status === 'UNDER_REVIEW' ? 'Payment under review'
    : order.payment_status === 'REJECTED' ? 'Payment rejected'
    : order.payment_status === 'FAILED' ? 'Payment failed' : 'Awaiting payment';

  return {
    paymentLabel,
    paymentDone: order.payment_status === 'VERIFIED',
    paymentActive: !stopped && order.payment_status === 'UNDER_REVIEW',
    packingActive: canFulfill && order.order_status === 'PROCESSING',
    packed: canFulfill && ['PACKED', 'SHIPPED', 'DELIVERED'].includes(order.order_status),
    shipped: canFulfill && ['SHIPPED', 'DELIVERED'].includes(order.order_status),
    delivered: canFulfill && order.order_status === 'DELIVERED',
  };
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  wallet_aggregator: 'JazzCash / Easypaisa',
};
