const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ts=require('typescript');
function load(file,deps={}){
 const filename=path.join(__dirname,'..',file);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,Buffer,URL,Request,Response,TextDecoder,Uint8Array,Date,console:{error(){},log(){}},process:{env:{SUPABASE_SECRET_KEY:'unit-test-only-private-secret-do-not-use'}},require(name){if(name in deps)return deps[name];if(name==='@/lib/public-rate-limit')return {enforcePublicRateLimit:async()=>{},rateLimitHeaders:()=>({})};if(name==='./fetch')return {boundedSupabaseFetch:()=>{}};throw Error('Unexpected dependency '+name);}},{filename});
 return module.exports;
}
const guards=load('lib/request-guards.ts');
const validation=load('lib/checkout-validation.ts',{'./request-guards':guards});
const catalog=load('lib/catalog.ts');
const state=load('lib/cart-state.ts');
const policy=load('lib/order-status.ts');
const security=load('lib/checkout-security.ts',{'server-only':{},'node:crypto':crypto,'./checkout-validation':validation,'./request-guards':guards});
const line={product_id:'prod-a',variant_id:'pack-a',quantity:1};
const cart={...line,id:'legacy-quiz-id',name:'Pumpkin',slug:'pumpkin-seeds',image_url:'/pumpkin.jpg',price_minor:1000,product_type:'seed',max_quantity:2};
test('checkout rejects malformed identifiers, fractions, missing packs and duplicate lines',()=>{
 for(const input of [[],[null],[{...line,quantity:1.2}],[{...line,quantity:0}],[{...line,quantity:100}],[{...line,quantity:'1'}],[{...line,variant_id:undefined}],[{...line,product_id:'x,or(secret)'}],[line,line],[{...line,kit_id:'other'}],[{...line,kit_id:line.product_id}]]){
 assert.throws(()=>validation.parseCheckoutLines(input));}
 assert.equal(validation.parseCheckoutLines([line])[0].variant_id,'pack-a');
 assert.equal(validation.parseCheckoutLines([{product_id:'kit-a',kit_id:'kit-a',quantity:1}])[0].kit_id,'kit-a');
});
test('basket identity and stock caps work across every entry point',()=>{
 const first=state.addCartItem([],cart);assert.equal(first.items[0].id,'prod-a-pack-a');assert.equal(first.added,true);
 const partial=state.addCartItem(first.items,{...cart,quantity:3});assert.equal(partial.items[0].quantity,2);assert.match(partial.message,/Added 1/);
 const capped=state.addCartItem(partial.items,cart);assert.equal(capped.added,false);assert.equal(capped.items[0].quantity,2);
 for(const max_quantity of [0,NaN])assert.equal(state.addCartItem([],{...cart,max_quantity}).added,false);
 assert.equal(state.addCartItem([],{...cart,price_minor:NaN}).added,false);
});
test('restoring old baskets merges canonical pack identities and rejects corrupt values',()=>{
 const restored=state.restoreCart([{...cart,id:'one'},{...cart,id:'two'},{...cart,quantity:-1},{...cart,price_minor:'1000'}]);assert.equal(restored.length,1);assert.equal(restored[0].id,'prod-a-pack-a');assert.equal(restored[0].quantity,2);
 assert.equal(state.restoreCart('not an array').length,0);
});
test('default price and stock refer to the same ACTIVE pack',()=>{
 const product={...cart,weight_grams:250,variants:[{id:'bad',status:'INACTIVE',weight_grams:250,price_minor:1,inventory_quantity:99},{id:'small',status:'ACTIVE',weight_grams:100,price_minor:400,inventory_quantity:5},{id:'default',status:'ACTIVE',weight_grams:250,price_minor:900,inventory_quantity:0}]};
 assert.equal(catalog.getCatalogPrice(product),900);assert.equal(catalog.getCatalogStock(product),0);assert.equal(catalog.hasAvailablePack(product),true);
 assert.equal(catalog.toCartItem(product).variant_id,'default');
 assert.equal(catalog.normalizeSearch(' pumpkin,()_ %. '),'pumpkin');
});
test('same-origin guards reject cross-site requests but allow storefront clients',()=>{
 assert.throws(()=>guards.requireSameOrigin(new Request('https://seedly.pk/api/orders',{headers:{origin:'https://other.example'}})),/Seedly website/);
 guards.requireSameOrigin(new Request('https://seedly.pk/api/orders',{headers:{origin:'https://seedly.pk','sec-fetch-site':'same-origin'}}));
 guards.requireSameOrigin(new Request('http://localhost:3107/api/orders',{headers:{host:'127.0.0.1:3107',origin:'http://127.0.0.1:3107'}}));
 assert.throws(()=>guards.requireSameOrigin(new Request('http://localhost:3107/api/orders',{headers:{host:'seedly.pk',origin:'https://other.example'}})),/Seedly website/);
});
test('JSON and chunked upload bodies have enforced limits',async()=>{
 await assert.rejects(()=>guards.readJson(new Request('https://seedly.pk',{method:'POST',body:'[]'})),/Invalid request/);
 await assert.rejects(()=>guards.readBody(new Request('https://seedly.pk',{method:'POST',body:'x'.repeat(51)}),50),/too large/);
 const result=await guards.readJson(new Request('https://seedly.pk',{method:'POST',body:'{"items":[]}'}));assert.equal(result.items.length,0);
});
const quoted={total_minor:1200,shipping_minor:200,items:[{unit_price_minor:1000}]};
test('signed quote binds pack, quantity, prices and expiry; tampering is rejected',()=>{
 const token=security.createQuoteToken([line],quoted).token;
 security.verifyQuoteToken(token,[line],quoted);
 assert.throws(()=>security.verifyQuoteToken(token,[{...line,quantity:2}],quoted),/basket changed/);
 assert.throws(()=>security.verifyQuoteToken(token,[line],{...quoted,total_minor:1201}),/Prices/);
 assert.throws(()=>security.readCheckoutValue(token+'x'),/refresh/);
 const expired=security.signCheckoutValue({purpose:'quote',expires:Date.now()-100});assert.throws(()=>security.readCheckoutValue(expired),/expired/);
});
test('receipt proof is scoped to checkout and storage object',()=>{
 const proof=security.signCheckoutValue({purpose:'receipt',key:'checkout-a',path:'a.pdf',expires:Date.now()+1000});
 security.verifyReceiptProof(proof,'checkout-a','a.pdf');
 assert.throws(()=>security.verifyReceiptProof(proof,'checkout-b','a.pdf'),/upload/);
 assert.throws(()=>security.verifyReceiptProof(proof,'checkout-a','b.pdf'),/upload/);
 assert.notEqual(security.createTrackingToken('a','b'),security.createTrackingToken('a','c'));
});
test('unverified historical prepaid orders cannot display packed or dispatched',()=>{
 for(const status of ['PROCESSING','PACKED','SHIPPED','DELIVERED']) {
 const order={order_status:status,payment_status:'UNDER_REVIEW',payment_method:'bank_transfer'};
 assert.equal(policy.getOrderProgress(order).packed,false);assert.equal(policy.getOrderProgress(order).shipped,false);
 assert.throws(()=>policy.assertOrderStatusUpdate(order,status),/Verify/);
 }
 assert.equal(policy.getOrderProgress({order_status:'PACKED',payment_status:'PENDING',payment_method:'COD'}).packed,true);
 for(const status of ['CANCELLED','REFUNDED'])assert.equal(policy.getOrderProgress({order_status:status,payment_status:'VERIFIED',payment_method:'bank_transfer'}).packed,false);
});
function orderFixture(sequential=false){
 let stock=2;let orderingEnabled=true;let enabledMethods=['COD','bank_transfer','wallet_aggregator'];let record=null;let calls=0;let rpcFailure=null;let sequentialMode=sequential;let assigned=null;let assignments=0;let notifications=0;let emailFailure=false;
 const products={id:'prod-a',status:'ACTIVE',name:'Pumpkin',sku:'A',price_minor:1000,image_url:'/pumpkin.jpg'};
 const variants={id:'pack-a',product_id:'prod-a',status:'ACTIVE',inventory_quantity:stock,option_value:'250g',sku:'A250',price_minor:1000};
 function from(table){const filters={};return{select(){return this;},eq(k,v){filters[k]=v;return this;},in(k,v){filters[k]=v;return this;},then(resolve,reject){const value=table==='products'?products:{...variants,inventory_quantity:stock};const data=Object.entries(filters).every(([k,v])=>Array.isArray(v)?v.includes(value[k]):v===value[k])?[value]:[];return Promise.resolve({data,error:null}).then(resolve,reject);},async maybeSingle(){return{data:record&&record.idempotency_key===filters.idempotency_key?record:null,error:null};},async single(){return{data:table==='products'?(filters.id===products.id?products:null):filters.id===variants.id&&filters.product_id===variants.product_id?{...variants,inventory_quantity:stock}:null,error:null};}};}
 const publicClient={from,async rpc(name,args){if(!record||record.order_number!==args.p_order_number)return{data:null,error:null};const valid=crypto.createHash('sha256').update(args.p_token||'').digest('hex')===record.tracking_token_hash;return{data:{order:record,items:[],is_authorized:valid},error:null};}};
 const adminClient={from,async rpc(name,args){if(name==='lookup_order_with_capability')return publicClient.rpc(name,args);calls++;if(rpcFailure)return{data:null,error:rpcFailure};record={id:args.p_order_id,order_number:args.p_order_number,idempotency_key:args.p_idempotency_key,request_fingerprint:args.p_request_fingerprint,tracking_token_hash:args.p_tracking_token_hash,customer_name:args.p_customer_name,customer_email:args.p_customer_email,customer_phone:args.p_customer_phone,shipping_address:args.p_shipping_address,shipping_city:args.p_shipping_city,shipping_province:args.p_shipping_province,payment_method:args.p_payment_method,payment_status:'PENDING',order_status:'RECEIVED',total_minor:1200,subtotal_minor:1000,shipping_minor:200,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};return{data:{order_number:record.order_number,is_idempotent_replay:false},error:null};}};
 const service=load('lib/services/orders.ts',{'node:crypto':crypto,'../request-guards':guards,'../supabase/public':{createPublicClient:()=>publicClient},'../supabase/admin':{createAdminClient:()=>adminClient,getScopedClient:async()=>adminClient},'../utils':{generateOrderNumber:()=> 'SED-TEST-123'},'./settings':{getSiteSettings:async()=>({delivery_fee_minor:200,free_delivery_threshold_minor:5000,ordering_enabled:orderingEnabled}),enabledPaymentMethods:()=>enabledMethods},'./notifications':{dispatchNotification(){notifications++;if(emailFailure)throw Error('Email unavailable');}},'./kits':{getKits:async()=>[]},'../order-status':policy,'../checkout-validation':validation,'../checkout-security':security,'../order-reference':{sequentialOrderReferencesEnabled:()=>sequentialMode,findCheckoutOrderReference:async(key,fingerprint)=>{if(assigned&&assigned.fingerprint!==fingerprint)throw new guards.RequestError('This checkout attempt has changed.',409);return assigned?.number||null;},allocateCheckoutOrderReference:async(key,fingerprint)=>{if(!assigned){assigned={number:'SED-100200',fingerprint};assignments++;}return assigned.number;}} });
 const input={customer_name:'Test Customer',customer_email:'test@example.com',customer_phone:'03001234567',shipping_address:'12 Test Street',shipping_city:'Lahore',shipping_province:'Punjab',payment_method:'COD',idempotency_key:'unit-test-checkout-key-1234',items:[line],quote_token:security.createQuoteToken([line],quoted).token};
 return{service,input,calls:()=>calls,assignments:()=>assignments,notifications:()=>notifications,setEmailFailure:value=>emailFailure=value,setMode:value=>sequentialMode=value,setOrderingEnabled:value=>orderingEnabled=value,setEnabledMethods:value=>enabledMethods=value,setStock:value=>stock=value,setFailure:value=>rpcFailure=value};
}
test('committed retry recovers same tracking capability even after stock reaches zero',async()=>{
 const f=orderFixture();const initial=await f.service.createOrder(f.input);f.setStock(0);
 const replay=await f.service.createOrder({...f.input,quote_token:'expired'});
 assert.equal(f.calls(),1);assert.equal(replay.order.order_number,initial.order.order_number);assert.equal(replay.trackingToken,initial.trackingToken);assert.equal(replay.isIdempotentReplay,true);
 await assert.rejects(()=>f.service.createOrder({...f.input,shipping_address:'34 Different Street'}),/attempt has changed/);
 assert.equal(f.calls(),1);
});
test('variant ownership, insufficient stock, and changed quote prevent transaction calls',async()=>{
 for(const mutate of [f=>({...f.input,items:[{...line,product_id:'different'}]}),f=>({...f.input,items:[{...line,variant_id:'other-pack'}]}),f=>({...f.input,quote_token:security.createQuoteToken([line],{...quoted,total_minor:1}).token})]){
 const f=orderFixture();await assert.rejects(()=>f.service.createOrder(mutate(f)));assert.equal(f.calls(),0);}
 const f=orderFixture();f.setStock(0);await assert.rejects(()=>f.service.createOrder(f.input),/stock/);assert.equal(f.calls(),0);
});
test('order API returns safe uncertain-failure response and rejects identity mismatch',async()=>{
 const api=load('app/api/orders/route.ts',{'next/server':{NextResponse:Response},'../../../lib/services/orders':{createOrder:async()=>{throw Error('PRIVATE SQL DETAIL');}},'@/lib/checkout-validation':validation,'@/lib/request-guards':guards,'@/lib/email/schedule':{scheduleOrderEmails(){}},'@/lib/services/leads':{saveBusinessLead:async()=>null},'@/lib/tracking/validation':{cleanJourney:()=>({analytics_consent:false})}});
 const f=orderFixture();const response=await api.POST(new Request('https://seedly.pk/api/orders',{method:'POST',body:JSON.stringify(f.input)}));
 assert.equal(response.status,500);assert.equal(JSON.stringify(await response.json()).includes('PRIVATE SQL'),false);
 const mismatch=await api.POST(new Request('https://seedly.pk/api/orders',{method:'POST',headers:{'Idempotency-Key':'different-checkout-key-123'},body:JSON.stringify(f.input)}));assert.equal(mismatch.status,400);
});

