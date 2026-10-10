const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), crypto = require('node:crypto'), net = require('node:net');
function load(file, deps = {}, extra = {}) {
  const filename = path.join(__dirname, '..', file);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 }, fileName: filename }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { module, exports: module.exports, URL, Request, Response, FormData, File, Buffer, TextDecoder, Uint8Array, AbortSignal, AbortController, Date, atob, console: { error() {}, log() {} }, process: { env: { SUPABASE_SECRET_KEY: 'sb_secret_fixture' } }, require(name) { if (name in deps) return deps[name]; throw Error('Unexpected dependency ' + name); }, ...extra }, { filename });
  return module.exports;
}
const guards = load('lib/request-guards.ts');

test('multipart uploads preserve files and distinguish malformed, wrong-content and oversized input', async () => {
  const form = new FormData(); form.append('file', new File([new Uint8Array([1,2,3])], 'fixture.png'));
  const result = await guards.readMultipart(new Request('https://shop.example.com/api/admin/upload', { method: 'POST', body: form }), 4096);
  assert.equal(result.get('file').name, 'fixture.png'); assert.equal(result.get('file').size, 3);
  for (const [headers, body, status] of [[{'content-type':'application/json'}, '{}', 415], [{'content-type':'multipart/form-data; boundary=missing'}, 'broken', 400], [{'content-type':'multipart/form-data; boundary=x','content-length':'9000'}, '', 413]]) {
    await assert.rejects(() => guards.readMultipart(new Request('https://shop.example.com', { method:'POST', headers, body }), 4096), error => error.status === status);
  }
  const excessive = new FormData(); for (let i=0; i<9; i++) excessive.append('field-'+i,'fixture');
  await assert.rejects(() => guards.readMultipart(new Request('https://shop.example.com', {method:'POST',body:excessive}),4096),error=>error.status===400);
});

test('malformed admin upload returns input error before storage or private database calls', async () => {
  let uploads=0;
  const route = load('app/api/admin/upload/route.ts', { 'next/server': {NextResponse:Response}, 'node:crypto':crypto,
    '@/lib/upload-limits':{MAX_UPLOAD_FILE_BYTES:4*1024*1024,MAX_UPLOAD_BODY_BYTES:4*1024*1024+64000}, '@/lib/admin-validation':{AdminInputError:guards.RequestError}, '@/lib/auth/require-admin':{requireAdmin:async()=>({}),AdminAuthError:class extends Error{}},
    '@/lib/request-guards':guards, '@/lib/supabase/admin':{getScopedClient:async()=>{uploads++;throw Error('Storage must not be called');}},
  });
  const request=new Request('https://shop.example.com/api/admin/upload',{method:'POST',headers:{origin:'https://shop.example.com','content-type':'multipart/form-data; boundary=fixture'},body:'broken'});
  assert.equal((await route.POST(request)).status,400); assert.equal(uploads,0);
});

test('Supabase requests retain caller cancellation and use one bounded database or storage fetch', async () => {
  const timeouts=[], calls=[];
  const bounded=load('lib/supabase/fetch.ts',{}, {AbortSignal:{timeout(ms){timeouts.push(ms);return AbortSignal.timeout(ms);},any(signals){return AbortSignal.any(signals);}},
    fetch:async(input,init)=>{calls.push({input,init});if(init.signal.aborted)throw init.signal.reason;return new Response('{}');}});
  const controller=new AbortController(); controller.abort(new Error('caller stopped'));
  await assert.rejects(()=>bounded.boundedSupabaseFetch('https://fixture.supabase.co/rest/v1/orders',{signal:controller.signal}),/caller stopped/);
  await bounded.boundedSupabaseFetch('https://fixture.supabase.co/storage/v1/object/product-images/a.png',{method:'POST',body:'fixture'});
  assert.deepEqual(timeouts,[15000,30000]); assert.equal(calls.length,2); assert.equal(calls[1].init.method,'POST'); assert.equal(calls[1].init.body,'fixture');
});

