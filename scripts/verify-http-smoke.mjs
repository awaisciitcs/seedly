import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin=process.env.SEEDLY_HTTP_TEST_ORIGIN || 'http://127.0.0.1:3111';
const parsed=new URL(origin);
if(!['127.0.0.1','localhost','[::1]'].includes(parsed.hostname))throw new Error('This smoke script is restricted to a local production preview.');
const results=[];
async function call(path,expected,options={}) {
 const started=performance.now();const response=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(30000),...options});
 assert.ok((Array.isArray(expected)?expected:[expected]).includes(response.status),path+' returned '+response.status+' instead of '+expected);
 results.push({path,method:options.method||'GET',status:response.status,elapsed_ms:Math.round(performance.now()-started)});
 return response;
}
const json=(body,requestOrigin=origin)=>({method:'POST',headers:{'content-type':'application/json',origin:requestOrigin},body:JSON.stringify(body)});
const settings=await (await call('/api/store/settings',200)).json();
const catalog=await (await call('/api/products',200)).json();assert.ok(catalog.data.length>0);
const product=catalog.data.find(p=>p.product_type&&p.variants?.some(v=>v.status==='ACTIVE'&&v.inventory_quantity>0));assert.ok(product,'No stocked product fixture is available');
const variant=product.variants.find(v=>v.status==='ACTIVE'&&v.inventory_quantity>0);
const items=[{product_id:product.id,variant_id:variant.id,quantity:1}];
const quoteResponse=await call('/api/cart/quote',200,json({items}));const quote=(await quoteResponse.json()).data;
assert.ok(quote.total_minor===quote.subtotal_minor+quote.shipping_minor && typeof quote.token==='string');
assert.match(quoteResponse.headers.get('cache-control')||'',/no-store/);
await call('/api/cart/quote',400,json({items:[{...items[0],quantity:1.5}]}));
await call('/api/cart/quote',403,json({items},'https://attacker.example'));
await call('/api/cart/sync',200,json({items:[]}));
const search=await (await call('/api/search?q='+encodeURIComponent(product.name.split(' ')[0]),200)).json();assert.ok(search.items.length>0&&search.items.length<=6);assert.ok(search.items.every(p=>p.image&&p.href));
await call('/api/reviews?productId=x,or(secret)',400);
await call('/api/reviews',400,json({product_id:product.id,customer_name:'Fixture',body:'Invalid fractional-rating fixture only.',rating:4.5}));
await call('/api/stock-alerts/subscribe',[400,503],json({email:'invalid'}));
await call('/api/stock-alerts/unsubscribe?token=invalid',400);
for(const path of ['/','/shop','/seeds','/teas','/kits','/find-your-seed','/cart','/checkout','/account','/wishlist','/account/wishlist','/about','/contact','/faq','/shipping','/returns','/terms','/privacy','/product-disclaimer','/robots.txt','/sitemap.xml','/admin/login'])await call(path,200);
await call('/'+(product.product_type==='tea'?'teas':'seeds')+'/'+product.slug,200);
const kit=catalog.data.find(p=>!p.product_type&&p.package_size!==undefined);if(kit)await call('/kits/'+kit.slug,200);
const missingProduct=await call('/seeds/definitely-not-a-product',[200,404]);assert.match(await missingProduct.text(),/noindex/,'Streamed missing products must be excluded from search indexing');await call('/definitely-not-a-page',404);
for(const path of ['/admin','/admin/orders','/admin/products','/admin/kits','/admin/customers','/admin/reviews','/admin/settings','/admin/stock-alerts']) {
 const response=await call(path,[307,308]);assert.ok(response.headers.get('location')?.includes('/admin/login'));assert.match(response.headers.get('cache-control')||'',/no-store/);
}
for(const path of ['/api/admin/me','/api/admin/counts','/api/admin/products','/api/admin/categories','/api/admin/kits','/api/admin/orders','/api/admin/orders/fixture-id','/api/admin/reviews','/api/admin/settings','/api/admin/receipts?path=fixture.pdf','/api/admin/stock-alerts'])await call(path,401);
await call('/api/admin/orders/fixture-id/status',403,json({status:'PACKED'},'https://attacker.example'));
await call('/api/orders',400,json({}));await call('/api/orders',403,json({},'https://attacker.example'));
if(settings.data?.ordering_available===false) {
 const body={customer_name:'Fixture Customer',customer_email:'fixture@example.com',customer_phone:'03001234567',shipping_address:'12 Fixture Street',shipping_city:'Lahore',shipping_province:'Punjab',payment_method:'COD',idempotency_key:'http-negative-fixture-key-1234',quote_token:quote.token,items};
 await call('/api/orders',503,json(body));await call('/api/payments/bank-transfer/receipt',503,json({}));
} else console.log('Positive order submission skipped: this script never creates a live customer order.');
const privatePage=await call('/order/SED-100200',200);assert.equal(privatePage.headers.get('referrer-policy'),'no-referrer');
const result={checks:results.length,customerOrdersCreated:0,adminMutations:0,browserInteractionsTested:false,results};
if(process.env.SEEDLY_HTTP_TEST_REPORT)fs.writeFileSync(process.env.SEEDLY_HTTP_TEST_REPORT,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checks:result.checks,customerOrdersCreated:0,adminMutations:0,browserInteractionsTested:false}));
