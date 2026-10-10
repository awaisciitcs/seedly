import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

export function loadLocalEnvironment() {
  const envFile = path.join(workspaceRoot, '.env.local');
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
}

export function requireSupabaseConfig({ privileged = false } = {}) {
  loadLocalEnvironment();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = privileged ? process.env.SUPABASE_SECRET_KEY :
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error(`Configure NEXT_PUBLIC_SUPABASE_URL and ${privileged ? 'SUPABASE_SECRET_KEY' : 'a Supabase public key'} before running this script.`);
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Invalid Supabase URL.');
  if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) throw new Error('Remote Supabase connections require HTTPS.');
  if (privileged && !key.startsWith('sb_secret_')) {
    let role;
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch { /* Rejected below. */ }
    if (role !== 'service_role') throw new Error('A private service-role key is required; public keys cannot export protected records.');
  }
  return { url: parsed.origin, key };
}

export function localDatabasePath({ mutates = false } = {}) {
  const configured = process.env.SEEDLY_SQLITE_PATH;
  if (mutates && (!process.argv.includes('--allow-local-mutations') || !configured)) {
    throw new Error('Legacy SQLite mutations are disabled. Use a disposable copy outside the repository, set SEEDLY_SQLITE_PATH, and pass --allow-local-mutations. These scripts do not test the Supabase backend.');
  }
  const target = path.resolve(configured || path.join(workspaceRoot, 'data', 'seedly.db'));
  const realTarget = fs.realpathSync(target);
  if (mutates && (realTarget === workspaceRoot || realTarget.startsWith(workspaceRoot + path.sep))) {
    throw new Error('Refusing to mutate the repository SQLite archive. Select a disposable copy outside this repository.');
  }
  if (!fs.statSync(realTarget).isFile()) throw new Error('SQLite path must be an existing regular file.');
  return realTarget;
}

export function privateExportPath(configured) {
  if (!configured || !path.isAbsolute(configured)) throw new Error('Set an absolute export directory outside the repository.');
  const target = path.resolve(configured);
  let ancestor = target;
  const suffix = [];
  while (!fs.existsSync(ancestor)) { suffix.unshift(path.basename(ancestor)); ancestor = path.dirname(ancestor); }
  const resolved = path.resolve(fs.realpathSync(ancestor), ...suffix);
  if (resolved === workspaceRoot || resolved.startsWith(workspaceRoot + path.sep)) throw new Error('Private exports must be outside the repository.');
  return resolved;
}

export async function readAllRows(client, table, { columns = '*', orderBy = 'id', pageSize = 500 } = {}) {
  const rows = [];
  let expectedCount;
  while (true) {
    let query = client.from(table).select(columns, { count: 'exact' });
    for (const column of Array.isArray(orderBy) ? orderBy : [orderBy]) query = query.order(column);
    const { data, count, error } = await query.range(rows.length, rows.length + pageSize - 1);
    if (error) throw new Error(`Could not read ${table} (${error.code || 'database error'}).`);
    if (!Array.isArray(data) || !Number.isSafeInteger(count)) throw new Error(`Invalid export response for ${table}.`);
    if (expectedCount === undefined) expectedCount = count;
    if (count !== expectedCount) throw new Error(`${table} changed during export. Retry in a maintenance window.`);
    rows.push(...data);
    if (rows.length === expectedCount) break;
    if (!data.length || rows.length > expectedCount) throw new Error(`Incomplete export for ${table}.`);
  }
  return rows;
}
