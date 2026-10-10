import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseConfig } from './script-config.mjs';
const {url,key} = requireSupabaseConfig();
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const publicClient = createClient(url,key,options);
for (const table of ['products','kits']) {
  const {error,count} = await publicClient.from(table).select('id',{count:'exact',head:true}).eq('status','ACTIVE');
  assert.equal(error,null,'Public catalog read failed');
  assert.ok(count > 0,'Public catalog is empty');
}
for (const table of ['orders','order_items','admin_users','stock_alert_subscriptions']) {
  const {data,error} = await publicClient.from(table).select('*').limit(1);
  assert.ok(error || Array.isArray(data) && data.length === 0,'Anonymous access exposed protected records');
}
console.log('Live read-only catalog and anonymous RLS checks passed.');
if (process.argv.includes('--test-admin')) {
  const email = process.env.SEEDLY_TEST_ADMIN_EMAIL;
  const password = process.env.SEEDLY_TEST_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Configure a dedicated SEEDLY_TEST_ADMIN_EMAIL and SEEDLY_TEST_ADMIN_PASSWORD. Never use an exposed production password.');
  const adminClient = createClient(url,key,options);
  try {
    const {data,error} = await adminClient.auth.signInWithPassword({email,password});
    assert.equal(error,null,'Test administrator login failed');
    assert.ok(data.user,'Test authentication did not return a user');
    const profile = await adminClient.from('admin_users').select('role,is_active').eq('auth_user_id',data.user.id).maybeSingle();
    assert.equal(profile.error,null);
    assert.ok(profile.data?.is_active && ['OWNER','STAFF'].includes(profile.data.role),'Test account is not an active linked administrator');
    const orders = await adminClient.from('orders').select('id',{count:'exact',head:true});
    assert.equal(orders.error,null,'Administrator read failed');
    console.log('Dedicated administrator authentication and protected read passed.');
  } finally { await adminClient.auth.signOut({scope:'local'}); }
} else console.log('Positive administrator authentication was not tested; no test account was provided.');