test("notification adapter does not pretend to deliver customer messages",async()=>{
 const notifications=load("lib/services/notifications.ts",{"../email/order-confirmation":{},"../email/order-update":{},"../email/delivery":{sendTransactionalEmail:async()=>({status:"PREPARED"})},"./content":{getContentDocument:async()=>({config:{name:"Fixture",url:"https://fixture.example.com"}})}});
 const result=await notifications.dispatchStockAlertNotification({type:"STOCK_ALERT_CONFIRMATION",email:"test@example.com",sellableTitle:"Test"});
 assert.equal(result,false);assert.equal(notifications.getDispatchedNotifications()[0].status,"PREPARED");assert.match(notifications.getDispatchedNotifications()[0].message,/fixture[.]example[.]com/);
});

test('sequential references survive a lost response, depleted stock and quote expiry without invoking the legacy direct sender',async()=>{const f=orderFixture(true);const initial=await f.service.createOrder(f.input);assert.equal(initial.order.order_number,'SED-100200');f.setStock(0);const replay=await f.service.createOrder({...f.input,quote_token:'expired'});assert.equal(replay.order.order_number,initial.order.order_number);assert.equal(replay.trackingToken,initial.trackingToken);assert.equal(f.calls(),1);assert.equal(f.assignments(),1);assert.equal(f.notifications(),0);await assert.rejects(()=>f.service.createOrder({...f.input,shipping_address:'Different address'}),/attempt has changed/);});
test('failed transactions retain their allocated reference and invalid baskets allocate none',async()=>{const f=orderFixture(true);f.setFailure({code:'XX000',message:'Temporary failure'});await assert.rejects(()=>f.service.createOrder(f.input));f.setFailure(null);const success=await f.service.createOrder(f.input);assert.equal(success.order.order_number,'SED-100200');assert.equal(f.assignments(),1);assert.equal(f.notifications(),0);const empty=orderFixture(true);empty.setStock(0);await assert.rejects(()=>empty.service.createOrder(empty.input),/stock/);assert.equal(empty.assignments(),0);});
test('enabling sequential numbering preserves already-committed legacy references',async()=>{const f=orderFixture();const old=await f.service.createOrder(f.input);f.setMode(true);f.setStock(0);const replay=await f.service.createOrder({...f.input,quote_token:'expired'});assert.equal(replay.order.order_number,old.order.order_number);assert.equal(f.assignments(),0);assert.equal(f.calls(),1);});

