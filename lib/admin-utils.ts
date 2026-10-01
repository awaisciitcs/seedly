/**
 * Standardized Admin Utilities for Seedly Pakistan Operations Desk
 */

const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

/**
 * Format paisa (integer minor unit) to Pakistani Rupees (e.g. 250000 -> "Rs. 2,500")
 */
export function formatPKR(minorOrMajor: number, isMinor = true): string {
  const amount = isMinor ? Math.floor(minorOrMajor / 100) : minorOrMajor;
  // Intl format returns "PKR 2,500" or similar; we standardize to "Rs. 2,500"
  const formatted = pkrFormatter.format(amount);
  return formatted.replace('PKR', 'Rs.');
}

/**
 * Convert Date to Asia/Karachi (PKT) timestamp string
 */
export function formatPKTDateTime(dateString: string): { relative: string; absolute: string; dateOnly: string } {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { relative: dateString, absolute: dateString, dateOnly: dateString };
    }

    // Relative age
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffDays > 0) {
      const remHours = diffHours % 24;
      relative = remHours > 0 ? `${diffDays}d ${remHours}h ago` : `${diffDays}d ago`;
    } else if (diffHours > 0) {
      const remMin = diffMin % 60;
      relative = remMin > 0 ? `${diffHours}h ${remMin}m ago` : `${diffHours}h ago`;
    } else if (diffMin > 0) {
      relative = `${diffMin}m ago`;
    } else {
      relative = 'Just now';
    }

    // Asia/Karachi absolute
    const absolute = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date) + ' PKT';

    const dateOnly = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);

    return { relative, absolute, dateOnly };
  } catch {
    return { relative: dateString, absolute: dateString, dateOnly: dateString };
  }
}

/**
 * Returns compact age string for queues, e.g. "1d 3h" or "45m"
 */
export function getQueueAge(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const remHours = diffHours % 24;
      return remHours > 0 ? `${diffDays}d ${remHours}h` : `${diffDays}d`;
    }
    if (diffHours > 0) {
      const remMin = diffMin % 60;
      return remMin > 0 ? `${diffHours}h ${remMin}m` : `${diffHours}h`;
    }
    return `${Math.max(1, diffMin)}m`;
  } catch {
    return '1m';
  }
}

/**
 * Detect test / simulation order
 */
export function isTestOrder(order: {
  customer_name?: string;
  customer_email?: string;
  order_number?: string;
}): boolean {
  const name = (order.customer_name || '').toLowerCase();
  const email = (order.customer_email || '').toLowerCase();
  const num = (order.order_number || '').toLowerCase();

  return (
    name.includes('test') ||
    name.includes('maryam nawaz') ||
    email.includes('test') ||
    email.includes('maryam.customer') ||
    email.includes('mailinator') ||
    num.includes('test')
  );
}

/**
 * Pluralization helper using Intl.PluralRules
 */
const pluralRules = new Intl.PluralRules('en-US');
export function pluralize(count: number, singular: string, plural: string): string {
  const rule = pluralRules.select(count);
  return rule === 'one' ? `${count} ${singular}` : `${count} ${plural}`;
}