test('server, public and private clients use bounded transport and controlled read retries', async()=>{
  const transport={boundedSupabaseFetch:()=>{}}, config={getSupabaseUrl:()=> 'https://fixture.supabase.co',getSupabaseKey:()=> 'sb_publishable_fixture'};
  for(const file of ['lib/supabase/public.ts','lib/supabase/admin.ts','lib/supabase/server.ts']){
    let options;
    const deps={'./fetch':transport,'./config':config,'server-only':{},
      '@supabase/supabase-js':{createClient(url,key,input){options=input;return{};}},
      '@supabase/ssr':{createServerClient(url,key,input){options=input;return{};}},
      './server':{createClient:async()=>({})},'next/headers':{cookies:async()=>({getAll:()=>[],set(){}})}};
    const client=load(file,deps);
    if(file.endsWith('admin.ts'))client.createAdminClient();else await client.createClient?.()||client.createPublicClient?.();
    assert.equal(options.db.retry,false);assert.equal(options.global.fetch,transport.boundedSupabaseFetch);
  }
});

function limiter(environment={},result={allowed:true,retry_after_seconds:0},failure=false){
  const calls=[];
  const helper=load('lib/public-rate-limit.ts',{'server-only':{},'node:crypto':crypto,'node:net':net,'./request-guards':guards,
    './supabase/admin':{createAdminClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return{data:result,error:failure?{code:'fixture'}:null};}})}},
    {process:{env:{SUPABASE_SECRET_KEY:'sb_secret_fixture',CHECKOUT_SIGNING_SECRET:'fixture-only-private-signing',...environment}}});
  return{helper,calls};
}
test('untrusted forwarded headers cannot evade the global limiter or create fake per-IP buckets',async()=>{
  const {helper,calls}=limiter();
  const request=new Request('https://shop.example.com/api/reviews',{headers:{'x-forwarded-for':'203.0.113.1','x-vercel-forwarded-for':'203.0.113.2'}});
  assert.equal(helper.trustedClientIp(request),null);await helper.enforcePublicRateLimit(request,'reviews');
  assert.equal(calls.length,1);assert.equal(calls[0].args.p_bucket,'public:reviews:global');
});
test('Vercel IP limits use hashed keys and reject malformed proxy values',async()=>{
  const {helper,calls}=limiter({VERCEL:'1'});
  const request=new Request('https://shop.example.com/api/reviews',{headers:{'x-vercel-forwarded-for':'203.0.113.10'}});
  await helper.enforcePublicRateLimit(request,'reviews');assert.equal(calls.length,2);
  assert.match(calls[1].args.p_bucket,/^public:reviews:[a-f0-9]{64}$/);assert.equal(JSON.stringify(calls).includes('203.0.113.10'),false);
  for(const value of ['203.0.113.10, 198.51.100.1','invalid','javascript:evil'])assert.equal(helper.trustedClientIp(new Request(request,{headers:{'x-vercel-forwarded-for':value}})),null);
  assert.equal(helper.trustedClientIp(new Request(request,{headers:{'x-vercel-forwarded-for':'2001:0db8:0000:0:0:0:0:1'}})),'2001:db8::1');
});
test('rate limit denial has retry guidance, and unavailable or invalid responses fail closed',async()=>{
  const request=new Request('https://shop.example.com/api/orders');
  const denied=limiter({}, {allowed:false,retry_after_seconds:20});
  try{await denied.helper.enforcePublicRateLimit(request,'orders');assert.fail('Expected denial');}catch(error){assert.equal(error.status,429);assert.equal(denied.helper.rateLimitHeaders(error)['Retry-After'],'20');}
  for(const result of [null,{}, {allowed:true,retry_after_seconds:-1},{allowed:true,retry_after_seconds:100000}]){
    const fixture=limiter({},result);await assert.rejects(()=>fixture.helper.enforcePublicRateLimit(request,'orders'),error=>error.status===503);
  }
  const outage=limiter({},undefined,true);await assert.rejects(()=>outage.helper.enforcePublicRateLimit(request,'orders'),error=>error.status===503);
});

