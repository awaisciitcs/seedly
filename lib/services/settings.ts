import { getDatabase } from '../db';
import { SiteSettings } from '../types';

export function getSiteSettings(): SiteSettings {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  return {
    store_name: map['store_name'] || 'Seedly',
    tagline: map['tagline'] || 'Raw Seeds & Loose-Leaf Teas',
    currency: map['currency'] || 'PKR',
    delivery_fee_minor: parseInt(map['delivery_fee_minor'] || '20000', 10),
    free_delivery_threshold_minor: parseInt(map['free_delivery_threshold_minor'] || '250000', 10),
    bank_name: map['bank_name'] || 'Meezan Bank Limited',
    bank_account_title: map['bank_account_title'] || 'Seedly Naturals Pakistan',
    bank_account_number: map['bank_account_number'] || '0102-0104882910',
    bank_iban: map['bank_iban'] || 'PK36MEZN0001020104882910',
    jazzcash_number: map['jazzcash_number'] || '0371 9055758',
    jazzcash_title: map['jazzcash_title'] || 'Seedly Care',
    easypaisa_number: map['easypaisa_number'] || '0371 9055758',
    easypaisa_title: map['easypaisa_title'] || 'Seedly Care',
    whatsapp_number: map['whatsapp_number'] || '+92 371 9055758',
    support_email: map['support_email'] || 'care@seedly.pk',
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
}

export function updateSiteSettings(settings: Partial<SiteSettings>) {
  const db = getDatabase();
  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'object') {
      stmt.run(key, JSON.stringify(value));
    } else {
      stmt.run(key, String(value));
    }
  }
}
