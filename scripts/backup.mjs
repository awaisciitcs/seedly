import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

// 1. Read Supabase configuration from .env.local
let secretKey = process.env.SUPABASE_SECRET_KEY;
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SUPABASE_SECRET_KEY=')) {
      secretKey = trimmed.replace('SUPABASE_SECRET_KEY=', '').trim().replace(/^["']|["']$/g, '');
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim().replace(/^["']|["']$/g, '');
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=')) {
      publishableKey = trimmed.replace('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=', '').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const SUPABASE_URL = supabaseUrl || 'https://fyqmbjzpajmnyyqcrmgc.supabase.co';
const SUPABASE_KEY = secretKey || publishableKey || 'sb_publishable_qu7RVH39xF_KTN9RETEECg_vC3rzb3P';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'categories',
  'products',
  'product_variants',
  'kits',
  'kit_items',
  'site_settings',
  'reviews',
  'admin_users',
  'orders',
  'order_items',
  'stock_alert_subscriptions',
  'stock_alert_deliveries',
];

async function runBackup() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupDirName = `backup-${timestamp}`;
  const backupBasePath = path.join(process.cwd(), 'backups', backupDirName);
  const dbBackupPath = path.join(backupBasePath, 'supabase_tables');

  fs.mkdirSync(dbBackupPath, { recursive: true });

  console.log(`=============================================`);
  console.log(`  SEEDLY FULL SYSTEM & DATABASE BACKUP       `);
  console.log(`  Timestamp: ${now.toISOString()}             `);
  console.log(`  Directory: ${backupBasePath}                `);
  console.log(`=============================================\n`);

  // Get current git info
  let gitCommit = 'unknown';
  let gitBranch = 'unknown';
  try {
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn('Could not read git revision:', e.message);
  }

  const manifest = {
    backup_created_at: now.toISOString(),
    git_branch: gitBranch,
    git_commit: gitCommit,
    supabase_url: SUPABASE_URL,
    tables: {},
  };

  const allTablesData = {};

  console.log('[1/4] Exporting Supabase Cloud Tables...');
  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`  ❌ Failed to export ${table}: ${error.message}`);
        manifest.tables[table] = { status: 'FAILED', error: error.message };
      } else {
        const rowCount = data ? data.length : 0;
        const filePath = path.join(dbBackupPath, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data || [], null, 2), 'utf8');
        allTablesData[table] = data || [];
        manifest.tables[table] = { status: 'SUCCESS', row_count: rowCount };
        console.log(`  ✓ ${table}: ${rowCount} records backed up -> ${table}.json`);
      }
    } catch (err) {
      console.error(`  ❌ Unexpected error on table ${table}:`, err.message);
      manifest.tables[table] = { status: 'ERROR', error: err.message };
    }
  }

  // Write all-in-one consolidated JSON dump
  const consolidatedPath = path.join(backupBasePath, 'all_supabase_data.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(allTablesData, null, 2), 'utf8');
  console.log(`\n✓ Consolidated database dump written to: all_supabase_data.json`);

  // Generate SQL insert dump
  const sqlDumpPath = path.join(backupBasePath, 'restore_data.sql');
  let sqlContent = `-- Seedly Database Restore Dump\n-- Generated at: ${now.toISOString()}\n\n`;

  for (const [table, rows] of Object.entries(allTablesData)) {
    if (!rows || rows.length === 0) continue;
    sqlContent += `-- Table: ${table} (${rows.length} rows)\n`;
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = Object.values(row).map((val) => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number' || typeof val === 'boolean') return val;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      sqlContent += `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();\n`;
    }
    sqlContent += `\n`;
  }
  fs.writeFileSync(sqlDumpPath, sqlContent, 'utf8');
  console.log(`✓ SQL restoration script written to: restore_data.sql`);

  // [2/4] Backup local SQLite database if present
  console.log('\n[2/4] Checking local SQLite storage...');
  const localDb = path.join(process.cwd(), 'data', 'seedly.db');
  if (fs.existsSync(localDb)) {
    const sqliteBackupDir = path.join(backupBasePath, 'sqlite');
    fs.mkdirSync(sqliteBackupDir, { recursive: true });
    fs.copyFileSync(localDb, path.join(sqliteBackupDir, 'seedly.db'));
    const stats = fs.statSync(localDb);
    manifest.sqlite = { status: 'SUCCESS', size_bytes: stats.size };
    console.log(`  ✓ Local SQLite database copied (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    manifest.sqlite = { status: 'NOT_FOUND' };
    console.log('  ℹ No local SQLite file present (cloud-first architecture).');
  }

  // [3/4] Save manifest
  const manifestPath = path.join(backupBasePath, 'backup_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n[3/4] Manifest written -> backup_manifest.json`);

  // [4/4] Create Git Backup Tag and Branch
  console.log('\n[4/4] Creating Git Backup Tag & Branch on remote...');
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 16).replace(':', '');
  const tagName = `backup-${dateStr}-${timeStr}`;
  const backupBranch = `backup/${dateStr}`;

  try {
    // Create tag
    execSync(`git tag -a "${tagName}" -m "Full backup snapshot on ${now.toISOString()}"`, { stdio: 'pipe' });
    console.log(`  ✓ Created git tag: ${tagName}`);

    // Push tag to remote
    execSync(`git push origin "${tagName}"`, { stdio: 'pipe' });
    console.log(`  ✓ Pushed git tag "${tagName}" to origin`);

    // Create / update backup branch and push
    execSync(`git branch -f "${backupBranch}" HEAD`, { stdio: 'pipe' });
    execSync(`git push -u origin "${backupBranch}" --force`, { stdio: 'pipe' });
    console.log(`  ✓ Pushed backup branch "${backupBranch}" to origin`);

    manifest.git_tag = tagName;
    manifest.git_backup_branch = backupBranch;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  } catch (gitErr) {
    console.warn(`  ⚠ Git remote push warning: ${gitErr.message}`);
  }

  console.log(`\n=============================================`);
  console.log(`  BACKUP COMPLETED SUCCESSFULLY!             `);
  console.log(`  Location: backups/${backupDirName}         `);
  console.log(`  Git Tag:  ${tagName}                       `);
  console.log(`=============================================\n`);
}

runBackup().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
