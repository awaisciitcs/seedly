const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const crypto=require('node:crypto');
function load(file,deps={},extra={}){
 const filename=path.join(__dirname,'..',file);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,URL,Date,Intl,AbortSignal,console:{log(){},error(){}},process:{env:{}},require(name){if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);},...extra},{filename});
 return module.exports;
}
const fields=load('lib/checkout-fields.ts');
const valid={customer_name:'Example Customer',customer_email:'test@example.com',customer_phone:'0300 1234567',shipping_address:'42 Example Street',shipping_city:'Lahore',shipping_province:'Punjab',shipping_postal_code:'',shipping_notes:''};
test('checkout errors disappear only when corrected values are valid',()=>{
 assert.equal(Object.keys(fields.validateCheckoutFields(valid)).length,0);
 let draft={...valid,customer_name:'',customer_email:'invalid',shipping_address:''};
 assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,3);
 draft.customer_name='E';assert.ok(fields.validateCheckoutFields(draft).customer_name);
 draft.customer_name=valid.customer_name;assert.equal(fields.validateCheckoutFields(draft).customer_name,undefined);
 draft.customer_email=valid.customer_email;assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,1);
 draft.shipping_address=valid.shipping_address;assert.equal(Object.keys(fields.validateCheckoutFields(draft)).length,0);
 draft.customer_email='broken';assert.ok(fields.validateCheckoutFields(draft).customer_email);
});
const environment={EMAIL_PROVIDER:'resend',RESEND_API_KEY:'test-only-key',EMAIL_FROM:'Seedly <seedly@example.com>',EMAIL_REPLY_TO:'support@example.com',EMAIL_SITE_URL:'https://shop.example.com'};
const email={to:'test@example.com',subject:'Fixture',html:'<p>Fixture</p>',text:'Fixture',idempotencyKey:'seedly-email/test-fixture',from:'Seedly <original@example.com>',replyTo:'original-reply@example.com'};
test('provider retries transient failures and preserves frozen sender/body',async()=>{
 for(const [status,name,retryable] of [[429,'rate_limit_exceeded',true],[503,'service_unavailable',true],[409,'concurrent_idempotent_requests',true],[409,'invalid_idempotent_request',false],[422,'validation_error',false]]){
  let sent;
  const delivery=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:environment},fetch:async(url,options)=>{sent=JSON.parse(options.body);return{ok:false,status,json:async()=>({name})};}});
  const result=await delivery.sendTransactionalEmail(email);assert.equal(result.retryable,retryable);assert.equal(sent.from,email.from);assert.equal(sent.reply_to,email.replyTo);
 }
});
test('header injection and insecure public tracking URLs are rejected without sending',async()=>{
 let calls=0;
 const delivery=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:environment},fetch:async()=>{calls++;}});
 const result=await delivery.sendTransactionalEmail({...email,subject:'Fixture\r\nBcc:attacker@example.com'});assert.equal(result.status,'FAILED');assert.equal(result.retryable,false);assert.equal(calls,0);
 const bad=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:{...environment,EMAIL_SITE_URL:'http://remote.example.com'}}});assert.equal(bad.getEmailDeliveryConfiguration(),null);
});
const escaped=load('lib/email/order-confirmation.ts',{'../config':load('lib/config.ts')});
const brand={name:'Seedly',contact:{email:'support@example.com',phone:'03001234567',whatsappUrl:'https://wa.me/923001234567'},location:'Pakistan'};
const updates=load('lib/email/order-update.ts',{'./order-confirmation':escaped});
test('payment email never exposes admin notes or claims packing; lifecycle HTML escapes content',()=>{
 const result=updates.renderOrderUpdateEmail({brand,event:'PAYMENT_CONFIRMED',orderNumber:'SED-100200',customerName:'<img src=x>',siteUrl:'https://shop.example.com',trackingToken:'a'.repeat(64)});
 assert.match(result.html,/&lt;img src=x&gt;/);assert.doesNotMatch(result.html,/<img src=x|Batch Prepared|Packed/);assert.match(result.text,/updated separately/);assert.match(result.text,/https:\/\/shop.example.com\/order\/SED-100200\?token=/);
 const legacy=updates.renderOrderUpdateEmail({brand,event:'ORDER_DELIVERED',orderNumber:'SED-LEGACY',customerName:'Fixture',siteUrl:'https://shop.example.com'});assert.doesNotMatch(legacy.html,/href=/);
});
function worker({job,deliveryResult={status:'ACCEPTED',providerId:'provider-fixture'},configured=true,finish=true,order,items,token=''}={}){
 const calls=[];const sent=[];
 const client={rpc:async(name,args)=>{calls.push({name,args});if(name==='claim_order_emails')return{data:job?[job]:[],error:null};if(name==='finish_order_email')return{data:finish,error:null};if(name==='prepare_order_email')return{data:{message:args.p_message,first_attempt_at:new Date().toISOString()},error:null};throw Error('Unexpected RPC');},from(table){return{select(){return this;},eq(){return this;},single:async()=>({data:order,error:null}),order:async()=>({data:items,error:null})};}};
 const outbox=load('lib/email/outbox.ts',{'server-only':{},'node:crypto':crypto,'../supabase/admin':{createAdminClient:()=>client},'../checkout-security':{createTrackingToken:()=>token},'./delivery':{getEmailDeliveryConfiguration:()=>configured?{from:'Changed <changed@example.com>',replyTo:'changed@example.com',siteUrl:'https://changed.example.com'}:null,sendTransactionalEmail:async(value)=>{sent.push(value);return deliveryResult;}},'./order-confirmation':escaped,'./order-update':updates,'../services/content':{getContentDocument:async()=>({config:brand,footer:{copyrightLocation:'Pakistan'}})}},{process:{env:{SUPABASE_SECRET_KEY:'test-only-private-key'}}});
 return{outbox,calls,sent};
}
const job={id:'00000000-0000-0000-0000-000000000001',claim_token:'00000000-0000-0000-0000-000000000002',order_id:'fixture',event_type:'ORDER_CREATED',payload:{},message:email,first_attempt_at:new Date().toISOString(),attempts:1};
test('unconfigured worker leaves jobs untouched',async()=>{const state=worker({configured:false});const result=await state.outbox.processOrderEmails();assert.equal(result.configured,false);assert.equal(state.calls.length,0);});
test('retries reuse the exact frozen email and stable idempotency key',async()=>{const state=worker({job,deliveryResult:{status:'FAILED',retryable:true,errorCode:'NETWORK'}});const result=await state.outbox.processOrderEmails();assert.equal(result.retry,1);assert.equal(state.sent[0].from,email.from);assert.equal(state.sent[0].idempotencyKey,email.idempotencyKey);assert.equal(state.calls.at(-1).args.p_status,'RETRY');});
test('uncertain attempts older than the deduplication window never send again',async()=>{const state=worker({job:{...job,first_attempt_at:new Date(Date.now()-24*60*60*1000).toISOString()}});const result=await state.outbox.processOrderEmails();assert.equal(result.unknown,1);assert.equal(state.sent.length,0);assert.equal(state.calls.at(-1).args.p_status,'UNKNOWN');});
test('worker cannot acknowledge a stale claim as accepted',async()=>{const state=worker({job,finish:false});const result=await state.outbox.processOrderEmails();assert.equal(result.accepted,0);assert.equal(result.deferred,1);});
test('scheduling failure never turns a committed order into an API failure',()=>{const schedule=load('lib/email/schedule.ts',{'server-only':{},'next/server':{after(){throw Error('platform unavailable');}},'./outbox':{processOrderEmails(){throw Error('must not run');}}});assert.doesNotThrow(()=>schedule.scheduleOrderEmails());});

