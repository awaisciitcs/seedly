const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps={}){
 const filename=path.join(__dirname,'..',file),module={exports:{}};
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInNewContext(output,{module,exports:module.exports,Date,Buffer,URL,Request,Response,TextDecoder,Uint8Array,AbortSignal,console:{error(){},log(){}},process:{env:{SUPABASE_SECRET_KEY:'fixture-only'}},require(name){if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);}},{filename});return module.exports;
}
const guards=load('lib/request-guards.ts'),fields=load('lib/checkout-fields.ts'),delivery=load('lib/delivery.ts');
const valid={customer_name:'Example Customer',customer_email:'EXAMPLE@example.test',customer_phone:'0300 1234567',shipping_address:'42 Example Street',shipping_city:'Lahore',shipping_province:'Punjab',shipping_postal_code:'',shipping_notes:''};
function orderRoute(){let writes=0,received;const route=load('app/api/orders/route.ts',{'next/server':{NextResponse:Response},'../../../lib/services/orders':{createOrder:async body=>{writes++;received=body;return {order:{id:'fixture-order',order_number:'SED-999999',total_minor:1200,order_status:'RECEIVED',payment_status:'PENDING'},trackingToken:'a'.repeat(64),isIdempotentReplay:false};}},'@/lib/checkout-fields':fields,'@/lib/delivery':delivery,'@/lib/checkout-validation':load('lib/checkout-validation.ts',{'./request-guards':guards}),'@/lib/request-guards':guards,'@/lib/public-rate-limit':{enforcePublicRateLimit:async()=>{},rateLimitHeaders:()=>({'Cache-Control':'no-store'})},'@/lib/email/schedule':{scheduleOrderEmails(){}},'@/lib/services/leads':{saveBusinessLead:async()=>null},'@/lib/tracking/validation':{cleanJourney:()=>({analytics_consent:false})},'@/lib/coupons':{couponCode:value=>value||''}});return {route,writes:()=>writes,received:()=>received};}
const submit=(route,body)=>route.POST(new Request('https://shop.example.test/api/orders',{method:'POST',headers:{origin:'https://shop.example.test','content-type':'application/json'},body:JSON.stringify({...body,items:[{product_id:'product-a',variant_id:'pack-a',quantity:1}],payment_method:'COD',idempotency_key:'fixture-checkout-identity-123'})}));
test('checkout rejects missing regions, invalid customer field types, control characters and oversized fields before creating an order',async()=>{
 const fixture=orderRoute();
 for(const change of [{shipping_province:undefined},{shipping_province:'Unsupported Region'},{shipping_city:'A'},{customer_name:'x'.repeat(101)},{customer_email:'a'.repeat(245)+'@example.test'},{shipping_address:'A'.repeat(501)},{shipping_notes:'x'.repeat(1001)},{shipping_postal_code:'x'.repeat(21)},{customer_name:'Name\nInjected'},{shipping_city:{}},{shipping_notes:null}]){
  const response=await submit(fixture.route,{...valid,...change});assert.equal(response.status,400,JSON.stringify(change));
 }
 assert.equal(fixture.writes(),0);
});
test('checkout accepts valid custom cities and preserves complete notes without silently truncating delivery fields',async()=>{
 const fixture=orderRoute(),notes='Please call on arrival.\nSecond entrance.';
 const response=await submit(fixture.route,{...valid,shipping_city:'New Service Town',shipping_notes:notes});assert.equal(response.status,200);assert.equal(fixture.writes(),1);assert.equal(fixture.received().customer_email,'example@example.test');assert.equal(fixture.received().customer_phone,'03001234567');assert.equal(fixture.received().shipping_notes,notes);assert.equal(fixture.received().shipping_city,'New Service Town');
});
test('correcting shared checkout field errors clears only the corrected error',()=>{
 const draft={...valid,customer_name:'A',shipping_city:'A',shipping_province:''};assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,3);
 draft.customer_name='Example Customer';assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,2);
 draft.shipping_city='Lahore';draft.shipping_province='Punjab';assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,0);
});
const metrics=load('lib/admin-metrics.ts');const now=Date.parse('2026-10-22T06:00:00Z');
const order=(id,created_at,order_status='PAID',total_minor=10000,payment_method='bank_transfer',payment_status='VERIFIED')=>({id,created_at,order_status,total_minor,payment_method,payment_status});
test('dashboard date ranges use Pakistan midnight and exclude future or malformed timestamps',()=>{
 const all=[order('before','2026-10-21T18:59:59Z'),order('midnight','2026-10-21T19:00:00Z'),order('current','2026-10-22T05:59:59Z'),order('future','2026-10-22T06:01:00Z'),order('invalid','broken')];
 assert.equal(metrics.dashboardMetrics(all,'today',now).current.orderCount,2);assert.equal(metrics.dashboardPeriodStart('today',now),Date.parse('2026-10-21T19:00:00Z'));
 assert.equal(metrics.dashboardMetrics(all,'7d',now).current.orderCount,3);assert.equal(metrics.dashboardMetrics(all,'all',now).previous,null);
});
test('dashboard confirmed value and average use the same eligible orders and exclude refunds and unverified prepayments',()=>{
 const all=[order('paid','2026-10-22T01:00:00Z','PAID',10000),order('cod','2026-10-22T01:00:00Z','PROCESSING',30000,'COD','PENDING'),order('refund','2026-10-22T01:00:00Z','REFUNDED',90000),order('pending','2026-10-22T01:00:00Z','RECEIVED',100000),order('unverified','2026-10-22T01:00:00Z','PACKED',200000,'bank_transfer','UNDER_REVIEW'),order('shipped','2026-10-22T01:00:00Z','SHIPPED',20000)];
 const result=metrics.dashboardMetrics(all,'today',now).current;assert.equal(result.orderCount,6);assert.equal(result.confirmedCount,3);assert.equal(result.valueMinor,60000);assert.equal(result.averageMinor,20000);assert.equal(result.dispatchedCount,1);
 assert.equal(metrics.metricComparison(100,0),'No previous-period value');assert.equal(metrics.metricComparison(100,50),'+100.0% vs previous period');assert.equal(metrics.metricComparison(100,undefined),'All available history');
});
function ordersService(client){return load('lib/services/orders.ts',{'../request-guards':guards,'node:crypto':require('node:crypto'),'../supabase/public':{},'../supabase/admin':{getScopedClient:async()=>client},'./settings':{},'../order-reference':{},'./kits':{},'../order-status':{},'../checkout-validation':{},'../checkout-security':{},'./coupons':{},'../coupons':{}});}
test('admin history and customer reports retain orders beyond the API row cap with deterministic paged reads',async()=>{
 const rows=Array.from({length:1205},(_,i)=>({id:'order-'+i,order_number:'SED-'+(100200+i),order_items:[]})),ranges=[],sort=[];
 const query={select(){return this;},order(column){sort.push(column);return this;},range(from,to){ranges.push([from,to]);return Promise.resolve({data:rows.slice(from,to+1),error:null});}};
 const service=ordersService({from:()=>query}),all=await service.getOrders();assert.equal(all.length,1205);assert.equal(all[1204].id,'order-1204');assert.deepEqual(ranges,[[0,499],[500,999],[1000,1499]]);assert.deepEqual(sort,['created_at','id']);
 ranges.length=0;assert.equal((await service.getOrders({limit:550})).length,550);assert.deepEqual(ranges,[[0,499],[500,549]]);
});
test('order history does not return a partial success when a later page fails',async()=>{
 const query={select(){return this;},order(){return this;},range(from){return Promise.resolve(from?{data:null,error:{message:'database detail'}}:{data:Array.from({length:500},(_,id)=>({id})),error:null});}};
 await assert.rejects(()=>ordersService({from:()=>query}).getOrders(),/temporarily unavailable/);
});
test('admin catalog reads preserve inactive and archived owned packs when review loading is disabled',async()=>{
 const row={id:'product-a',status:'ACTIVE',name:'Fixture',product_variants:[{id:'active',status:'ACTIVE',weight_grams:100},{id:'inactive',status:'INACTIVE',weight_grams:250},{id:'archived',status:'ARCHIVED',weight_grams:500}]};let scoped=0;
 const query={select(){return this;},eq(){return this;},order(){return this;},then(resolve){return Promise.resolve({data:[row],error:null}).then(resolve);}};
 const service=load('lib/services/products.ts',{'../supabase/admin':{getScopedClient:async()=>{scoped++;return{from:()=>query};}},'../supabase/public':{createPublicClient:()=>({from:()=>query})},'../catalog':{normalizeSearch:()=>''}});
 const admin=await service.getProducts({status:'',includeReviews:false});assert.equal(admin[0].variants.length,3);assert.equal(scoped,1);
 const publicRows=await service.getProducts({includeReviews:false});assert.equal(publicRows[0].variants.length,1);assert.equal(publicRows[0].variants[0].id,'active');
});

