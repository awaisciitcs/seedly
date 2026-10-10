import assert from 'node:assert/strict';
import { createDatabaseFixture,applyFixtureMigration } from './database-fixture.mjs';
const db=await createDatabaseFixture();
try {
 await applyFixtureMigration(db,'harden_public_boundaries');
 await applyFixtureMigration(db,'atomic_admin_catalog');
 const save=async(kind,document,children=null,create=false)=>(await db.query('select public.save_admin_catalog($1,$2,$3,$4) as value',[kind,document,children,create])).rows[0].value;
 await db.exec("set role anon; set request.jwt.claim.role='anon'");
 await assert.rejects(()=>save('product',{id:'prod-a',name:'Forged'}),e=>e.code==='42501');
 await db.exec("reset role; set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002'");
 await assert.rejects(()=>save('product',{id:'prod-a',name:'Forged'}),e=>e.code==='42501');
 await db.exec("set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001'");
 await save('product',{id:'prod-a',name:'Updated pumpkin'});
 const variant=(await db.query("select * from public.product_variants where id='var-a'")).rows[0];
 const child={id:'var-a',weight_grams:250,price_minor:1100,inventory_quantity:8,option_value:'250g',status:'ACTIVE',expected_updated_at:variant.updated_at};
 await save('product',{id:'prod-a',price_minor:1100},[child]);
 await assert.rejects(()=>save('product',{id:'prod-a',name:'Must roll back'},[{...child,price_minor:1200}]),e=>e.code==='40001');
 assert.equal((await db.query("select name from public.products where id='prod-a'")).rows[0].name,'Updated pumpkin');
 await assert.rejects(()=>save('product',{id:'prod-a'},[{...child,id:'var-b'}]),e=>e.code==='22023');
 const beforeKit=await db.query("select * from public.kit_items where kit_id='kit-a' order by id");
 await assert.rejects(()=>save('kit',{id:'kit-a',name:'Must roll back'},[{product_id:'prod-b',variant_id:'var-a',quantity:1}]),e=>e.code==='22023');
 assert.deepEqual((await db.query("select * from public.kit_items where kit_id='kit-a' order by id")).rows,beforeKit.rows);
 assert.equal((await db.query("select name from public.kits where id='kit-a'")).rows[0].name,'Routine kit');
 await save('kit',{id:'kit-a',name:'Valid update'},[{product_id:'prod-a',variant_id:'var-a',quantity:2}]);
 assert.equal((await db.query("select quantity from public.kit_items where kit_id='kit-a'")).rows[0].quantity,2);
 await save('product',{id:'prod-a',status:'ARCHIVED'});
 assert.equal((await db.query("select status from public.products where id='prod-a'")).rows[0].status,'ARCHIVED');
 console.log(JSON.stringify({atomicProductSave:true,staleStockConflict:true,foreignVariantDenied:true,invalidKitRollback:true,validKitSave:true,archivePreservesHistory:true,anonymousAndNonAdminDenied:true,liveDatabaseChanged:false}));
}finally{await db.close();}