test('new confirmation freezes the complete email and uses the verified private tracking capability',async()=>{
 const token='a'.repeat(64);
 const state=worker({job:{...job,message:null,first_attempt_at:null,payload:{order_number:'SED-100200',customer_name:'Fixture Customer',customer_email:'customer@example.com',total_minor:82000,subtotal_minor:62000,shipping_minor:20000,discount_minor:0,payment_method:'COD',created_at:new Date().toISOString(),shipping_address:'12 Example Street',shipping_city:'Lahore',shipping_province:'Punjab'}},token,order:{idempotency_key:'fixture-checkout',request_fingerprint:'b'.repeat(64),tracking_token_hash:crypto.createHash('sha256').update(token).digest('hex')},items:[{name_snapshot:'Sesame seeds',quantity:1,unit_price_minor:62000,image_url:'/sesame.jpg'}]});
 const result=await state.outbox.processOrderEmails();assert.equal(result.accepted,1);
 const prepared=state.calls.find(call=>call.name==='prepare_order_email').args.p_message;
 assert.equal(prepared.to,'customer@example.com');assert.equal(prepared.from,'Changed <changed@example.com>');assert.equal(prepared.idempotencyKey,'seedly-email/'+job.id);
 assert.match(prepared.html,/Sesame seeds/);assert.ok(prepared.text.includes('https://changed.example.com/order/SED-100200?token='+token));assert.equal(state.sent[0],prepared);
});
test('a mismatched private capability blocks an unsafe confirmation link',async()=>{
 const state=worker({job:{...job,message:null,first_attempt_at:null},token:'a'.repeat(64),order:{idempotency_key:'fixture-checkout',request_fingerprint:'b'.repeat(64),tracking_token_hash:'0'.repeat(64)}});
 const result=await state.outbox.processOrderEmails();assert.equal(result.failed,1);assert.equal(state.sent.length,0);assert.equal(state.calls.at(-1).args.p_error_code,'TRACKING_CAPABILITY_UNAVAILABLE');
});
test('exhausted preparation retries are reported as unknown for operational review',async()=>{
 const state=worker({job:{...job,message:null,first_attempt_at:null,attempts:20},order:null});
 const result=await state.outbox.processOrderEmails();assert.equal(result.unknown,1);assert.equal(result.retry,0);assert.equal(state.sent.length,0);assert.equal(state.calls.at(-1).args.p_status,'UNKNOWN');
});
test('email worker authorization rejects public requests before touching the queue',async()=>{
 let calls=0;const route=load('app/api/internal/email-delivery/route.ts',{'node:crypto':crypto,'next/server':{NextResponse:Response},'@/lib/email/outbox':{processOrderEmails:async()=>{calls++;return{configured:false,claimed:0};}}},{Request,Response,process:{env:{EMAIL_CRON_SECRET:'test-only-cron-secret-that-is-long-enough'}}});
 assert.equal((await route.POST(new Request('https://shop.example.com/api/internal/email-delivery',{method:'POST'}))).status,401);
 assert.equal((await route.GET(new Request('https://shop.example.com/api/internal/email-delivery',{headers:{Authorization:'Bearer incorrect'}}))).status,401);assert.equal(calls,0);
 const response=await route.POST(new Request('https://shop.example.com/api/internal/email-delivery',{method:'POST',headers:{Authorization:'Bearer test-only-cron-secret-that-is-long-enough'}}));assert.equal(response.status,503);assert.equal(calls,1);assert.equal(response.headers.get('Cache-Control'),'no-store');
});
