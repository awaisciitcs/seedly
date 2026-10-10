import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source=await fs.readFile(new URL('../lib/cms/seed-content.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const sandbox={exports:{}};vm.runInNewContext(compiled,sandbox);
const docs=JSON.parse(JSON.stringify(sandbox.exports.CMS_INITIAL_DOCUMENTS));
const label=key=>key.replace(/^(?:text|alt|href|src)_/,'').replaceAll('_',' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
function field(key,value,path,doc){
 const full=[...path,key],joined=full.join('.');
 const base={key,label:label(key)};
 if(Array.isArray(value)){
  const sample=value[0]??'';
  const fixed=key==='sections'&&doc.slug!=='page-template'||doc.slug==='routine'&&key==='questions';
  return {...base,type:'list',min:fixed?value.length:key==='options'?1:0,max:fixed?value.length:key==='options'?20:100,item:field('item',sample,full,doc)};
 }
 if(value!==null&&typeof value==='object')return{...base,type:'object',fields:Object.entries(value).map(([k,v])=>field(k,v,full,doc))};
 if(typeof value==='boolean')return{...base,type:'boolean'};
 if(typeof value==='number')return{...base,type:'number',min:/gramsPerCup|waterMlPerCup/.test(key)?0.1:0,max:1_000_000_000};
 let type=key==='image'||key==='logoUrl'||path.at(-1)==='images'?'image':key==='href'||key==='url'||key==='whatsappUrl'||path.at(-1)==='links'?'url':/body|paragraph|description|intro|notice|disclaimer|answer|lead|instructions|text|tip/i.test(joined)||String(value).length>120?'textarea':'text';
 if(key==='id'&&path.includes('sections')&&doc.slug!=='page-template'){
  const options=doc.content.sections.map(s=>({value:s.id,label:s.id.replaceAll('_',' ')}));
  return{...base,type:'select',required:true,options,maxLength:80};
 }
 if(key==='id'&&doc.slug==='routine'&&path.includes('questions'))return{...base,type:'select',required:true,maxLength:30,options:doc.content.questions.map(q=>({value:q.id,label:label(q.id)}))};
 if(key==='icon'&&doc.slug==='routine')return{...base,type:'select',required:true,maxLength:30,options:[...new Set(doc.content.questions.flatMap(q=>q.options.map(o=>o.icon)))].map(v=>({value:v,label:label(v)}))};
 const isPublicContact=full.includes('contact')||full.includes('social')||key==='logoUrl';
 return{...base,type,required:!isPublicContact&&String(value).trim().length>0,maxLength:type==='image'||type==='url'?2048:type==='textarea'?16000:500};
}
const definitions=docs.map(doc=>({...Object.fromEntries(['slug','title','description','kind'].map(k=>[k,doc[k]])),fields:Object.entries(doc.content).map(([k,v])=>field(k,v,[],doc)),...(doc.slug==='routine'?{routineOptions:Object.fromEntries(doc.content.questions.map(q=>[q.id,q.options.map(o=>o.value)]))}:{})}));
function reconcile(field,values){
 if(field.type==='object')for(const child of field.fields)reconcile(child,values.map(value=>value?.[child.key]));
 else if(field.type==='list')reconcile(field.item,values.flatMap(value=>Array.isArray(value)?value:[]));
 else if(values.some(value=>typeof value==='string'&&!value.trim()))field.required=false;
 if(field.key==='kitMath'){field.readOnly=true;field.help='Reference only. Set actual pack prices and contents in Kits.';}
 if(['freeThreshold','standardFee'].includes(field.key)){field.readOnly=true;field.help='Reference only. Set actual delivery fees and thresholds in Settings.';}
}
definitions.forEach((definition,index)=>definition.fields.forEach(field=>reconcile(field,[docs[index].content[field.key]])));
await fs.writeFile(new URL('../lib/cms/definitions.generated.json',import.meta.url),JSON.stringify(definitions,null,2)+'\n');
const route=slug=>({home:'/',routine:'/find-your-seed',wishlist:'/account/wishlist'}[slug]||'/'+slug);
await fs.writeFile(new URL('../backups/pre-production-cms-20261010/cms-migration-input.json',import.meta.url),JSON.stringify(docs.map((doc,i)=>({...doc,definition:definitions[i],route:doc.kind==='page'?route(doc.slug):null}))));
console.log(JSON.stringify({documents:docs.length,fields:definitions.reduce((sum,d)=>sum+d.fields.length,0),generated:true}));
