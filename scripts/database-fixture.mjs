import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Metadata captured read-only from the linked project. No customer rows or keys.
export async function createDatabaseFixture() {
  const moduleUrl = process.env.PGLITE_MODULE || '@electric-sql/pglite';
  const { PGlite } = await import(moduleUrl);
  const cryptoUrl = process.env.PGLITE_PGCRYPTO_MODULE || (moduleUrl.startsWith('file:') ? new URL('./contrib/pgcrypto.js', moduleUrl).href : '@electric-sql/pglite/contrib/pgcrypto');
  const { pgcrypto } = await import(cryptoUrl);
  const db = await PGlite.create({ extensions: { pgcrypto } });
  const meta = JSON.parse(await fs.readFile(new URL('./fixtures/database-schema.json', import.meta.url), 'utf8'));
  const ident = value => '"' + value.replaceAll('"', '""') + '"';
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
    grant usage on schema auth,public,storage,extensions to anon,authenticated,service_role;
    create extension pgcrypto with schema extensions;`);
  const tables = new Map();
  for (const column of meta.columns) {
    const name = column.table_name;
    if (!tables.has(name)) tables.set(name, []);
    tables.get(name).push(`${ident(column.column_name)} ${column.data_type === 'ARRAY' ? 'text[]' : column.data_type}${column.column_default ? ' default ' + column.column_default : ''}${column.is_nullable === 'NO' ? ' not null' : ''}`);
  }
  for (const [name, columns] of tables) await db.exec(`create table public.${ident(name)}(${columns.join(',')});`);
  for (const constraint of [...meta.constraints].sort((a,b) => Number(a.definition.startsWith('FOREIGN KEY')) - Number(b.definition.startsWith('FOREIGN KEY')))) {
    await db.exec(`alter table public.${ident(constraint.relation)} add constraint ${ident(constraint.conname)} ${constraint.definition};`);
  }
  for (const fn of meta.functions.filter(f => f.proname !== 'rls_auto_enable')) await db.exec(fn.definition);
  await db.exec(`create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$ begin null; end $$;
    create table storage.buckets(id text primary key,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid() primary key,bucket_id text not null,name text);
    insert into storage.buckets values ('product-images',true,null,null),('payment-receipts',false,5242880,array['image/jpeg','image/png','application/pdf']);
    grant select,insert,update,delete on all tables in schema public,storage to anon,authenticated,service_role;
    grant execute on all functions in schema public,auth,extensions to anon,authenticated,service_role;`);
  for (const name of tables.keys()) await db.exec(`alter table public.${ident(name)} enable row level security;`);
  await db.exec('alter table storage.objects enable row level security;');
  for (const policy of meta.policies) {
    await db.exec(`create policy ${ident(policy.policyname)} on ${ident(policy.schemaname)}.${ident(policy.tablename)} as ${policy.permissive} for ${policy.cmd} to ${policy.roles.map(ident).join(',')}${policy.qual ? ' using ('+policy.qual+')' : ''}${policy.with_check ? ' with check ('+policy.with_check+')' : ''};`);
  }
  await db.exec(`insert into auth.users values ('10000000-0000-0000-0000-000000000001'),('10000000-0000-0000-0000-000000000002');
    insert into public.admin_users(id,auth_user_id,email,name,role,is_active) values ('admin-owner','10000000-0000-0000-0000-000000000001','owner@example.test','Test Owner','OWNER',true);
    insert into public.categories(id,name,slug) values ('cat-seeds','Seeds','seeds'),('cat-kits','Kits','kits');
    insert into public.products(id,category_id,name,slug,sku,product_type,status,price_minor,weight_grams,image_url) values ('prod-a','cat-seeds','Pumpkin','pumpkin','PUMPKIN','seed','ACTIVE',1000,250,'/pumpkin.jpg'),('prod-b','cat-seeds','Flax','flax','FLAX','seed','ACTIVE',2000,250,'/flax.jpg');
    insert into public.product_variants(id,product_id,sku,option_name,option_value,price_minor,weight_grams,inventory_quantity,status) values ('var-a','prod-a','PUMPKIN250','Pack','250g',1000,250,10,'ACTIVE'),('var-b','prod-b','FLAX250','Pack','250g',2000,250,10,'ACTIVE');
    insert into public.kits(id,category_id,name,slug,price_minor,status,image_url) values ('kit-a','cat-kits','Routine kit','routine-kit',2500,'ACTIVE','/kit.jpg');
    insert into public.kit_items(id,kit_id,product_id,variant_id,product_variant_id,quantity) values ('ki-a','kit-a','prod-a','var-a','var-a',1),('ki-b','kit-a','prod-b','var-b','var-b',1);
    insert into public.site_settings(key,value) values ('delivery_fee_minor','200'),('free_delivery_threshold_minor','5000');`);
  return db;
}

export async function applyFixtureMigration(db, suffix) {
  const migrationsDir = new URL('../supabase/migrations/',import.meta.url);
  const files = await fs.readdir(migrationsDir);
  const filename = files.find(name => name.endsWith('_'+suffix+'.sql'));
  if (!filename) throw new Error('Missing migration: '+suffix);
  const sql = await fs.readFile(new URL(filename,migrationsDir),'utf8');
  await db.exec(sql);
  return filename;
}
