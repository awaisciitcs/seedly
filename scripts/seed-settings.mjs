import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'seedly.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  INSERT OR REPLACE INTO site_settings (key, value) VALUES
    ('delivery_fee_minor', '20000'),
    ('free_delivery_threshold_minor', '250000'),
    ('bank_name', 'Meezan Bank Limited'),
    ('bank_account_title', 'Seedly Naturals Pakistan'),
    ('bank_account_number', '0102-0104882910'),
    ('bank_iban', 'PK36MEZN0001020104882910'),
    ('whatsapp_number', '+92 300 1234567'),
    ('support_email', 'care@seedly.pk');

  INSERT OR IGNORE INTO admin_users (id, email, name, role) VALUES
    ('adm-owner', 'owner@seedly.pk', 'Seedly Founder', 'Owner'),
    ('adm-staff', 'staff@seedly.pk', 'Store Operations', 'Staff');
`);

console.log('Site settings and admin users successfully populated in SQLite!');
