const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const validEnvironment = {
  VERCEL_ENV: 'production',
  NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture',
  SUPABASE_SECRET_KEY: 'sb_secret_fixture_private_never_print',
  CHECKOUT_SIGNING_SECRET: 'fixture-only-stable-private-signing-secret-32-characters',
  ORDER_REFERENCE_MODE: 'sequential',
};
const privateValues = [validEnvironment.SUPABASE_SECRET_KEY, validEnvironment.CHECKOUT_SIGNING_SECRET];
const assertNoPrivateValues = value => {
  const output = typeof value === 'string' ? value : JSON.stringify(value);
  for (const privateValue of privateValues) assert.equal(output.includes(privateValue), false);
};
const guard = () => import('./vercel-build-guard.mjs');

const publicCmsFixture = (origin = 'https://shop.example.com', error = null) => (url, key, options) => {
  assert.equal(url, validEnvironment.NEXT_PUBLIC_SUPABASE_URL);
  assert.equal(key, validEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  assert.equal(options.db.retry, false);
  assert.equal(options.auth.persistSession, false);
  return {
    rpc: async name => {
      assert.equal(name, 'get_site_content_snapshot');
      return { data: { documents: { site: { content: { config: { url: origin } } } } }, error };
    },
  };
};

test('Vercel production guard blocks each missing required setting before any Supabase read', async () => {
  const { inspectVercelBuildGuard } = await guard();
  for (const name of Object.keys(validEnvironment).filter(name => name !== 'VERCEL_ENV')) {
    const environment = { ...validEnvironment };
    delete environment[name];
    let reads = 0;
    const report = await inspectVercelBuildGuard(environment, () => { reads++; throw Error('unexpected read'); });
    assert.equal(report.skipped, false);
    assert.equal(report.configurationReady, false, name);
    assert.equal(reads, 0);
    assertNoPrivateValues(report);
  }
});

test('Vercel production guard blocks malformed values and private keys in public settings', async () => {
  const { inspectVercelBuildGuard } = await guard();
  for (const changes of [
    { NEXT_PUBLIC_SUPABASE_URL: 'http://fixture.supabase.co' },
    { NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co/path' },
    { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validEnvironment.SUPABASE_SECRET_KEY },
    { SUPABASE_SECRET_KEY: 'sb_publishable_fixture' },
    { CHECKOUT_SIGNING_SECRET: 'too-short' },
    { ORDER_REFERENCE_MODE: 'random' },
    { NEXT_PUBLIC_ACCIDENTAL: validEnvironment.SUPABASE_SECRET_KEY },
  ]) {
    let reads = 0;
    const report = await inspectVercelBuildGuard({ ...validEnvironment, ...changes }, () => { reads++; });
    assert.equal(report.configurationReady, false);
    assert.equal(reads, 0);
    assertNoPrivateValues(report);
  }
});

test('valid hosted configuration passes after a public-only CMS read with email deferred', async () => {
  const { inspectVercelBuildGuard } = await guard();
  const report = await inspectVercelBuildGuard(validEnvironment, publicCmsFixture());
  assert.equal(report.skipped, false);
  assert.equal(report.configurationReady, true);
  assert.equal(report.checks.some(check => check.name === 'Published CMS website origin' && check.status === 'PASS'), true);
  assert.equal(report.checks.some(check => check.status === 'DEFERRED'), true);
  assertNoPrivateValues(report);
});

test('guard skips local and preview builds without loading local credentials or touching Supabase', async () => {
  const { inspectVercelBuildGuard } = await guard();
  for (const environment of [{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { NODE_ENV: 'production' }]) {
    let reads = 0;
    const report = await inspectVercelBuildGuard(environment, () => { reads++; });
    assert.deepEqual(report, { skipped: true, configurationReady: true, checks: [] });
    assert.equal(reads, 0);
  }
});

test('CMS errors, outages and unpublished origins block production without leaking upstream details', async () => {
  const { inspectVercelBuildGuard } = await guard();
  const privateError = validEnvironment.SUPABASE_SECRET_KEY + ' ' + validEnvironment.CHECKOUT_SIGNING_SECRET;
  for (const factory of [
    publicCmsFixture(undefined, Error(privateError)),
    publicCmsFixture('https://shop.example.com/path'),
    publicCmsFixture('http://shop.example.com'),
    () => { throw Error(privateError); },
  ]) {
    const report = await inspectVercelBuildGuard(validEnvironment, factory);
    assert.equal(report.configurationReady, false);
    assertNoPrivateValues(report);
  }
});

test('guard command fails before Next build and prints remediation without secret values', () => {
  const environment = { ...validEnvironment, NEXT_PUBLIC_SUPABASE_URL: 'http://invalid.example.com' };
  const result = spawnSync(process.execPath, [path.join(__dirname, 'vercel-build-guard.mjs')], {
    encoding: 'utf8', env: environment,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Supabase project origin/);
  assert.match(result.stderr, /production build blocked/);
  assertNoPrivateValues(result.stdout + result.stderr);
});

test('local guard command succeeds without requiring a configured environment', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'vercel-build-guard.mjs')], {
    encoding: 'utf8', env: { VERCEL_ENV: 'preview' },
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /skipped outside Vercel production/);
});
