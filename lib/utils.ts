import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paisa (integer minor unit) to Pakistani Rupees (e.g. 68000 -> "Rs. 680")
 */
export function formatPrice(minor: number = 0): string {
  const pkr = Math.floor(minor / 100);
  return `Rs. ${pkr.toLocaleString('en-PK')}`;
}

export const formatPKR = formatPrice;

export function toSentenceCase(str: string): string {
  if (!str) return '';
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function pkrToMinor(pkr: number): number {
  return Math.round(pkr * 100);
}

export function minorToPKR(minor: number): number {
  return Math.floor(minor / 100);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateOrderNumber(): string {
  // Use Asia/Karachi (PKT, UTC+5) so order number date matches local calendar date
  const now = new Date();
  const pktDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = pktDateFormatter.format(now).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `SED-${dateStr}-${randomStr}`;
}
