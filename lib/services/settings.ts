import { createPublicClient } from '../supabase/public';
import { getScopedClient } from '../supabase/admin';
import { SiteSettings } from '../types';

const DEFAULT_SETTINGS: SiteSettings = {
  store_name: 'Seedly',
  tagline: 'Raw Seeds & Loose-Leaf Teas',
  currency: 'PKR',
  delivery_fee_minor: 20000,
  free_delivery_threshold_minor: 250000,
  bank_name: 'Meezan Bank Limited',
  bank_account_title: 'Seedly Naturals Pakistan',
  bank_account_number: '0102-0104882910',
  bank_iban: 'PK36MEZN0001020104882910',
  jazzcash_number: '0371 9055758',
  jazzcash_title: 'Seedly Care',
  easypaisa_number: '0371 9055758',
  easypaisa_title: 'Seedly Care',
  whatsapp_number: '+92 371 9055758',
  support_email: 'care@seedly.pk',
  serviceable_cities: [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Gilgit',
    'Skardu',
    'Bahawalpur',
  ],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data: rows, error } = await supabase.from('site_settings').select('key, value');

  if (error || !rows) {
    console.error('Failed to fetch site settings from Supabase:', error);
    return DEFAULT_SETTINGS;
  }

  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  return {
    store_name: map['store_name'] || DEFAULT_SETTINGS.store_name,
    tagline: map['tagline'] || DEFAULT_SETTINGS.tagline,
    currency: map['currency'] || DEFAULT_SETTINGS.currency,
    delivery_fee_minor: parseInt(map['delivery_fee_minor'] || '20000', 10),
    free_delivery_threshold_minor: parseInt(map['free_delivery_threshold_minor'] || '250000', 10),
    bank_name: map['bank_name'] || DEFAULT_SETTINGS.bank_name,
    bank_account_title: map['bank_account_title'] || DEFAULT_SETTINGS.bank_account_title,
    bank_account_number: map['bank_account_number'] || DEFAULT_SETTINGS.bank_account_number,
    bank_iban: map['bank_iban'] || DEFAULT_SETTINGS.bank_iban,
    jazzcash_number: map['jazzcash_number'] || DEFAULT_SETTINGS.jazzcash_number,
    jazzcash_title: map['jazzcash_title'] || DEFAULT_SETTINGS.jazzcash_title,
    easypaisa_number: map['easypaisa_number'] || DEFAULT_SETTINGS.easypaisa_number,
    easypaisa_title: map['easypaisa_title'] || DEFAULT_SETTINGS.easypaisa_title,
    whatsapp_number: map['whatsapp_number'] || DEFAULT_SETTINGS.whatsapp_number,
    support_email: map['support_email'] || DEFAULT_SETTINGS.support_email,
    serviceable_cities: DEFAULT_SETTINGS.serviceable_cities,
  };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const supabase = await getScopedClient();
  const upserts: { key: string; value: string; updated_at: string }[] = [];

  for (const [key, value] of Object.entries(settings)) {
    upserts.push({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_at: new Date().toISOString(),
    });
  }

  if (upserts.length > 0) {
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    if (error) {
      throw new Error(`Failed to update site settings: ${error.message}`);
    }
  }
}
