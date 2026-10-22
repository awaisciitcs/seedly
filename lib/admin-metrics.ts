import type { Order } from './types';
export type DashboardRange = 'today' | '7d' | '30d' | 'all';
const day = 86400000;
/** Reporting dates follow the store's Pakistan time, independent of the admin's device. */
export function dashboardPeriodStart(range: DashboardRange, now: number): number {
  if (range === 'all') return -Infinity;
  const pakistanDate = new Date(now + 5 * 3600000);
  const midnight = Date.UTC(pakistanDate.getUTCFullYear(), pakistanDate.getUTCMonth(), pakistanDate.getUTCDate()) - 5 * 3600000;
  return midnight - (range === '7d' ? 6 : range === '30d' ? 29 : 0) * day;
}
export function isConfirmedOrder(order: Pick<Order, 'order_status' | 'payment_method' | 'payment_status'>): boolean {
  return ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(order.order_status)
    && (order.payment_method === 'COD' || ['VERIFIED', 'PAID'].includes(order.payment_status));
}
function summarize(orders: Order[]) {
  const confirmed = orders.filter(isConfirmedOrder);
  const valueMinor = confirmed.reduce((sum, order) => sum + order.total_minor, 0);
  return { orderCount: orders.length, valueMinor, averageMinor: confirmed.length ? Math.round(valueMinor / confirmed.length) : 0,
    confirmedCount: confirmed.length, dispatchedCount: orders.filter(order => ['SHIPPED', 'DELIVERED'].includes(order.order_status)).length };
}
export function dashboardMetrics(orders: Order[], range: DashboardRange, now = Date.now()) {
  const start = dashboardPeriodStart(range, now);
  const current = orders.filter(order => {const time = Date.parse(order.created_at);return time >= start && time <= now;});
  // Previous periods use the same number of calendar days, with today compared at the same time of day.
  const length = (range === '7d' ? 7 : range === '30d' ? 30 : 1) * day;
  const previous = range === 'all' ? null : summarize(orders.filter(order => {const time = Date.parse(order.created_at);return time >= start - length && time <= now - length;}));
  return { current: summarize(current), previous };
}
export function metricComparison(current: number, previous: number | undefined): string {
  if (previous === undefined) return 'All available history';
  if (previous === 0) return current === 0 ? 'No change from previous period' : 'No previous-period value';
  const percentage = (current - previous) * 100 / previous;
  return (percentage > 0 ? '+' : '') + percentage.toFixed(1) + '% vs previous period';
}
