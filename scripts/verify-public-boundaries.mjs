import assert from 'node:assert/strict';
import { createDatabaseFixture, applyFixtureMigration } from './database-fixture.mjs';
const db = await createDatabaseFixture();
try {
  await applyFixtureMigration(db,'harden_public_boundaries');
  await db.exec(`set role anon; set request.jwt.claim.role='anon';`);
  assert.equal((await db.query('select count(*)::int as n from public.products')).rows[0].n,2);
  await assert.rejects(()=>db.exec(`insert into storage.objects(bucket_id,name) values ('product-images','malicious.svg')`),e=>e.code==='42501');
  await assert.rejects(()=>db.exec(`insert into storage.objects(bucket_id,name) values ('payment-receipts','unowned.pdf')`),e=>e.code==='42501');
  await db.exec(`insert into public.reviews(id,product_id,product_name,customer_name,rating,title,body,status,is_demo,verified_purchase) values ('review-pending','prod-a','Pumpkin','Test Customer',5,'Useful product','An example review with enough text.','PENDING',false,false)`);
  assert.equal((await db.query('select count(*)::int as n from public.reviews')).rows[0].n,0);
  await assert.rejects(()=>db.exec(`insert into public.reviews(id,product_id,customer_name,rating,title,body,status,is_demo,verified_purchase) values ('fake-verified','prod-a','Test Customer',5,'Fake proof','An example review with enough text.','PENDING',false,true)`),e=>e.code==='42501');
  await db.exec(`reset role; set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002';`);
  await assert.rejects(()=>db.exec(`insert into storage.objects(bucket_id,name) values ('product-images','nonadmin.png')`),e=>e.code==='42501');
  await db.exec(`set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';`);
  await db.exec(`insert into storage.objects(bucket_id,name) values ('product-images','admin.png')`);
  await db.exec(`reset role; set role anon; set request.jwt.claim.role='anon'; reset request.jwt.claim.sub; update storage.objects set name='changed' where name='admin.png'; delete from storage.objects where name='admin.png'; reset role;`);
  assert.equal((await db.query(`select name from storage.objects where name='admin.png'`)).rows.length,1);
  console.log(JSON.stringify({publicCatalogPreserved:true,anonymousStorageWritesDenied:true,nonAdminStorageWritesDenied:true,adminUploadAllowed:true,pendingReviewSubmissionAllowed:true,pendingReviewPrivate:true,forgedVerifiedReviewDenied:true,liveDatabaseChanged:false}));
} finally { await db.close(); }
