import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { localDatabasePath, requireSupabaseConfig } from './script-config.mjs';
const config=requireSupabaseConfig({privileged:true});
const db = new DatabaseSync(localDatabasePath(),{readOnly:true});
const client=createClient(config.url,config.key,{auth:{persistSession:false}});
try {
  for (const table of ['categories','products','product_variants','kits','kit_items','site_settings','reviews','admin_users','orders','order_items']) {
    const local=db.prepare('SELECT count(*) AS count FROM '+table).get().count;
    const remote=await client.from(table).select('*',{count:'exact',head:true});
    assert.equal(remote.error,null,'Protected count read failed');
    console.log(table+': archive '+local+', Supabase '+remote.count);
  }
  console.log('Read-only counts complete. Differences can be valid since the archive is historical; this is not an end-to-end test.');
} finally {db.close();}
