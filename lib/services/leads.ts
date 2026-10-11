import 'server-only';
import crypto from 'node:crypto';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { getTrackingSettings } from './tracking';
import { cleanJourney, leadSearch, UUID } from '../tracking/validation';
import type { JourneyContext, Lead } from '../tracking/types';
import { RequestError } from '../request-guards';
const columns='id,name,email,phone,city,source,posthog_id,analytics_consent,marketing_consent,landing_page,page,referrer,utm_source,utm_medium,utm_campaign,order_id,created_at,expires_at';
interface LeadInput { name:string|null; email:string|null; phone:string|null; city:string|null; source:Lead['source']; marketing_consent:boolean; journey:JourneyContext; submission_key?:string; order_id?:string; }
export async function saveLead(input:LeadInput):Promise<string|null>{
 const settings=await getTrackingSettings();if(!settings.leads_enabled)return null;
 const client=createAdminClient();const journey=cleanJourney(input.journey);
 if(!settings.posthog_enabled)delete journey.posthog_id;
 if(input.phone?.startsWith('03'))input={...input,phone:'+92'+input.phone.slice(1)};
 const expires=new Date(Date.now()+settings.retention_days*86400000).toISOString();
 const values={name:input.name,email:input.email,phone:input.phone,city:input.city,source:input.source,marketing_consent:input.marketing_consent,analytics_consent:journey.analytics_consent,posthog_id:journey.posthog_id||null,landing_page:journey.landing_page||null,page:journey.page||null,referrer:journey.referrer||null,utm_source:journey.utm_source||null,utm_medium:journey.utm_medium||null,utm_campaign:journey.utm_campaign||null,order_id:input.order_id||null};
 const key=input.submission_key||crypto.randomUUID();
 const signature=crypto.createHmac('sha256',process.env.CHECKOUT_SIGNING_SECRET||process.env.SUPABASE_SECRET_KEY!).update(JSON.stringify({name:values.name,email:values.email,phone:values.phone,city:values.city,source:values.source,marketing_consent:values.marketing_consent,order_id:values.order_id})).digest('hex');
 const {data,error}=await client.from('leads').insert({...values,submission_key:key,submission_hash:signature,expires_at:expires}).select('id').abortSignal(AbortSignal.timeout(5000)).single();
 if(error?.code==='23505'){
  // Never merge by email/phone or expose another person's existing identity.
  let lookup=client.from('leads').select('id,submission_hash').gt('expires_at',new Date().toISOString());
  lookup=input.order_id?lookup.eq('order_id',input.order_id):lookup.eq('submission_key',key);
  const {data:previous,error:readError}=await lookup.maybeSingle();
  if(readError||!previous)throw new RequestError('Your request could not be recovered. Please reload and try again.',409);
  if(previous.submission_hash!==signature)throw new RequestError('This request changed. Reload the form before trying again.',409);
  return previous.id;
 }
 if(error||!data)throw new RequestError('Your request could not be saved. Please try again.',503);
 await client.rpc('purge_expired_leads',{}).then(()=>undefined,()=>undefined);
 return data.id;
}
export async function saveBusinessLead(input:LeadInput):Promise<string|null>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  // Optional analytics copies must never keep a committed order waiting indefinitely.
  return await Promise.race([saveLead(input),new Promise<null>(resolve=>{timer=setTimeout(()=>{console.error('Optional lead synchronization timed out. The original operation is preserved.');resolve(null);},5000);})]);
 }catch{console.error('Optional lead synchronization failed. The original operation is preserved.');return null;}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
export async function listLeads(parameters:URLSearchParams){
 const source=parameters.get('source')||'all';if(!['all','contact','checkout','restock'].includes(source))throw new RequestError('Invalid lead source.');
 const pageValue=parameters.get('page')||'1';if(!/^[1-9][0-9]{0,5}$/.test(pageValue))throw new RequestError('Invalid results page.');
 const page=Number(pageValue),size=25;const search=leadSearch(parameters.get('q')||'');
 const client=await getScopedClient();let query=client.from('leads').select(columns,{count:'exact'}).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).order('id',{ascending:false}).range((page-1)*size,page*size-1);
 if(source!=='all')query=query.eq('source',source as Lead['source']);
 if(search)query=query.or(['name','email','phone','city'].map(field=>field+'.ilike.*'+search.replaceAll('*','')+'*').join(','));
 const {data,error,count}=await query;if(error)throw new RequestError('Leads could not be loaded.',503);
 return {rows:(data||[]) as Lead[],total:count||0,page,page_size:size};
}
export async function eraseLead(id:string){if(!UUID.test(id))throw new RequestError('Select a valid lead.');const client=await getScopedClient();const {data,error}=await client.from('leads').delete().eq('id',id).select('id');if(error)throw new RequestError('This lead could not be erased.',503);if(!data?.length)throw new RequestError('This lead is no longer available.',404);}
export async function purgeExpiredLeads(){const {data,error}=await createAdminClient().rpc('purge_expired_leads',{});if(error)throw new RequestError('Expired leads could not be purged.',503);return data;}
