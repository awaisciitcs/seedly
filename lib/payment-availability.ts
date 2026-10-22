import type { CustomerStoreSettings } from './types';
type PaymentAvailability = Pick<CustomerStoreSettings, 'ordering_available' | 'enabled_payment_methods'>;
/** Promotions follow the same enabled methods as checkout; never advertise disabled COD. */
export function paymentAvailabilityLabel(settings: PaymentAvailability | null, codLabel: string): string {
  if (!settings) return '';
  if (!settings.ordering_available) return 'Ordering temporarily paused';
  if (settings.enabled_payment_methods.includes('COD')) return codLabel;
  const bank = settings.enabled_payment_methods.includes('bank_transfer');
  const wallet = settings.enabled_payment_methods.includes('wallet_aggregator');
  return bank && wallet ? 'Bank and mobile wallet transfers' : bank ? 'Bank transfer available' : wallet ? 'Mobile wallet transfer available' : '';
}