test('numeric references require the capability and the order service never calls the legacy sender',async()=>{const f=orderFixture(true);f.setEmailFailure(true);const created=await f.service.createOrder(f.input);assert.equal(created.order.order_number,'SED-100200');assert.equal(await f.service.lookupOrderWithCapability(created.order.order_number),null);assert.equal(await f.service.lookupOrderWithCapability(created.order.order_number,'0'.repeat(64)),null);assert.equal((await f.service.lookupOrderWithCapability(created.order.order_number,created.trackingToken)).isAuthorized,true);f.setStock(0);const replay=await f.service.createOrder({...f.input,quote_token:'expired'});assert.equal(replay.order.order_number,created.order.order_number);assert.equal(f.calls(),1);});

test('paused or disabled checkout prevents new transactions but still recovers committed orders',async()=>{
 const paused=orderFixture(true);paused.setOrderingEnabled(false);await assert.rejects(()=>paused.service.createOrder(paused.input),error=>error.status===503);assert.equal(paused.calls(),0);assert.equal(paused.assignments(),0);
 const disabled=orderFixture(true);disabled.setEnabledMethods([]);await assert.rejects(()=>disabled.service.createOrder(disabled.input),error=>error.status===409);assert.equal(disabled.calls(),0);
 const committed=orderFixture(true);const original=await committed.service.createOrder(committed.input);committed.setOrderingEnabled(false);committed.setEnabledMethods([]);committed.setStock(0);
 const replay=await committed.service.createOrder({...committed.input,quote_token:'expired'});assert.equal(replay.order.order_number,original.order.order_number);assert.equal(replay.isIdempotentReplay,true);assert.equal(committed.calls(),1);
});
test('database availability changes are mapped to a safe checkout conflict',async()=>{const fixture=orderFixture();fixture.setFailure({code:'P0006',message:'PRIVATE DATABASE DETAIL'});await assert.rejects(()=>fixture.service.createOrder(fixture.input),error=>error.status===409&&!error.message.includes('PRIVATE'));});
