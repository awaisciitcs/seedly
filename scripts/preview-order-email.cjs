const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,deps={}){
 const filename=path.join(__dirname,'..',file),module={exports:{}};
 const source=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText;
 vm.runInNewContext(source,{module,exports:module.exports,URL,Date,Intl,require(name){if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);}},{filename});return module.exports;
}
const config=load('lib/config.ts');
const {renderOrderConfirmationEmail}=load('lib/email/order-confirmation.ts',{'../config':config});
const folder=path.resolve(__dirname,'../docs/email-previews');fs.mkdirSync(folder,{recursive:true});
const sample={siteUrl:config.siteConfig.url,brand:{name:config.siteConfig.name,contact:config.siteConfig.contact,location:'Pakistan'},orderNumber:'SED-100200',customerName:'Example Customer',orderedAt:'2026-10-07T10:00:00Z',totalMinor:187000,subtotalMinor:167000,shippingMinor:20000,trackingToken:'0'.repeat(64),items:[{name:'Raw Pumpkin Seeds (Pepitas) · 250g',quantity:1,unitPriceMinor:95000,imageUrl:'/images/products/pumpkin-seeds.jpg'},{name:'Raw Sunflower Seeds · 250g',quantity:1,unitPriceMinor:72000,imageUrl:'/images/products/sunflower-seeds.jpg'}],shippingAddress:{address:'42 Example Street, Sample Area',city:'Lahore',province:'Punjab',postalCode:'54000'}};
for(const [name,paymentMethod] of [['cod','COD'],['bank-transfer','bank_transfer'],['wallet','wallet_aggregator']]){
 const email=renderOrderConfirmationEmail({...sample,paymentMethod});
 fs.writeFileSync(path.join(folder,'order-confirmation-'+name+'.html'),email.html);
 fs.writeFileSync(path.join(folder,'order-confirmation-'+name+'.txt'),email.text);
}
console.log('Created three HTML and plain-text previews using sample data. No email was sent.');
