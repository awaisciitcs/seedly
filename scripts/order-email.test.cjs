const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,deps={},extra={}){
 const filename=path.join(__dirname,'..',file);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,URL,Date,Intl,AbortSignal,console:{log(){},error(){}},process:{env:{}},require(name){if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);},...extra},{filename});
 return module.exports;
}
const config=load('lib/config.ts');
const templates=load('lib/email/order-confirmation.ts',{'../config':config});
const guards=load('lib/request-guards.ts');
const sample={siteUrl:'https://shop.example.com',brand:{name:'Seedly',contact:{email:'support@example.com',phone:'03001234567',whatsappUrl:'https://wa.me/923001234567'},location:'Pakistan'},orderNumber:'SED-100200',customerName:'Example Customer',totalMinor:115000,subtotalMinor:95000,shippingMinor:20000,paymentMethod:'COD',orderedAt:'2026-10-07T10:00:00Z',trackingToken:'a'.repeat(64),items:[{name:'Pumpkin seeds · 250g',quantity:1,unitPriceMinor:95000,imageUrl:'/images/products/pumpkin-seeds.jpg'}],shippingAddress:{address:'42 Example Street',city:'Lahore',province:'Punjab'}};
test('confirmation includes authoritative amounts, item details, destination and secure tracking',()=>{
 const email=templates.renderOrderConfirmationEmail(sample);
 assert.match(email.subject,/SED-100200/);assert.match(email.html,/PKR 1,150/);assert.match(email.html,/Pumpkin seeds/);assert.match(email.html,/42 Example Street/);assert.match(email.html,/token=aaaaaaaa/);assert.match(email.text,/Qty 1/);assert.match(email.html,/width="600"/);
 assert.doesNotMatch(email.html,/<script|<iframe|<form/);
});
test('COD and prepaid variants keep payment review separate from fulfillment',()=>{
 const cod=templates.renderOrderConfirmationEmail(sample);
 assert.match(cod.html,/Pay on delivery/);assert.doesNotMatch(cod.html,/Payment under review/);
 for(const method of ['bank_transfer','wallet_aggregator']){
 const email=templates.renderOrderConfirmationEmail({...sample,paymentMethod:method});
 assert.match(email.html,/Payment under review/);assert.match(email.html,/does not mean that your payment has been approved/);assert.doesNotMatch(email.html,/Preparation has started|Payment confirmed|Packed/);}
});
test('HTML escapes customer/catalog content and never loads a third-party tracking image',()=>{
 const email=templates.renderOrderConfirmationEmail({...sample,customerName:'<script>alert(1)</script>',shippingAddress:{...sample.shippingAddress,address:'<img src=x onerror=alert(1)>'},items:[{...sample.items[0],name:'<b>Injected & title</b>',imageUrl:'https://attacker.example/track.png'}]});
 assert.doesNotMatch(email.html,/<script|<img src=x|https:\/\/attacker.example/);
 assert.match(email.html,/&lt;script&gt;/);assert.match(email.html,/&lt;b&gt;Injected &amp; title&lt;\/b&gt;/);
 assert.doesNotMatch(email.html,/<img[^>]*token=/);
});
test('invalid references, amounts, quantities and site schemes cannot form an email',()=>{
 for(const input of [{...sample,orderNumber:'SED-100200\r\nBcc:other@example.com'},{...sample,totalMinor:NaN},{...sample,siteUrl:'javascript:alert(1)'},{...sample,items:[{...sample.items[0],quantity:1.2}]}])assert.throws(()=>templates.renderOrderConfirmationEmail(input));
});
test('delivery is opt-in; missing configuration makes no outbound request',async()=>{
 let calls=0;const sender=load('lib/email/delivery.ts',{'server-only':{}},{fetch:async()=>{calls++;throw Error('must not send');}});
 assert.equal((await sender.sendTransactionalEmail({})).status,'PREPARED');assert.equal(calls,0);
 const incomplete=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:{EMAIL_PROVIDER:'resend'}},fetch:async()=>{calls++;}});
 assert.equal((await incomplete.sendTransactionalEmail({to:'example@example.com'})).status,'FAILED');assert.equal(calls,0);
});
test('provider acceptance uses stable idempotency and both HTML/text without claiming inbox delivery',async()=>{
 let sent;const sender=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:{EMAIL_PROVIDER:'resend',RESEND_API_KEY:'test-only-key',EMAIL_FROM:'Seedly <orders@example.com>',EMAIL_REPLY_TO:'support@example.com',EMAIL_SITE_URL:'https://shop.example.com'}},fetch:async(url,options)=>{sent={url,options};return {ok:true,json:async()=>({id:'email-test-id'})};}});
 const result=await sender.sendTransactionalEmail({to:'example@example.com',...templates.renderOrderConfirmationEmail(sample),idempotencyKey:'order-confirmation/SED-100200'});
 assert.equal(result.status,'ACCEPTED');assert.equal(sent.url,'https://api.resend.com/emails');assert.equal(sent.options.headers['Idempotency-Key'],'order-confirmation/SED-100200');
 const body=JSON.parse(sent.options.body);assert.ok(body.html&&body.text);assert.equal(body.reply_to,'support@example.com');
});
test('email transport failures return failure instead of throwing after an order commits',async()=>{
 const sender=load('lib/email/delivery.ts',{'server-only':{}},{process:{env:{EMAIL_PROVIDER:'resend',RESEND_API_KEY:'test-only-key',EMAIL_FROM:'Seedly <orders@example.com>',EMAIL_REPLY_TO:'support@example.com',EMAIL_SITE_URL:'https://shop.example.com'}},fetch:async()=>{throw Error('network down');}});
 assert.equal((await sender.sendTransactionalEmail({to:'example@example.com'})).status,'FAILED');
 const notifications=load('lib/services/notifications.ts',{'../utils':{formatPKR:String},'../email/order-confirmation':templates,'../email/delivery':{sendTransactionalEmail:async()=>({status:'FAILED'})},'../email/order-update':{},'./content':{}});
 await notifications.dispatchNotification({type:'ORDER_CREATED',orderNumber:sample.orderNumber,customerName:sample.customerName,customerEmail:'example@example.com',customerPhone:'',totalMinor:sample.totalMinor,paymentMethod:'COD',confirmation:sample});
 assert.equal(notifications.getDispatchedNotifications()[0].status,'FAILED');assert.match(notifications.getDispatchedNotifications()[0].html,/Your order is received/);
});
test('reference allocation has no public-key fallback and propagates conflicts safely',async()=>{
 const noKey=load('lib/order-reference.ts',{'server-only':{},'./supabase/admin':{createAdminClient(){throw Error('must not call');}},'./request-guards':guards});
 await assert.rejects(()=>noKey.allocateCheckoutOrderReference('SED-'+ 'A'.repeat(24),'a'.repeat(64)),error=>error.status===503);
 const conflict=load('lib/order-reference.ts',{'server-only':{},'./supabase/admin':{createAdminClient:()=>({rpc:async()=>({data:null,error:{code:'P0001'}})})},'./request-guards':guards},{process:{env:{SUPABASE_SECRET_KEY:'test-only-private-key',ORDER_REFERENCE_MODE:'sequential'}}});
 assert.equal(conflict.sequentialOrderReferencesEnabled(),true);
 await assert.rejects(()=>conflict.findCheckoutOrderReference('SED-'+ 'A'.repeat(24),'a'.repeat(64)),error=>error.status===409);
});
