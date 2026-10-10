const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ts=require('typescript');
function load(file,deps={},env={SUPABASE_SECRET_KEY:'unit-test-only-private-secret-do-not-use'}){
 const filename=path.join(__dirname,'..',file);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,Buffer,URL,Request,Response,TextDecoder,Uint8Array,Date,console:{error(){},log(){}},process:{env},require(name){if(name in deps)return deps[name];if(name==='@/lib/public-rate-limit')return {enforcePublicRateLimit:async()=>{},rateLimitHeaders:()=>({})};if(name==='./fetch')return {boundedSupabaseFetch:()=>{}};throw Error('Unexpected dependency '+name);}},{filename});
 return module.exports;
}
const guards=load('lib/request-guards.ts');
const validation=load('lib/checkout-validation.ts',{'./request-guards':guards});
const attempts=load('lib/checkout-attempt.ts',{'./checkout-validation':validation});
const state=load('lib/cart-state.ts');
const wishlist=load('lib/wishlist-state.ts');
const csv=load('lib/csv.ts');
const policy=load('lib/order-status.ts');
const structured=load('lib/structured-data.ts');
const adminValidation=load('lib/admin-validation.ts',{'./request-guards':guards});
const line={product_id:'prod-a',variant_id:'var-a',quantity:2};
function storage() { const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}; }
const original={signature:'frozen-identity',key:'checkout-test-key-123456',submitted:{idempotency_key:'checkout-test-key-123456',quote_token:'signed-original-quote',customer_name:'Fixture Customer',customer_email:'fixture@example.com',customer_phone:'03001234567',shipping_address:'12 Fixture Street',shipping_city:'Lahore',shipping_province:'Punjab',payment_method:'COD',items:[line]}};
test('uncertain checkout survives refresh with frozen key, customer fields and original basket',()=>{
 const store=storage();assert.equal(attempts.savePendingCheckout(store,original),true);
 const restored=attempts.readPendingCheckout(store);assert.equal(restored.key,original.key);assert.equal(JSON.stringify(restored.submitted),JSON.stringify(original.submitted));
 attempts.clearPendingCheckout(store);assert.equal(attempts.readPendingCheckout(store),null);
});
test('malformed or inaccessible session storage cannot restore a dangerous checkout attempt',()=>{
 const store=storage();for(const value of [null,{}, {...original,key:'wrong'}, {...original,submitted:{...original.submitted,items:[{...line,quantity:-2}]}},{...original,submitted:{...original.submitted,payment_method:'card'}}]){
 store.setItem(attempts.PENDING_CHECKOUT_KEY,JSON.stringify(value));assert.equal(attempts.readPendingCheckout(store),null);}
 assert.equal(attempts.readPendingCheckout({getItem(){throw Error('blocked');}}),null);
 assert.equal(attempts.savePendingCheckout({setItem(){throw Error('quota');}},original),false);
});
test('recovering an order subtracts purchased packs and preserves other or added quantities',()=>{
 const items=[{...line,id:'a',quantity:5},{product_id:'prod-b',variant_id:'var-b',id:'b',quantity:1}];
 const rest=state.removeOrderedItems(items,[line]);assert.equal(rest.length,2);assert.equal(rest[0].quantity,3);assert.equal(rest[1].quantity,1);
 assert.equal(state.removeOrderedItems([{...items[0],quantity:2}],[line]).length,0);
});
test('wishlist local storage rejects invalid identifiers, deduplicates and enforces a cap',()=>{
 assert.equal(wishlist.restoreWishlist({}).length,0);
 assert.equal(JSON.stringify(wishlist.restoreWishlist(['prod-a','prod-a',null,42,'a,or(secret)'])),JSON.stringify(['prod-a']));
 assert.equal(wishlist.restoreWishlist(Array.from({length:150},(_,i)=>'prod-'+i)).length,100);
});
test('structured data escapes script terminators while retaining valid JSON',()=>{
 const input={name:'</script><script>alert(1)</script>',notes:'line\u2028break\u2029'};
 const output=structured.serializeStructuredData(input);
 assert.equal(output.includes('<'),false);assert.equal(JSON.stringify(JSON.parse(output)),JSON.stringify(input));
});
test('CSV escapes quotes and line breaks and prevents spreadsheet formula evaluation',()=>{
 assert.equal(csv.csvCell('A"B'),'"A""B"');
 for(const text of ['=1+1',' +923001234567','-1+1','@SUM(1,2)','\t=1+1','\r=2'])assert.ok(csv.csvCell(text).startsWith('"\''));
 const document=csv.csvDocument([['Name','Phone'],['A,B','+923001234567']]);assert.ok(document.startsWith('\uFEFF'));assert.ok(document.includes('\r\n'));assert.ok(document.includes('"A,B"'));
});
test('fulfillment follows explicit forward steps; terminal orders cannot re-enter processing',()=>{
 const cod={payment_method:'COD',payment_status:'PENDING',order_status:'RECEIVED'};
 assert.equal(JSON.stringify(policy.getAllowedOrderStatuses(cod)),JSON.stringify(['PROCESSING','CANCELLED']));
 assert.throws(()=>policy.assertOrderStatusUpdate(cod,'PACKED'),/unavailable/);
 for(const order_status of ['CANCELLED','REFUNDED','SHIPPED','DELIVERED'])assert.throws(()=>policy.assertOrderStatusUpdate({...cod,order_status},'PROCESSING'),/unavailable/);
 assert.throws(()=>policy.assertOrderStatusUpdate({...cod,payment_method:'bank_transfer',payment_status:'UNDER_REVIEW',order_status:'PAYMENT_REVIEW'},'PROCESSING'),/Verify/);
});
test('admin input rejects invalid prices, blank numeric fields, duplicate packs and image schemes',()=>{
 for(const input of [NaN,Infinity,'',null,{},-1,1.1])assert.throws(()=>adminValidation.adminNumber(input,'stock'));
 for(const input of ['javascript:alert(1)','data:image/svg+xml,evil','//other.example/a.jpg','https://user:pass@example.com/a.jpg','https://unsupported.example/a.jpg'])assert.throws(()=>adminValidation.adminImageUrl(input));
 assert.equal(adminValidation.adminImageUrl('/images/pumpkin.jpg'),'/images/pumpkin.jpg');
 const variant={weight_grams:250,price_pkr:950,inventory_quantity:0,status:'ACTIVE'};
 assert.throws(()=>adminValidation.validateCatalogBody({id:'prod-a',variants:[variant,variant]},'product',false),/unique/);
 assert.equal(adminValidation.validateCatalogBody({id:'prod-a',variants:[variant]},'product',false).variants[0].inventory_quantity,0);
});
function authFixture({user=true,linked=true,active=true,role='OWNER',failure=false}={}) {
 const client={auth:{async getUser(){return {data:{user:user?{id:'auth-fixture',email:'fixture@example.com'}:null},error:failure?Error('auth failure'):null};}},from(){return {select(){return this;},eq(name,value){assert.ok(['auth_user_id','is_active'].includes(name),'Email auto-linking is forbidden');return this;},async single(){return {data:linked&&active?{id:'admin-fixture',auth_user_id:'auth-fixture',role,is_active:active}:null,error:null};}};}};
 return load('lib/auth/require-admin.ts',{'server-only':{},'next/navigation':{redirect(){throw Error('redirect');}},'../supabase/server':{createClient:async()=>client}});
}
test('administrator authorization requires verified Auth lookup and explicit active role link',async()=>{
 for(const input of [{user:false},{linked:false},{active:false},{role:'CUSTOMER'},{failure:true}])await assert.rejects(()=>authFixture(input).requireAdmin(),/required|denied/);
 await assert.rejects(()=>authFixture({role:'STAFF'}).requireAdmin('OWNER'),/Owner/);
 assert.equal((await authFixture().requireAdmin('OWNER')).admin.role,'OWNER');
});
test('review API enforces integer ratings and same-origin; user cannot forge verified purchase',async()=>{
 let submitted;const api=load('app/api/reviews/route.ts',{'next/server':{NextResponse:Response},'@/lib/request-guards':guards,'@/lib/services/reviews':{getApprovedReviews:async()=>[],createReview:async data=>{submitted=data;return data;}}});
 const body={product_id:'prod-a',customer_name:'Fixture Customer',body:'This is a sufficiently detailed review.',rating:4,verified_purchase:true};
 const make=(data,origin='https://seedly.pk')=>new Request('https://seedly.pk/api/reviews',{method:'POST',headers:{origin},body:JSON.stringify(data)});
 assert.equal((await api.POST(make(body,'https://attacker.example'))).status,403);
 for(const rating of [0,6,4.5,'5'])assert.equal((await api.POST(make({...body,rating}))).status,400);
 assert.equal((await api.POST(make(body))).status,201);assert.equal(submitted.verified_purchase,false);
 assert.equal((await api.GET(new Request('https://seedly.pk/api/reviews?productId=x,or(secret)'))).status,400);
});
test('pending review insert does not request a forbidden public SELECT and uses catalog name',async()=>{
 let inserted;const client={from(table){return table==='reviews'?{async insert(rows){inserted=rows[0];return {error:null};}}:{select(){return this;},eq(){return this;},async single(){return {data:{id:'prod-a',name:'Authoritative catalog title',status:'ACTIVE'},error:null};}};}};
 const service=load('lib/services/reviews.ts',{'node:crypto':crypto,'../request-guards':guards,'../supabase/public':{createPublicClient:()=>client},'../supabase/admin':{getScopedClient:async()=>client,createAdminClient:()=>client}});
 const review=await service.createReview({product_id:'prod-a',product_name:'forged title',customer_name:'Fixture',rating:5,title:'Good',body:'A detailed fixture review.',verified_purchase:true});
 assert.equal(inserted.status,'PENDING');assert.equal(inserted.verified_purchase,false);assert.equal(review.product_name,'Authoritative catalog title');
});

