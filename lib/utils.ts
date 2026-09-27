import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paisa (integer minor unit) to Pakistani Rupees (e.g. 125000 -> "Rs. 1,250")
 */
export function formatPKR(minor: number = 0): string {
  const pkr = Math.floor(minor / 100);
  return `Rs. ${pkr.toLocaleString('en-PK')}`;
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
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `SED-${dateStr}-${randomStr}`;
}
