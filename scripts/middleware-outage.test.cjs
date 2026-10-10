const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(file, dependencies) {
  const filename = path.join(__dirname, '..', file);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports, URL, Request, Response, TextDecoder, Uint8Array,
    console: { error() {} },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw Error('Unexpected dependency ' + name);
    },
  }, { filename });
  return module.exports;
}
const guards = load('lib/request-guards.ts', {});
const diagnostic = 'private-diagnostic-marker';
function fixture({ failure, user = null } = {}) {
  let clientCalls = 0;
  const middleware = load('middleware.ts', {
    'next/server': { NextResponse },
    './lib/supabase/fetch': { boundedSupabaseFetch() {} },
    './lib/request-guards': guards,
    './lib/supabase/config': {
      getSupabaseUrl() {
        if (failure === 'url') throw Error(diagnostic);
        return 'https://fixture.supabase.co';
      },
      getSupabaseKey() {
        if (failure === 'key') throw Error(diagnostic);
        return 'sb_publishable_fixture';
      },
    },
    '@supabase/ssr': {
      createServerClient() {
        clientCalls++;
        return { auth: { async getUser() {
          if (failure === 'auth') throw Error(diagnostic);
          return { data: { user }, error: user ? null : { name: 'AuthSessionMissingError' } };
        } } };
      },
    },
  }).middleware;
  return { middleware, clientCalls: () => clientCalls };
}
function request(route, init) { return new NextRequest('https://shop.example.com' + route, init); }
function assertPrivate(response) {
  assert.match(response.headers.get('cache-control'), /private/);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('pragma'), 'no-cache');
  assert.equal(response.headers.get('expires'), '0');
}

test('missing public configuration and thrown Auth failures show retry guidance without a login redirect loop', async () => {
  for (const failure of ['url', 'key', 'auth']) {
    const { middleware } = fixture({ failure });
    for (const route of ['/admin/login', '/admin/orders']) {
      const response = await middleware(request(route));
      assert.equal(response.status, 503, failure + ' at ' + route);
      assert.equal(response.headers.get('location'), null);
      assert.equal(response.headers.get('retry-after'), '30');
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.equal(response.headers.get('x-frame-options'), 'DENY');
      assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
      assertPrivate(response);
      const body = await response.text();
      assert.match(body, /Try again/);
      assert.equal(body.includes(diagnostic), false);
    }
  }
});

test('configuration and thrown Auth failures fail closed with a private 503 JSON response on protected APIs', async () => {
  for (const failure of ['url', 'key', 'auth']) {
    const { middleware } = fixture({ failure });
    const response = await middleware(request('/api/admin/orders'));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('retry-after'), '30');
    assert.match(response.headers.get('content-type'), /application\/json/);
    assertPrivate(response);
    const body = await response.json();
    assert.match(body.error.message, /temporarily unavailable/);
    assert.equal(JSON.stringify(body).includes(diagnostic), false);
  }
});

test('normal unauthenticated login stays reachable while protected APIs and pages retain their access checks', async () => {
  const { middleware } = fixture();
  const login = await middleware(request('/admin/login'));
  assert.equal(login.status, 200);
  assert.equal(login.headers.get('x-middleware-next'), '1');
  assert.equal(login.headers.get('location'), null);
  assertPrivate(login);
  const api = await middleware(request('/api/admin/orders'));
  assert.equal(api.status, 401);
  assert.match((await api.json()).error.message, /Authentication required/);
  assertPrivate(api);
  const page = await middleware(request('/admin/orders'));
  assert.equal(page.status, 307);
  const destination = new URL(page.headers.get('location'));
  assert.equal(destination.pathname, '/admin/login');
  assert.equal(destination.searchParams.get('redirectTo'), '/admin/orders');
  assertPrivate(page);
});

test('verified sessions still continue to protected routes for downstream role authorization', async () => {
  const { middleware } = fixture({ user: { id: 'verified-fixture' } });
  for (const route of ['/admin/login', '/admin/orders', '/api/admin/orders']) {
    const response = await middleware(request(route));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-middleware-next'), '1');
    assertPrivate(response);
  }
});

test('cross-origin writes remain forbidden before checking a failing authentication service', async () => {
  const { middleware, clientCalls } = fixture({ failure: 'auth' });
  const response = await middleware(request('/api/admin/orders', {
    method: 'POST', headers: { origin: 'https://attacker.example.com' },
  }));
  assert.equal(response.status, 403);
  assert.equal(clientCalls(), 0);
  assertPrivate(response);
});
