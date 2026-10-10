import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const jwtRole = value => { try { return JSON.parse(Buffer.from(value.split('.')[1] || '', 'base64url').toString()).role; } catch { return null; } };
const secret = value => typeof value === 'string' && value.length >= 32 && !/[\r\n]/.test(value) && !/^YOUR_|^CHANGE_ME|^REPLACE_/i.test(value);
const validOrigin = (value, production) => {
  try { const url = new URL(value); const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    return !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash && (url.protocol === 'https:' && (!production || !local) || !production && url.protocol === 'http:' && local);
  } catch { return false; }
};
/** Diagnostics only: passing does not certify deployment or workflow acceptance. */
export function inspectProductionEnvironment(environment, production = false) {
  const checks = [];
  const add = (name, ok, action) => checks.push({ name, status: ok ? 'PASS' : 'FAIL', ...(ok ? {} : { action }) });
  add('Supabase project origin', validOrigin(environment.NEXT_PUBLIC_SUPABASE_URL, production), 'Set NEXT_PUBLIC_SUPABASE_URL to the intended project origin.');
  const publicKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  add('Public Supabase key boundary', /^sb_publishable_[A-Za-z0-9_-]+$/.test(publicKey) || jwtRole(publicKey) === 'anon', 'Configure a publishable key. Never expose a private key through NEXT_PUBLIC.');
  const privateKey = environment.SUPABASE_SECRET_KEY || '';
  add('Private Supabase backend key', /^sb_secret_[A-Za-z0-9_-]+$/.test(privateKey) || jwtRole(privateKey) === 'service_role', 'Configure SUPABASE_SECRET_KEY in the server environment.');
  add('Stable checkout signing secret', secret(environment.CHECKOUT_SIGNING_SECRET), 'Keep a separate stable CHECKOUT_SIGNING_SECRET with at least 32 random characters.');
  add('Sequential order references', environment.ORDER_REFERENCE_MODE === 'sequential', 'Apply numbering migration, then configure ORDER_REFERENCE_MODE=sequential.');
  for (const [name, value] of Object.entries(environment)) {
    if (name.startsWith('NEXT_PUBLIC_') && (String(value).startsWith('sb_secret_') || jwtRole(String(value)) === 'service_role')) {
      add('Secret exposed by ' + name, false, 'Remove the private public-configuration value and rotate that credential.');
    }
  }
  checks.push({ name: 'Email provider and inbox acceptance', status: 'DEFERRED', action: 'Owner deferred provider selection. Keep sending disabled until configuration, domain verification and an authorized inbox test.' });
  return { mode: production ? 'production' : 'local', configurationReady: checks.every(check => check.status !== 'FAIL'), checks,
    manualGates: ['Verify the published site.config.url is the intended public HTTPS website origin; it controls canonical URLs. The CLI checks the current published origin format.', 'Confirm historical administrator credential rotation and session revocation.', 'Reconcile historical orders with incomplete stock reservations before cancellation.', 'Verify protected Vercel preview workflows against staging.', 'Test a full database, Auth and Storage restore.', 'Verify hosted monitoring and mobile performance.'] };
}
/** Read-only low-privilege verification; no content or credential values are returned. */
export async function inspectPublishedCmsOrigin(environment, production = false, clientFactory) {
  const name = 'Published CMS website origin';
  const fail = action => ({ name, status: 'FAIL', action });
  const publicKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!validOrigin(environment.NEXT_PUBLIC_SUPABASE_URL, production) || !(/^sb_publishable_[A-Za-z0-9_-]+$/.test(publicKey) || jwtRole(publicKey) === 'anon')) {
    return fail('Configure the public Supabase project/client boundary before verifying published website content.');
  }
  try {
    const createClient = clientFactory || (await import('@supabase/supabase-js')).createClient;
    const client = createClient(environment.NEXT_PUBLIC_SUPABASE_URL, publicKey, {
      db: { retry: false },
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const upstream = init?.signal || (input instanceof Request ? input.signal : undefined);
        const deadline = AbortSignal.timeout(15000);
        return fetch(input, { ...init, signal: upstream ? AbortSignal.any([upstream, deadline]) : deadline });
      } },
    });
    const { data, error } = await client.rpc('get_site_content_snapshot');
    const origin = data?.documents?.site?.content?.config?.url;
    if (error) return fail('Published website content could not be read. Verify the CMS migration, public RPC grant and project availability.');
    if (typeof origin !== 'string' || !validOrigin(origin, production) || new URL(origin).protocol !== 'https:') {
      return fail('Publish a valid HTTPS website origin in Website Content / site / config.url, without a path, query, credentials or fragment.');
    }
    return { name, status: 'PASS' };
  } catch {
    return fail('Published website content verification was unavailable or timed out. Retry after checking the intended Supabase project.');
  }
}
const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main) {
  const envFile = fileURLToPath(new URL('../.env.local', import.meta.url));
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
  const production = process.argv.includes('--production');
  const report = inspectProductionEnvironment(process.env, production);
  report.checks.push(await inspectPublishedCmsOrigin(process.env, production));
  report.configurationReady = report.checks.every(check => check.status !== 'FAIL');
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const check of report.checks) console.log(check.status + ': ' + check.name + (check.action ? ' ? ' + check.action : ''));
    console.log('Configuration diagnostics ' + (report.configurationReady ? 'passed' : 'failed') + '. Manual acceptance gates remain required.');
  }
  if (!report.configurationReady) process.exitCode = 1;
}
