import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fyqmbjzpajmnyyqcrmgc.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_qu7RVH39xF_KTN9RETEECg_vC3rzb3P';

async function testSupabase() {
  console.log('=== SEEDLY SUPABASE & ADMIN SYNC VERIFICATION ===\n');

  const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: false }
  });

  // 1. Verify Public Catalog Access
  console.log('1. Testing Public Catalog Read (RLS Active Products & Kits)...');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, slug, price_minor, status')
    .eq('status', 'ACTIVE');

  if (pErr) {
    console.error('❌ Failed to fetch products:', pErr.message);
  } else {
    console.log(`✅ Successfully fetched ${products.length} active products from Supabase:`);
    products.slice(0, 3).forEach(p => console.log(`   - ${p.name} (${p.slug}) - Rs. ${p.price_minor / 100}`));
  }

  const { data: kits, error: kErr } = await supabase
    .from('kits')
    .select('id, name, slug, price_minor')
    .eq('status', 'ACTIVE');

  if (kErr) {
    console.error('❌ Failed to fetch kits:', kErr.message);
  } else {
    console.log(`✅ Successfully fetched ${kits.length} active routine kits from Supabase.`);
  }

  const { data: settings, error: sErr } = await supabase
    .from('site_settings')
    .select('key, value');

  if (sErr) {
    console.error('❌ Failed to fetch settings:', sErr.message);
  } else {
    console.log(`✅ Successfully fetched ${settings.length} site settings from Supabase.`);
    const feeSetting = settings.find(s => s.key === 'delivery_fee_minor');
    const threshSetting = settings.find(s => s.key === 'free_delivery_threshold_minor');
    console.log(`   - Standard Delivery Fee: Rs. ${(feeSetting ? parseInt(feeSetting.value) : 20000) / 100}`);
    console.log(`   - Free Delivery Threshold: Rs. ${(threshSetting ? parseInt(threshSetting.value) : 250000) / 100}`);
  }

  // 2. Test Admin Authentication via Supabase Auth
  console.log('\n2. Testing Admin Supabase Auth Login (owner@seedly.pk)...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'owner@seedly.pk',
    password: 'ChangeMe123!Admin',
  });

  if (authErr || !authData.user) {
    console.error('❌ Supabase Auth failed for owner@seedly.pk:', authErr?.message);
  } else {
    console.log('✅ Supabase Auth succeeded!');
    console.log(`   - User ID: ${authData.user.id}`);
    console.log(`   - Email: ${authData.user.email}`);

    // Create an authenticated client with the session access token to test Admin RLS!
    const authClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      },
      auth: { persistSession: false }
    });

    console.log('\n3. Testing Authenticated Admin Read with RLS policies...');
    const { data: adminProfile, error: apErr } = await authClient
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (apErr) {
      console.error('❌ Failed to read admin profile with auth session:', apErr.message);
    } else {
      console.log('✅ Admin Profile verified in public.admin_users:');
      console.log(`   - Name: ${adminProfile.name}`);
      console.log(`   - Role: ${adminProfile.role}`);
      console.log(`   - Active: ${adminProfile.is_active}`);
    }

    const { data: orders, count, error: oErr } = await authClient
      .from('orders')
      .select('id, order_number, customer_name, total_minor, order_status, payment_status', { count: 'exact' });

    if (oErr) {
      console.error('❌ Failed to read orders as admin:', oErr.message);
    } else {
      console.log(`✅ Authenticated Admin can view ${orders.length} orders (Total in DB: ${count}):`);
      orders.slice(0, 3).forEach(o => {
        console.log(`   - Order #${o.order_number}: ${o.customer_name} | Total: Rs. ${o.total_minor / 100} | Status: ${o.order_status} | Payment: ${o.payment_status}`);
      });
    }

    const { data: reviews, error: rErr } = await authClient
      .from('reviews')
      .select('*');

    if (rErr) {
      console.error('❌ Failed to read reviews:', rErr.message);
    } else {
      console.log(`✅ Authenticated Admin can view all ${reviews.length} reviews for moderation.`);
    }
  }

  // 4. Test Public RLS Protection (Negative Test - Anon should be blocked from orders)
  console.log('\n4. Testing Security Boundary (RLS Anon Protection)...');
  const anonClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: false }
  });
  const { data: anonOrders, error: anonErr } = await anonClient
    .from('orders')
    .select('id, order_number, customer_name');

  if (!anonOrders || anonOrders.length === 0) {
    console.log('✅ RLS Security Guard PASSED: Anonymous public client received 0 customer orders (Protected by RLS).');
  } else {
    console.error('❌ Security alert: Anonymous client was able to read customer orders!', anonOrders.length);
  }

  console.log('\n=== ALL SUPABASE & ADMIN SYNC TESTS COMPLETE ===');
}

testSupabase().catch(console.error);
