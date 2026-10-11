import 'server-only';
import { cache } from 'react';
import { createPublicClient } from '../supabase/public';
import { getScopedClient } from '../supabase/admin';
import { DISABLED_TRACKING, type TrackingSettings } from '../tracking/types';
import { settingsInput } from '../tracking/validation';
import { RequestError } from '../request-guards';
export async function readTrackingSettings():Promise<TrackingSettings> {
 const {data,error}=await createPublicClient().from('visitor_tracking_settings').select('*').eq('id',1).single();
 if(error||!data)throw new RequestError('Tracking settings are temporarily unavailable.',503);
 return data;
}
export const getTrackingSettings=cache(readTrackingSettings);
export async function safeTrackingSettings():Promise<TrackingSettings>{try{return await getTrackingSettings();}catch{return DISABLED_TRACKING;}}
export async function updateTrackingSettings(body:Record<string,unknown>):Promise<TrackingSettings>{
 const input=settingsInput(body);const client=await getScopedClient();
 const {data,error}=await client.from('visitor_tracking_settings').update(input).eq('id',1).eq('version',Number(body.expected_version)).select('*').maybeSingle();
 if(error){if(error.code==='42501')throw new RequestError('Owner privileges are required.',403);throw new RequestError('Tracking settings could not be saved.',503);}
 if(!data)throw new RequestError('These settings changed while you were editing. Reload before saving.',409);
 return data;
}
