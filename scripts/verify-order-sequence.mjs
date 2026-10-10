import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// This verification uses isolated in-memory PostgreSQL; it never connects to Supabase.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db=await PGlite.create();
try {
 await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create table public.orders(order_number text unique); insert into public.orders values ('SED-C93F82A40B400828759527D0');");
 await db.exec("create function public.lookup_order_with_capability(text,text,text) returns jsonb language sql as $$ select '{}'::jsonb $$; create function public.create_order_transactional(text) returns jsonb language sql as $$ select '{}'::jsonb $$;");
 const migration=await fs.readFile(new URL('../supabase/migrations/20261008074034_sequential_order_references.sql', import.meta.url),'utf8');
 await db.exec(migration);
 const fingerprint='a'.repeat(64), otherFingerprint='b'.repeat(64);
 const key=n=>'SED-'+n.toString(16).toUpperCase().padStart(24,'0');
 const scalar=async(sql,params=[])=>(await db.query(sql,params)).rows[0].value;
 await db.exec('set role service_role');
 assert.equal(await scalar('select public.find_checkout_order_reference($1,$2) as value',[key(1),fingerprint]),null);
 assert.equal(await scalar('select public.allocate_checkout_order_reference($1,$2) as value',[key(1),fingerprint]),'SED-100200');
 assert.equal(await scalar('select public.allocate_checkout_order_reference($1,$2) as value',[key(1),fingerprint]),'SED-100200');
 assert.equal(await scalar('select public.allocate_checkout_order_reference($1,$2) as value',[key(2),fingerprint]),'SED-100201');
 assert.equal(await scalar('select public.find_checkout_order_reference($1,$2) as value',[key(1),fingerprint]),'SED-100200');
 await assert.rejects(()=>db.query('select public.allocate_checkout_order_reference($1,$2)',[key(1),otherFingerprint]),error=>error.code==='P0001');
 await assert.rejects(()=>db.query('select public.allocate_checkout_order_reference($1,$2)',['malformed',fingerprint]),error=>error.code==='22023');
 for(const role of ['anon','authenticated']){
  await db.exec('reset role; set role '+role);
  for(const name of ['find_checkout_order_reference','allocate_checkout_order_reference'])await assert.rejects(()=>db.query('select public.'+name+'($1,$2)',[key(1),fingerprint]),error=>error.code==='42501');
  await assert.rejects(()=>db.query('select * from seedly_checkout.order_references'),error=>error.code==='42501');
  assert.equal(await scalar("select has_function_privilege(current_user,'public.lookup_order_with_capability(text,text,text)','EXECUTE') as value"),true);
  await assert.rejects(()=>db.query('select public.create_order_transactional($1)',[key(1)]),error=>error.code==='42501');
 }
 await db.exec('reset role');
 assert.equal(await scalar("select relrowsecurity as value from pg_class where oid='seedly_checkout.order_references'::regclass"),true);
 assert.equal(await scalar("select prosecdef as value from pg_proc where oid='public.allocate_checkout_order_reference(text,text)'::regprocedure"),false);
 assert.equal(await scalar("select count(*)::integer as value from public.orders where order_number='SED-C93F82A40B400828759527D0'"),1);
 await db.exec(migration);
 await db.exec('set role service_role');
 assert.equal(await scalar('select public.allocate_checkout_order_reference($1,$2) as value',[key(3),fingerprint]),'SED-100202');
 await db.exec("reset role; insert into public.orders values ('SED-100350')");
 await db.exec(migration);
 await db.exec('set role service_role');
 assert.equal(await scalar('select public.allocate_checkout_order_reference($1,$2) as value',[key(4),fingerprint]),'SED-100351');
 console.log(JSON.stringify({postgresMigrationPassed:true,initialSequence:'SED-100200, SED-100201, SED-100202',retryIdentityStable:true,changedRequestsRejected:true,anonymousAndAuthenticatedDenied:true,rlsEnabled:true,securityInvoker:true,runsNeverResetCounter:true,existingOrdersPreserved:true,liveDatabaseChanged:false}));
} finally {await db.close();}