const rows={store_name:'Fixture Store',tagline:'Fixture',currency:'PKR',delivery_fee_minor:'20000',free_delivery_threshold_minor:'250000',serviceable_cities:'["Lahore"]',ordering_enabled:'true',cod_enabled:'true',bank_transfer_enabled:'true',wallet_enabled:'true'};
function settingsFixture(values=rows,failure=false){
  let saved;
  const client={from(){return{select:async()=>({data:Object.entries(values).map(([key,value])=>({key,value})),error:failure?Error('outage'):null}),upsert:async(data)=>{saved=data;return{error:null};}};}};
  const validation=load('lib/admin-validation.ts',{'./request-guards':guards});
  const service=load('lib/services/settings.ts',{'../supabase/public':{createPublicClient:()=>client},'../supabase/admin':{getScopedClient:async()=>client},'../admin-validation':validation});
  return{service,saved:()=>saved};
}
test('missing payment accounts stay blank and only configured methods become available',async()=>{
  const {service}=settingsFixture();const settings=await service.getSiteSettings();
  assert.equal(settings.bank_account_number,'');assert.equal(settings.bank_iban,'');assert.equal(settings.jazzcash_number,'');
  const publicSettings=await service.getCustomerStoreSettings();assert.deepEqual(Array.from(publicSettings.enabled_payment_methods),['COD']);assert.equal(publicSettings.receipt_upload_available,false);
  const paused=settingsFixture({...rows,ordering_enabled:'false'});assert.equal((await paused.service.getCustomerStoreSettings()).ordering_available,false);
});
test('missing, invalid or unavailable store configuration never substitutes invented fee or account data',async()=>{
  for(const input of [{...rows,delivery_fee_minor:'not-a-price'},{...rows,serviceable_cities:'broken'},{...rows,cod_enabled:'yes'},{...rows,currency:'USD'}]){
    await assert.rejects(()=>settingsFixture(input).service.getSiteSettings());
  }
  await assert.rejects(()=>settingsFixture({},true).service.getSiteSettings(),/unavailable/);
});
test('admin flags require booleans and valid settings save as one atomic upsert',async()=>{
  const {service,saved}=settingsFixture();
  await assert.rejects(()=>service.updateSiteSettings({ordering_enabled:'true'}),error=>error.status===400);
  await assert.rejects(()=>service.updateSiteSettings({delivery_fee_minor:20.5}),error=>error.status===400);
  await service.updateSiteSettings({ordering_enabled:false,delivery_fee_minor:20050});
  assert.equal(saved().length,2);assert.equal(saved()[0].value,'false');assert.equal(saved()[1].value,'20050');
});

test('CMS-managed branding writes are rejected atomically while legacy settings reads remain compatible',async()=>{
  const legacy={store_name:'Legacy store',tagline:'Legacy tagline',support_email:'legacy@example.com',whatsapp_number:'+923000000000'};
  const {service,saved}=settingsFixture({...rows,...legacy});
  const settings=await service.getSiteSettings();
  for(const [key,value] of Object.entries(legacy)){
    assert.equal(settings[key],value);
    await assert.rejects(()=>service.updateSiteSettings({delivery_fee_minor:21000,[key]:'Changed value'}),error=>error.status===400&&error.message.includes('/admin/content/site')&&error.message.includes('publish'));
    assert.equal(saved(),undefined);
  }
  await service.updateSiteSettings({delivery_fee_minor:21000,serviceable_cities:['Lahore','Karachi']});
  assert.equal(saved().length,2);assert.equal(saved()[0].value,'21000');
});