test('real customers are not hidden because of a specific name or a test substring',()=>{
 const {isTestOrder}=load('lib/admin-utils.ts');
 for(const customer of [{customer_name:'Maryam Nawaz',customer_email:'maryam.customer@seedlymail.pk'},{customer_name:'Latest Customer',customer_email:'contestwinner@seedlymail.pk'}])assert.equal(isTestOrder(customer),false);
 for(const customer of [{customer_name:'Test Customer'},{customer_email:'fixture@example.test'},{customer_email:'qa+test@seedlymail.pk'},{order_number:'SED-TEST-123'}])assert.equal(isTestOrder(customer),true);
});

test('storefront payment announcements never advertise COD when checkout only accepts transfers',()=>{
 const {paymentAvailabilityLabel}=load('lib/payment-availability.ts');
 assert.equal(paymentAvailabilityLabel(null,'Cash on delivery available'),'');
 assert.equal(paymentAvailabilityLabel({ordering_available:true,enabled_payment_methods:['bank_transfer']},'Cash on delivery available'),'Bank transfer available');
 assert.equal(paymentAvailabilityLabel({ordering_available:false,enabled_payment_methods:['COD']},'Cash on delivery available'),'Ordering temporarily paused');
 assert.equal(paymentAvailabilityLabel({ordering_available:true,enabled_payment_methods:['COD']},'Cash on delivery available'),'Cash on delivery available');
});