test('privileged clients fail closed; admin operations retain cookie RLS even with a server key',async()=>{
 let elevated=0;const cookieClient={marker:'cookie-session'};
 const deps={'server-only':{},'@supabase/supabase-js':{createClient(){elevated++;return {marker:'server'};}},'./config':{getSupabaseUrl:()=> 'https://fixture.supabase.co'},'./server':{createClient:async()=>cookieClient}};
 for(const env of [{},{SUPABASE_SECRET_KEY:'public-key'}])assert.throws(()=>load('lib/supabase/admin.ts',deps,env).createAdminClient(),/private|service-role/);
 const service=load('lib/supabase/admin.ts',deps,{SUPABASE_SECRET_KEY:'sb_secret_unit_test'});
 assert.equal(await service.getScopedClient(),cookieClient);assert.equal(elevated,0);
 service.createAdminClient();assert.equal(elevated,1);
});
test('unsubscription GET confirms intent without changing preferences; POST is same-origin',async()=>{
 let updates=0;const api=load('app/api/stock-alerts/unsubscribe/route.ts',{'next/server':{NextResponse:Response},'@/lib/request-guards':guards,'@/lib/services/stockAlerts':{unsubscribeFromStockAlert:async()=>{updates++;return true;}}});
 const url='https://seedly.pk/api/stock-alerts/unsubscribe?token=unsubscribe-fixture-token-1234';
 assert.equal((await api.GET(new Request(url))).status,200);assert.equal(updates,0);
 const request=(origin)=>new Request('https://seedly.pk/api/stock-alerts/unsubscribe',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({token:'unsubscribe-fixture-token-1234'})});
 assert.equal((await api.POST(request('https://attacker.example'))).status,403);assert.equal(updates,0);
 assert.equal((await api.POST(request('https://seedly.pk'))).status,200);assert.equal(updates,1);
});