test('production Supabase configuration rejects missing, private or remote insecure client settings',()=>{
  const config=environment=>load('lib/supabase/config.ts',{}, {process:{env:environment}});
  assert.throws(()=>config({}).getSupabaseUrl(),/not configured/);
  assert.throws(()=>config({NEXT_PUBLIC_SUPABASE_URL:'http://remote.example.com'}).getSupabaseUrl(),/HTTPS/);
  assert.equal(config({NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co/'}).getSupabaseUrl(),'https://fixture.supabase.co');
  assert.throws(()=>config({NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_do_not_expose'}).getSupabaseKey(),/never a private/);
  assert.equal(config({NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture'}).getSupabaseKey(),'sb_publishable_fixture');
});

test('image URLs reject private storage endpoints, unsupported ports and script fragments',()=>{
  const validation=load('lib/admin-validation.ts',{'./request-guards':guards},{process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co'}}});
  for(const value of ['https://fixture.supabase.co/auth/v1/user','https://fixture.supabase.co/storage/v1/object/public/payment-receipts/receipt.pdf','https://images.unsplash.com:8443/a.jpg','https://images.unsplash.com/a.jpg#fragment','/images/a.jpg#fragment'])assert.throws(()=>validation.adminImageUrl(value));
  assert.equal(validation.adminImageUrl('https://fixture.supabase.co/storage/v1/object/public/product-images/a.jpg'),'https://fixture.supabase.co/storage/v1/object/public/product-images/a.jpg');
});

test('Vercel CRON_SECRET authenticates the deferred worker without enabling delivery',async()=>{
  let calls=0;const route=load('app/api/internal/email-delivery/route.ts',{'node:crypto':crypto,'next/server':{NextResponse:Response},'@/lib/email/outbox':{processOrderEmails:async()=>{calls++;return{configured:false};}}},{process:{env:{CRON_SECRET:'fixture-only-vercel-secret-longer-than-32-characters'}}});
  assert.equal((await route.GET(new Request('https://shop.example.com/api/internal/email-delivery',{headers:{Authorization:'Bearer fixture-only-vercel-secret-longer-than-32-characters'}}))).status,503);
  assert.equal(calls,1);assert.equal((await route.GET(new Request('https://shop.example.com/api/internal/email-delivery'))).status,401);assert.equal(calls,1);
});

test('a 50-pack quote batches catalog reads and preserves exact prices without loading reviews',async()=>{
  let reads=0, kitReads=0;
  const products=Array.from({length:50},(_,i)=>({id:'prod-'+i,name:'Pack '+i,status:'ACTIVE',sku:'SKU'+i,image_url:'/images/a.jpg'}));
  const variants=products.map((product,i)=>({id:'var-'+i,product_id:product.id,status:'ACTIVE',inventory_quantity:10,option_value:'250g',price_minor:1000,sku:'VAR'+i}));
  const client={from(table){reads++;return{select(){return this;},in(){return this;},eq(){return this;},then(resolve,reject){return Promise.resolve({data:table==='products'?products:variants,error:null}).then(resolve,reject);}};}};
  const validation=load('lib/checkout-validation.ts',{'./request-guards':guards});
  const service=load('lib/services/orders.ts',{'../request-guards':guards,'node:crypto':crypto,'../supabase/public':{createPublicClient:()=>client},'../supabase/admin':{},
    './settings':{getSiteSettings:async()=>({delivery_fee_minor:200,free_delivery_threshold_minor:5000})},'../order-reference':{},'./kits':{getKits:async()=>{kitReads++;return[];}},'../order-status':{},'../checkout-validation':validation,'../checkout-security':{}});
  const quote=await service.validateAndQuote(products.map((product,i)=>({product_id:product.id,variant_id:'var-'+i,quantity:1})));
  assert.equal(reads,2);assert.equal(kitReads,0);assert.equal(quote.items.length,50);assert.equal(quote.total_minor,50000);assert.equal(quote.shipping_minor,0);
  variants[49].product_id='prod-0';await assert.rejects(()=>service.validateAndQuote([{product_id:'prod-49',variant_id:'var-49',quantity:1}]),error=>error.status===400&&/selected pack/.test(error.message));
});

test('exact admin badge counts exceed the REST row cap without downloading customer details',async()=>{
  const selections=[],counts=[1501,2001,40,3001,8001];let queryIndex=0;
  const client={from(table){const index=queryIndex++;return{select(fields,options){selections.push({table,fields,options});return this;},neq(){return this;},eq(){return this;},or(){return this;},lte(){return this;},order(){return this;},limit(){return this;},then(resolve,reject){return Promise.resolve(index<5?{count:counts[index],error:null}:{data:[{created_at:'2026-10-01T10:00:00Z'}],error:null}).then(resolve,reject);}};}};
  const route=load('app/api/admin/counts/route.ts',{'next/server':{NextResponse:Response},'@/lib/auth/require-admin':{requireAdmin:async()=>{},AdminAuthError:class extends Error{}},'@/lib/supabase/admin':{getScopedClient:async()=>client},'@/lib/admin-utils':{getQueueAge:()=> 'fixture age'}});
  const response=await route.GET();assert.equal(response.status,200);const result=(await response.json()).data;
  assert.equal(result.totalOrdersCount,8001);assert.equal(result.pendingReceiptsCount,1501);assert.equal(result.stockAlertsCount,3001);
  assert.equal(selections.slice(0,5).every(selection=>selection.options.head===true&&selection.options.count==='exact'),true);
  assert.equal(selections.some(selection=>selection.fields==='*'),false);
});

test('quote rate limiting returns retry guidance before expensive catalog validation',async()=>{
  const {helper}=limiter({}, {allowed:false,retry_after_seconds:30});let quotes=0;
  const route=load('app/api/cart/quote/route.ts',{'next/server':{NextResponse:Response},'@/lib/public-rate-limit':{enforcePublicRateLimit:async()=>{throw new helper.RateLimitError(30);},rateLimitHeaders:helper.rateLimitHeaders},
    '@/lib/services/orders':{validateAndQuote:async()=>{quotes++;}},'@/lib/checkout-validation':load('lib/checkout-validation.ts',{'./request-guards':guards}),'@/lib/checkout-security':{},'@/lib/request-guards':guards});
  const response=await route.POST(new Request('https://shop.example.com/api/cart/quote',{method:'POST',headers:{origin:'https://shop.example.com'},body:JSON.stringify({items:[{product_id:'prod-a',variant_id:'var-a',quantity:1}]})}));
  assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'30');assert.equal(quotes,0);
});

test('production readiness diagnostics never print secret values and accept deferred email selection',async()=>{
  const {inspectProductionEnvironment}=await import('./production-readiness.mjs');
  const environment={NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',SUPABASE_SECRET_KEY:'sb_secret_this_value_is_private',CHECKOUT_SIGNING_SECRET:'fixture-only-private-signing-secret-with-32-characters',ORDER_REFERENCE_MODE:'sequential'};
  const report=inspectProductionEnvironment(environment,true);assert.equal(report.configurationReady,true);assert.equal(report.checks.some(check=>check.status==='DEFERRED'),true);
  assert.equal(inspectProductionEnvironment({...environment,NEXT_PUBLIC_SITE_URL:'http://obsolete.invalid/unused-path'},true).configurationReady,true);
  assert.equal(report.manualGates.some(gate=>gate.includes('site.config.url')),true);
  const output=JSON.stringify(report);assert.equal(output.includes(environment.SUPABASE_SECRET_KEY),false);assert.equal(output.includes(environment.CHECKOUT_SIGNING_SECRET),false);
  const bad=inspectProductionEnvironment({...environment,NEXT_PUBLIC_ACCIDENTAL:environment.SUPABASE_SECRET_KEY},true);assert.equal(bad.configurationReady,false);assert.equal(JSON.stringify(bad).includes(environment.SUPABASE_SECRET_KEY),false);
});


test('preflight verifies the actual published CMS HTTPS origin with a bounded public-only read',async()=>{
  const {inspectPublishedCmsOrigin}=await import('./production-readiness.mjs');
  const environment={NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',SUPABASE_SECRET_KEY:'sb_secret_private_never_used'};
  let calls=0;
  const fixture=(origin,error=null)=> (url,key,options)=>{
    assert.equal(url,environment.NEXT_PUBLIC_SUPABASE_URL);assert.equal(key,environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    assert.equal(options.db.retry,false);assert.equal(options.auth.persistSession,false);assert.equal(options.auth.autoRefreshToken,false);
    assert.equal(typeof options.global.fetch,'function');assert.match(String(options.global.fetch),/15000/);
    return {rpc:async name=>{calls++;assert.equal(name,'get_site_content_snapshot');return {data:{documents:{site:{content:{config:{url:origin},privateFixture:'must-not-be-printed'}}}},error};}};
  };
  const pass=await inspectPublishedCmsOrigin(environment,true,fixture('https://shop.example.com'));
  assert.equal(pass.status,'PASS');assert.equal(JSON.stringify(pass).includes('must-not-be-printed'),false);
  for(const origin of [undefined,'http://shop.example.com','https://shop.example.com/path','https://shop.example.com?query=x','https://user:pass@shop.example.com','https://localhost']){
    assert.equal((await inspectPublishedCmsOrigin(environment,true,fixture(origin))).status,'FAIL');
  }
  assert.equal((await inspectPublishedCmsOrigin(environment,true,fixture('https://shop.example.com',Error('private error')))).status,'FAIL');
  const previous=calls;
  const invalid=await inspectPublishedCmsOrigin({...environment,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:environment.SUPABASE_SECRET_KEY},true,fixture('https://shop.example.com'));
  assert.equal(invalid.status,'FAIL');assert.equal(calls,previous);assert.equal(JSON.stringify(invalid).includes(environment.SUPABASE_SECRET_KEY),false);
  const unavailable=await inspectPublishedCmsOrigin(environment,true,()=>{throw Error('must-not-be-printed');});
  assert.equal(unavailable.status,'FAIL');assert.equal(JSON.stringify(unavailable).includes('must-not-be-printed'),false);
});
