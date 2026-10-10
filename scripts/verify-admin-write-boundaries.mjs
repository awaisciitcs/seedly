import assert from 'node:assert/strict';
import {createDatabaseFixture,applyFixtureMigration} from './database-fixture.mjs';
const db=await createDatabaseFixture();
try {
 for(const name of ['harden_public_boundaries','atomic_admin_catalog','harden_commerce_transactions','sequential_order_references','restrict_admin_commerce_writes'])await applyFixtureMigration(db,name);
 await db.exec("insert into auth.users(id) values ('10000000-0000-0000-0000-000000000003');insert into public.admin_users(id,auth_user_id,email,name,role,is_active) values ('admin-staff','10000000-0000-0000-0000-000000000003','staff@example.test','Fixture Staff','STAFF',true)");
 for(const id of ['10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003']) {
  await db.exec("reset role;set role authenticated;set request.jwt.claim.role='authenticated';set request.jwt.claim.sub='"+id+"'");
  for(const table of ['orders','order_items','order_events','order_stock_reservations']){
   await db.query('select * from public.'+table);
   await assert.rejects(()=>db.query('delete from public.'+table),e=>e.code==='42501');
  }
 }
 const staffUpdate=await db.query("update public.site_settings set value='999' where key='delivery_fee_minor' returning key");assert.equal(staffUpdate.rows.length,0);
 await assert.rejects(()=>db.query("insert into public.site_settings(key,value) values('fixture_setting','bad')"),e=>e.code==='42501');
 await db.exec("set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001'");
 const ownerUpdate=await db.query("update public.site_settings set value='300' where key='delivery_fee_minor' returning key");assert.equal(ownerUpdate.rows.length,1);
 await db.exec("set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002'");
 for(const sql of ["select public.update_order_fulfillment_transactional('missing','CANCELLED')","select public.update_order_payment_transactional('missing','VERIFIED')"])await assert.rejects(()=>db.query(sql),e=>e.code==='42501');
 console.log(JSON.stringify({directCommerceWritesDeniedForOwnerAndStaff:true,commerceReadsPreserved:true,staffSettingsWritesDenied:true,ownerSettingsWritesPreserved:true,nonAdminTransactionalWritesDenied:true,liveDatabaseChanged:false}));
}catch(error){console.error(JSON.stringify({message:error.message,code:error.code}));process.exitCode=1;}finally{await db.close();}
