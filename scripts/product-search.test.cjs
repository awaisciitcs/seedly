const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Exercise the actual mapping and route without opening the shop database.
function loadSource(file, dependencies = {}) {
  const filename = path.join(__dirname, '..', file);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    URL,
    console: { error() {} },
    require(name) {
      if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
      return dependencies[name];
    },
  }, { filename });
  return module.exports;
}

const mapping = loadSource('lib/product-search.ts');
const seed = {
  id: 'seed', name: 'Raw Pumpkin Seeds', slug: 'pumpkin-seeds', product_type: 'seed',
  image_url: '/images/products/pumpkin-seeds.jpg', price_minor: 45000, weight_grams: 250,
  short_description: 'Raw pumpkin seeds', ingredients: 'Pumpkin', status: 'ACTIVE',
  variants: [
    { status: 'INACTIVE', weight_grams: 250, option_value: '250g', price_minor: 1 },
    { status: 'ACTIVE', weight_grams: 100, option_value: '100g', price_minor: 45000 },
    { status: 'ACTIVE', weight_grams: 250, option_value: '250g', price_minor: 95000 },
  ],
};
const tea = { ...seed, id: 'tea', name: 'Chamomile Tea', slug: 'chamomile-tea', product_type: 'tea', variants: [] };
const kit = {
  id: 'kit', name: 'Follicular Blend', slug: 'follicular-blend', status: 'ACTIVE',
  short_description: 'A blend for the follicular phase', ingredients: 'Pumpkin and flax',
  package_size: '28 servings', price_minor: 240000, image_url: '/images/products/follicular-blend.jpg',
};

function route(products = [seed, tea], kits = [kit]) {
  const select = (items, options) => items.filter((item) => item.status === 'ACTIVE' &&
    (!options.search || [item.name, item.short_description, item.ingredients].some((value) => value.toLowerCase().includes(options.search.toLowerCase()))));
  return loadSource('app/api/search/route.ts', {
    'next/server': { NextResponse: Response },
    '../../../lib/services/products': { getProducts: (options) => select(products, options) },
    '../../../lib/services/kits': { getKits: (options) => select(kits, options) },
    '../../../lib/product-search': mapping,
  }).GET;
}

test('search shows the active default variant price and size', () => {
  const result = mapping.toSearchResult(seed);
  assert.equal(result.priceMinor, 95000);
  assert.equal(result.size, '250g');
  assert.equal(result.href, '/seeds/pumpkin-seeds');
  assert.equal(result.image, seed.image_url);
});

test('default-size fallback ignores inactive variants', () => {
  const result = mapping.toSearchResult({ ...seed, variants: seed.variants.slice(0, 2) });
  assert.equal(result.priceMinor, 45000);
  assert.equal(result.size, '100g');
  const noVariants = mapping.toSearchResult({ ...seed, variants: [] });
  assert.equal(noVariants.priceMinor, seed.price_minor);
});

test('teas and kits open their own detail pages', () => {
  assert.equal(mapping.toSearchResult(tea).href, '/teas/chamomile-tea');
  const result = mapping.toSearchResult(kit);
  assert.equal(result.href, '/kits/follicular-blend');
  assert.equal(result.size, '28 servings');
  assert.equal(result.priceMinor, 240000);
});

test('partial, case-insensitive description searches include kits', async () => {
  const result = await route()(new Request('http://localhost/api/search?q=%20PHASE%20'));
  const data = await result.json();
  assert.equal(result.status, 200);
  assert.equal(data.total, 1);
  assert.equal(data.items[0].href, '/kits/follicular-blend');
  assert.equal(result.headers.get('cache-control'), 'no-store');
});

test('preview is capped at six, with total retained and draft products excluded', async () => {
  const products = Array.from({ length: 9 }, (_, index) => ({ ...seed, id: String(index) }));
  products.push({ ...seed, id: 'draft', status: 'DRAFT' });
  const result = await route(products)(new Request('http://localhost/api/search'));
  const data = await result.json();
  assert.equal(data.total, 10);
  assert.equal(data.items.length, 6);
  assert.equal(data.items.some((item) => item.id.includes('draft')), false);
});

test('name matches come before ingredient matches; empty matches return zero', async () => {
  const get = route();
  const match = await (await get(new Request('http://localhost/api/search?q=pumpkin'))).json();
  assert.equal(match.items[0].name, seed.name);
  const empty = await (await get(new Request('http://localhost/api/search?q=does-not-exist'))).json();
  assert.equal(empty.total, 0);
  assert.equal(empty.items.length, 0);
});

test('service failures return a safe message for the retry state', async () => {
  const get = loadSource('app/api/search/route.ts', {
    'next/server': { NextResponse: Response },
    '../../../lib/services/products': { getProducts: () => { throw Error('private database detail'); } },
    '../../../lib/services/kits': { getKits: () => [] },
    '../../../lib/product-search': mapping,
  }).GET;
  const result = await get(new Request('http://localhost/api/search?q=pumpkin'));
  assert.equal(result.status, 500);
  assert.equal((await result.json()).error, 'Search is temporarily unavailable.');
});