import { createPublicClient } from '../supabase/public';
import { getScopedClient } from '../supabase/admin';
import { CustomerStoreSettings, SiteSettings, PaymentMethod } from '../types';
import { adminEnum, adminNumber, adminText, AdminInputError } from '../admin-validation';

const SETTING_KEYS = new Set([
  'currency', 'delivery_fee_minor', 'free_delivery_threshold_minor',
  'bank_name', 'bank_account_title', 'bank_account_number', 'bank_iban',
  'jazzcash_number', 'jazzcash_title', 'easypaisa_number', 'easypaisa_title',
  'serviceable_cities',
  'ordering_enabled', 'cod_enabled', 'bank_transfer_enabled', 'wallet_enabled',
]);
const BOOLEAN_KEYS = new Set(['ordering_enabled', 'cod_enabled', 'bank_transfer_enabled', 'wallet_enabled']);
const CMS_MANAGED_KEYS = new Set(['store_name', 'tagline', 'support_email', 'whatsapp_number']);

/** Supabase is authoritative: never fabricate a payment destination or delivery fee. */
export async function getSiteSettings(_options: { requireConfigured?: boolean } = {}): Promise<SiteSettings> {
  const { data: rows, error } = await createPublicClient().from('site_settings').select('key, value');
  if (error || !rows) throw new Error('Store settings are temporarily unavailable. Please try again.');
  const map: Record<string, string> = Object.fromEntries(rows.map(row => [row.key, row.value]));
  const required = (key: string) => {
    const value = map[key];
    if (typeof value !== 'string' || !value.trim()) throw new Error('Store settings are incomplete. Please contact the store.');
    return value.trim();
  };
  const amount = (key: string, minimum: number) => {
    const value = required(key);
    const amount = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(amount) || amount < minimum || amount > 100_000_000) {
      throw new Error('Delivery settings are not configured. Please contact the store.');
    }
    return amount;
  };
  const flag = (key: string) => {
    if (!['true', 'false'].includes(map[key])) throw new Error('Ordering controls are not configured. Please contact the store.');
    return map[key] === 'true';
  };
  let cities: unknown;
  try { cities = JSON.parse(required('serviceable_cities')); } catch { throw new Error('Delivery cities are not configured. Please contact the store.'); }
  if (!Array.isArray(cities) || !cities.length || cities.length > 100 || cities.some(city => typeof city !== 'string' || !city.trim() || city.length > 100)) {
    throw new Error('Delivery cities are not configured. Please contact the store.');
  }
  const currency = required('currency');
  if (currency !== 'PKR') throw new Error('Store currency is not configured.');
  return {
    store_name: required('store_name'), tagline: map.tagline || '', currency,
    delivery_fee_minor: amount('delivery_fee_minor', 0),
    free_delivery_threshold_minor: amount('free_delivery_threshold_minor', 1),
    bank_name: map.bank_name || '', bank_account_title: map.bank_account_title || '',
    bank_account_number: map.bank_account_number || '', bank_iban: map.bank_iban || '',
    jazzcash_number: map.jazzcash_number || '', jazzcash_title: map.jazzcash_title || '',
    easypaisa_number: map.easypaisa_number || '', easypaisa_title: map.easypaisa_title || '',
    whatsapp_number: map.whatsapp_number || '', support_email: map.support_email || '',
    serviceable_cities: [...new Set(cities.map(city => city.trim()))],
    ordering_enabled: flag('ordering_enabled'), cod_enabled: flag('cod_enabled'),
    bank_transfer_enabled: flag('bank_transfer_enabled'), wallet_enabled: flag('wallet_enabled'),
  };
}

export function enabledPaymentMethods(settings: SiteSettings): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  if (settings.cod_enabled) methods.push('COD');
  if (settings.bank_transfer_enabled && settings.bank_name && settings.bank_account_title && settings.bank_account_number) methods.push('bank_transfer');
  if (settings.wallet_enabled && (settings.jazzcash_number && settings.jazzcash_title || settings.easypaisa_number && settings.easypaisa_title)) methods.push('wallet_aggregator');
  return methods;
}

export async function getCustomerStoreSettings(): Promise<CustomerStoreSettings> {
  const settings = await getSiteSettings();
  const { currency, delivery_fee_minor, free_delivery_threshold_minor, bank_name, bank_account_title, bank_account_number, bank_iban, jazzcash_number, jazzcash_title, easypaisa_number, easypaisa_title } = settings;
  const enabled_payment_methods = enabledPaymentMethods(settings);
  const ordering_available = Boolean(process.env.SUPABASE_SECRET_KEY) && settings.ordering_enabled && enabled_payment_methods.length > 0;
  return { currency, delivery_fee_minor, free_delivery_threshold_minor, bank_name, bank_account_title, bank_account_number, bank_iban, jazzcash_number, jazzcash_title, easypaisa_number, easypaisa_title, enabled_payment_methods, receipt_upload_available: ordering_available && enabled_payment_methods.some(method => method !== 'COD'), ordering_available };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  if (Object.keys(settings).some(key => CMS_MANAGED_KEYS.has(key))) {
    throw new AdminInputError('Manage branding and contact details in Website Content (/admin/content/site). Save a draft, then publish it.');
  }
  const supabase = await getScopedClient();
  const upserts: { key: string; value: string; updated_at: string }[] = [];
  for (const [key, value] of Object.entries(settings)) {
    if (!SETTING_KEYS.has(key)) throw new AdminInputError('Unknown store setting: ' + key);
    let validated: string | number | string[] | boolean;
    if (BOOLEAN_KEYS.has(key)) {
      if (typeof value !== 'boolean') throw new AdminInputError('Ordering controls must be true or false.');
      validated = value;
    } else if (key === 'delivery_fee_minor' || key === 'free_delivery_threshold_minor') {
      validated = adminNumber(value, key.replaceAll('_', ' '), key === 'free_delivery_threshold_minor' ? 1 : 0, 100_000_000);
    } else if (key === 'currency') {
      validated = adminEnum(value, ['PKR'], 'currency');
    } else if (key === 'serviceable_cities') {
      if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new AdminInputError('Provide between 1 and 100 cities.');
      validated = [...new Set(value.map(city => adminText(city, 'City', 100, true)))];
    } else {
      validated = adminText(value, key.replaceAll('_', ' '), 300);
    }
    upserts.push({ key, value: Array.isArray(validated) ? JSON.stringify(validated) : String(validated), updated_at: new Date().toISOString() });
  }
  if (upserts.length) {
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    if (error) throw new Error('Store settings could not be saved. Please try again.');
  }
}
