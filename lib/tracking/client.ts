'use client';
import type { CaptureResult, PostHog } from 'posthog-js';
import type { JourneyContext, TrackingSettings } from './types';
import { cleanJourney, EVENT_NAMES, eventProperties, publicPath, replayPage, UUID } from './validation';
export const CONSENT_KEY='seedly_privacy_choices_v1';
export interface Consent {version:1;analytics:boolean;recordings:boolean;scope:string;at:number;}
export function consentScope(config:TrackingSettings){return [config.posthog_enabled?config.posthog_region+':'+config.posthog_token:'',config.clarity_enabled?config.clarity_project_id:''].join('|');}
export function readConsent(storage:Pick<Storage,'getItem'>,scope:string):Consent|null {try{const value=JSON.parse(storage.getItem(CONSENT_KEY)||'null');return value?.version===1&&value.scope===scope&&typeof value.analytics==='boolean'&&typeof value.recordings==='boolean'&&Number.isFinite(value.at)&&value.at<=Date.now()&&Date.now()-value.at<180*86400000?value:null;}catch{return null;}}
export function privacySignal(){return typeof navigator!=='undefined'&&(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true);}
type ClarityFunction=((...args:unknown[])=>void)&{q?:unknown[][]};
declare global {interface Window {clarity?:ClarityFunction;}}
let instance:PostHog|null=null;let generation=0;let ready=false;let allowed=false;let clarityActive=false;let clarityLoaded=false;let recordingPermit=false;let configKey='';let currentConfig:TrackingSettings|null=null;
let attribution:JourneyContext={analytics_consent:false};let lastPage='';
const SDK_KEYS=new Set(['distinct_id','$user_id','$anon_distinct_id','$device_id','$is_identified','$session_id','$window_id','$lib','$lib_version','$browser','$browser_version','$os','$os_version','$device_type','$screen_height','$screen_width','$viewport_height','$viewport_width','$insert_id','$pageview_id']);
export function sanitizePosthogEvent(event:CaptureResult|null){
 if(!event||!allowed||!EVENT_NAMES.has(event.event))return null;
 const path=publicPath(location.pathname);if(!path)return null;
 const properties:Record<string,unknown>=eventProperties(event.event,event.properties);
 for(const key of SDK_KEYS){const value=event.properties[key];if(typeof value==='string'&&value.length<=150&&!value.includes('@')||typeof value==='number'||typeof value==='boolean')properties[key]=value;}
 properties.$current_url=location.origin+path;properties.$pathname=path;properties.$referrer=attribution.referrer||'';
 properties.$set={};properties.$set_once={};
 for(const key of ['utm_source','utm_medium','utm_campaign'])if(attribution[key as keyof JourneyContext])properties[key]=attribution[key as keyof JourneyContext];
 return {...event,properties};
}
export function trackEvent(event:string,properties:Record<string,unknown>={}){
 if(typeof window==='undefined'||!allowed||!ready||!instance||!EVENT_NAMES.has(event)||!publicPath(location.pathname))return;
 try{instance.capture(event,eventProperties(event,{...properties,page:location.pathname}));}catch{/* Analytics never interrupts the shop. */}
}
export function journeyContext():JourneyContext{
 if(!allowed||privacySignal())return {analytics_consent:false};
 return cleanJourney({...attribution,analytics_consent:true,page:location.pathname,posthog_id:ready?instance?.get_distinct_id():undefined});
}
export function identifyLead(id:unknown,source:string){
 if(typeof id!=='string'||!UUID.test(id))return;
 const identity='lead_'+id;
 if(allowed&&ready&&instance){try{const current=instance.get_distinct_id();if(!current.startsWith('lead_'))instance.identify(identity);trackEvent('lead_submitted',{lead_id:id,source});}catch{}}
 if(clarityActive)window.clarity?.('identify',identity);
}
export function stopTracking(){
 generation++;allowed=false;ready=false;lastPage='';attribution={analytics_consent:false};
 try{instance?.opt_out_capturing();instance?.reset();}catch{}
 if(clarityLoaded){window.clarity?.('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});window.clarity?.('stop');}
 clarityActive=false;recordingPermit=false;
}
export function recordingsLoaded(){return clarityLoaded;}
export function trackingLoaded(){return !!instance||clarityLoaded;}
export function safeReplayLocation(){
 if(!replayPage(location.pathname)||location.search||location.hash)return false;
 if(!document.referrer)return true;
 try{const referrer=new URL(document.referrer);return !referrer.search&&!referrer.hash&&(referrer.origin!==location.origin||replayPage(referrer.pathname));}catch{return false;}
}
export function installReplayNavigationGuard(){
 const originals={pushState:history.pushState,replaceState:history.replaceState};
 const wraps={} as {pushState:History['pushState'];replaceState:History['replaceState']};
 for(const name of ['pushState','replaceState'] as const){const wrapped:History['pushState']=function(data,unused,url){if(clarityActive&&url){try{const destination=new URL(String(url),location.href);if(!replayPage(destination.pathname)||destination.search||destination.hash){window.clarity?.('stop');clarityActive=false;}}catch{window.clarity?.('stop');clarityActive=false;}}return originals[name].call(history,data,unused,url);};wraps[name]=wrapped;history[name]=wrapped;}
 const click=(event:MouseEvent)=>{const link=event.target instanceof Element?event.target.closest('a[href]'):null;if(!clarityActive||!link)return;try{const destination=new URL(link.getAttribute('href')||'',location.href);if(destination.origin===location.origin&&(!replayPage(destination.pathname)||destination.search||destination.hash)){window.clarity?.('stop');clarityActive=false;}}catch{}};
 document.addEventListener('click',click,true);
 return()=>{document.removeEventListener('click',click,true);for(const name of ['pushState','replaceState'] as const)if(history[name]===wraps[name])history[name]=originals[name];};
}
export function protectSensitivePage(path:string){if(clarityActive&&(!replayPage(path)||!safeReplayLocation())){window.clarity?.('stop');clarityActive=false;}}
export async function startTracking(config:TrackingSettings,consent:Consent){
 const sequence=++generation;currentConfig=config;
 const permit=!privacySignal()&&consent.analytics&&consent.scope===consentScope(config);
 allowed=permit&&config.posthog_enabled;
 if(permit&&attribution.analytics_consent!==true){const q=new URLSearchParams(location.search);attribution=cleanJourney({analytics_consent:true,landing_page:location.pathname,page:location.pathname,referrer:document.referrer,utm_source:q.get('utm_source'),utm_medium:q.get('utm_medium'),utm_campaign:q.get('utm_campaign')});}
 if(allowed){try{
  const {default:posthog}=await import('posthog-js');
  if(sequence!==generation||!allowed)return;
  const key=config.posthog_region+':'+config.posthog_token;
  if(!instance||configKey!==key){instance?.opt_out_capturing();instance=posthog;configKey=key;
   instance.init(config.posthog_token,{api_host:config.posthog_region==='eu'?'https://eu.i.posthog.com':'https://us.i.posthog.com',ui_host:config.posthog_region==='eu'?'https://eu.posthog.com':'https://us.posthog.com',autocapture:false,capture_pageview:false,capture_pageleave:false,capture_dead_clicks:false,capture_performance:false,capture_exceptions:false,disable_session_recording:true,disable_surveys:true,disable_web_experiments:true,advanced_disable_flags:true,person_profiles:'identified_only',opt_out_capturing_by_default:true,persistence:'localStorage',respect_dnt:true,mask_all_text:true,mask_all_element_attributes:true,property_blacklist:['$initial_current_url','$initial_referrer','$initial_referring_domain','$initial_utm_source','$initial_utm_medium','$initial_utm_campaign','$title'],before_send:event=>sanitizePosthogEvent(event)});
  }
  if(sequence!==generation||!allowed)return;
  instance.opt_in_capturing({captureEventName:false});ready=true;capturePage();
 }catch{ready=false;}}
 else{ready=false;instance?.opt_out_capturing();}
 if(sequence!==generation)return;
 recordingPermit=!privacySignal()&&consent.recordings&&config.clarity_enabled;
 const record=recordingPermit&&safeReplayLocation();
 if(record){
  document.body.setAttribute('data-clarity-mask','true');
  if(!clarityLoaded){const queue:ClarityFunction=(...args)=>{queue.q=queue.q||[];queue.q.push(args);};window.clarity=queue;
   window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
   const script=document.createElement('script');script.id='seedly-clarity';script.async=true;script.src='https://www.clarity.ms/tag/'+config.clarity_project_id;
   script.onload=()=>{if(!recordingPermit||!currentConfig?.clarity_enabled||!safeReplayLocation()){window.clarity?.('stop');clarityActive=false;return;}protectSensitivePage(location.pathname);};
   script.onerror=()=>{clarityActive=false;};clarityLoaded=true;clarityActive=true;document.head.appendChild(script);
  }else if(!clarityActive){window.clarity?.('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});window.clarity?.('start');clarityActive=true;}
 }else if(clarityActive){window.clarity?.('stop');clarityActive=false;}
}
export function capturePage(){
 const path=publicPath(location.pathname);protectSensitivePage(location.pathname);
 if(!path||!allowed||!ready||path===lastPage)return;
 lastPage=path;trackEvent('$pageview');
 const match=path.match(/^\/(seeds|teas|kits)\/([a-z0-9-]+)$/);if(match)trackEvent('product_viewed',{value:match[2]});
 if(path==='/checkout')trackEvent('checkout_started');
}
