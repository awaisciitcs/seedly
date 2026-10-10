import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseConfig, privateExportPath, readAllRows } from './script-config.mjs';

// Private row export only. Use Supabase backups / pg_dump for transaction-consistent disaster recovery,
// Auth users, Storage objects, private schemas, sequence state and the database schema.
const config = requireSupabaseConfig({ privileged: true });
const base = privateExportPath(process.env.SEEDLY_BACKUP_DIR);
const directory = path.join(base, 'database-' + new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
const manifest = { created_at: new Date().toISOString(), kind: 'private-row-export', complete: false, tables: {} };
const tables = ['categories','products','product_variants','kits','kit_items','site_settings','reviews','admin_users','orders','order_items','order_events','stock_alert_subscriptions','stock_alert_deliveries','order_stock_reservations'];
try {
  for (const table of tables) {
    const orderBy = table === 'site_settings' ? 'key' : table === 'order_stock_reservations' ? ['order_id','variant_id'] : 'id';
    const rows = await readAllRows(client, table, { orderBy });
    const bytes = JSON.stringify(rows, null, 2) + '\n';
    fs.writeFileSync(path.join(directory, table + '.json'), bytes, { flag: 'wx', mode: 0o600 });
    manifest.tables[table] = { rows: rows.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
    console.log(table + ': ' + rows.length + ' rows');
  }
  manifest.complete = true;
} catch (error) {
  console.error('Export is incomplete. No remote data or Git history was changed.');
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Private export: ' + directory);
}
