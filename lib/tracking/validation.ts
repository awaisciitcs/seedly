import { RequestError } from '../request-guards';
import type { JourneyContext, Lead, TrackingSettings } from './types';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function publicPath(value: unknown): string | null {
 if(typeof value!=='string'||value.length>1024)return null;
 let path=value.split(/[?#]/)[0];
 if(!/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(path))return null;
 if(/^\/(admin|api|order|account|payments|stock-alerts)(\/|$)/.test(path))return null;
 if(path.startsWith('/pages/')&&!/^\/pages\/[a-z0-9-]{1,80}$/.test(path))return null;
 if(!['/','/shop','/seeds','/teas','/kits','/cart','/checkout','/contact','/privacy','/terms','/faq','/about','/returns','/shipping','/product-disclaimer','/find-your-seed'].includes(path)&&!/^\/(seeds|teas|kits)\/[a-z0-9-]{1,100}$/.test(path)&&!path.startsWith('/pages/'))return null;
 return path;
}
export function replayPage(path:string):boolean{return !!publicPath(path)&&!/^\/(checkout|cart|contact|find-your-seed|privacy|terms)(\/|$)/.test(path);}
export function campaignValue(value: unknown):string|null {
 if(typeof value!=='string'||value.length>80||!value.trim()||!/^[-a-zA-Z0-9_. ]+$/.test(value)||/\d{7,}/.test(value))return null;
 return value.trim();
}
export function referrerHost(value:unknown):string|null {
 if(typeof value!=='string'||value.length>2048||!value)return null;
 try{const url=new URL(value.includes('://')?value:'https://'+value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password&&/^[a-z0-9.-]{1,253}$/i.test(url.hostname)?url.hostname:null;}catch{return null;}
}
export function cleanJourney(value:unknown):JourneyContext {
 const input=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
 if(input.analytics_consent!==true)return {analytics_consent:false};
 const id=typeof input.posthog_id==='string'&&(UUID.test(input.posthog_id)||/^lead_[0-9a-f-]{36}$/i.test(input.posthog_id))?input.posthog_id:undefined;
 return {analytics_consent:true,...(id?{posthog_id:id}:{}),...Object.fromEntries(Object.entries({landing_page:publicPath(input.landing_page),page:publicPath(input.page),referrer:referrerHost(input.referrer),utm_source:campaignValue(input.utm_source),utm_medium:campaignValue(input.utm_medium),utm_campaign:campaignValue(input.utm_campaign)}).filter(([,v])=>v!==null))};
}
function text(value:unknown,label:string,max:number,required=false):string {
 if(typeof value!=='string'||value.length>max||/[\u0000-\u001f\u007f]/.test(value))throw new RequestError(label+' is invalid.');
 const result=value.trim();if(required&&!result)throw new RequestError(label+' is required.');return result;
}
export function contactFields(body:Record<string,unknown>) {
 const allowed=new Set(['name','email','phone','city','contact_consent','marketing_consent','journey','submission_key','website']);
 if(Object.keys(body).some(key=>!allowed.has(key)))throw new RequestError('The form contains an unsupported field.');
 if(typeof body.marketing_consent!=='boolean')throw new RequestError('Choose whether you want marketing updates.');
 if(typeof body.submission_key!=='string'||!UUID.test(body.submission_key))throw new RequestError('Reload the form and try again.');
 const name=text(body.name,'Name',120,true);if(name.length<2)throw new RequestError('Please enter your name.');
 const email=text(body.email,'Email',254).toLowerCase();if(email&&!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))throw new RequestError('Please enter a valid email address.');
 let phone=text(body.phone,'Phone',30).replace(/[\s()-]/g,'');
 if(/^03\d{9}$/.test(phone))phone='+92'+phone.slice(1);else if(/^0092\d{10}$/.test(phone))phone='+'+phone.slice(2);else if(/^923\d{9}$/.test(phone))phone='+'+phone;
 if(phone&&!/^\+?[1-9]\d{7,14}$/.test(phone))throw new RequestError('Please enter a valid phone number, including its country code.');
 if(!email&&!phone)throw new RequestError('Enter an email address or phone number so we can reply.');
 if(body.contact_consent!==true)throw new RequestError('Please allow us to use your details to reply.');
 return {name,email:email||null,phone:phone||null,city:text(body.city,'City',80)||null,marketing_consent:body.marketing_consent,submission_key:body.submission_key,journey:cleanJourney(body.journey)};
}
export function settingsInput(body:Record<string,unknown>):Omit<TrackingSettings,'id'|'version'|'updated_at'> {
 const keys=['posthog_enabled','posthog_token','posthog_region','posthog_project_id','clarity_enabled','clarity_project_id','leads_enabled','retention_days','banner_title','banner_body','form_title','form_intro','form_button','privacy_notice','expected_version'];
 if(Object.keys(body).some(key=>!keys.includes(key)))throw new RequestError('Unknown tracking setting.');
 for(const key of ['posthog_enabled','clarity_enabled','leads_enabled'])if(typeof body[key]!=='boolean')throw new RequestError('Choose an enabled state for each feature.');
 if(!Number.isSafeInteger(body.expected_version)||Number(body.expected_version)<1)throw new RequestError('Reload these settings before saving.');
 if(!Number.isSafeInteger(body.retention_days)||Number(body.retention_days)<30||Number(body.retention_days)>365)throw new RequestError('Lead retention must be between 30 and 365 days.');
 if(!['eu','us'].includes(String(body.posthog_region)))throw new RequestError('Choose the PostHog EU or US region.');
 const token=text(body.posthog_token,'PostHog project token',200);if(token&&!/^phc_[A-Za-z0-9_-]{10,190}$/.test(token))throw new RequestError('Use the public phc_ project token, never a private API key.');
 const project=text(body.posthog_project_id,'PostHog project ID',12);if(project&&!/^[1-9]\d{0,11}$/.test(project))throw new RequestError('PostHog project ID must be a number.');
 const clarity=text(body.clarity_project_id,'Clarity project ID',30);if(clarity&&!/^[a-z0-9]{5,30}$/.test(clarity))throw new RequestError('Clarity project ID is invalid.');
 if(body.posthog_enabled&&!token)throw new RequestError('Add your public PostHog token before enabling analytics.');
 if(body.clarity_enabled&&!clarity)throw new RequestError('Add your Clarity project ID before enabling recordings.');
 return {posthog_enabled:body.posthog_enabled as boolean,posthog_token:token,posthog_region:body.posthog_region as 'eu'|'us',posthog_project_id:project,clarity_enabled:body.clarity_enabled as boolean,clarity_project_id:clarity,leads_enabled:body.leads_enabled as boolean,retention_days:Number(body.retention_days),banner_title:text(body.banner_title,'Privacy heading',120,true),banner_body:text(body.banner_body,'Privacy description',700,true),form_title:text(body.form_title,'Form heading',120,true),form_intro:text(body.form_intro,'Form introduction',500,true),form_button:text(body.form_button,'Form button',60,true),privacy_notice:text(body.privacy_notice,'Form privacy notice',700,true)};
}
export const EVENT_NAMES=new Set(['$pageview','$pageleave','$identify','product_viewed','product_filter_changed','catalog_sorted','search_used','basket_item_added','basket_item_removed','basket_quantity_changed','checkout_started','order_confirmed','contact_clicked','lead_submitted','scroll_depth']);
export function eventProperties(event:string,input:Record<string,unknown>):Record<string,string|number|boolean> {
 if(!EVENT_NAMES.has(event))return {};
 const output:Record<string,string|number|boolean>={};
 for(const key of ['product_id','kit_id','variant_id','filter','value','channel','source','lead_id']){
  const value=input[key];if(typeof value==='string'&&value.length<=120&&/^[a-zA-Z0-9_. -]+$/.test(value)&&!/[\r\n@]/.test(value))output[key]=value;
 }
 for(const key of ['quantity','price_minor','total_minor','result_count','depth']){const value=input[key];if(typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=2000000000)output[key]=value;}
 const page=publicPath(input.page);if(page)output.page=page;
 return output;
}

export function posthogPersonUrl(settings: Pick<TrackingSettings, 'posthog_project_id'|'posthog_region'>, lead: Pick<Lead, 'analytics_consent'|'posthog_id'>): string {
 const id=lead.posthog_id;
 if(!lead.analytics_consent||!id||!(UUID.test(id)||(id.startsWith('lead_')&&UUID.test(id.slice(5))))||!/^[1-9]\d{0,11}$/.test(settings.posthog_project_id))return '';
 return 'https://'+(settings.posthog_region==='eu'?'eu':'us')+'.posthog.com/project/'+settings.posthog_project_id+'/person/'+encodeURIComponent(id);
}
export function leadSearch(value: string): string {
 const search=value.trim();
 if(search.length>100||!/^[-\p{L}\p{N}\p{M} ._@+']*$/u.test(search))throw new RequestError('Use a name, email, phone or city search without filter punctuation.');
 return search;
}
