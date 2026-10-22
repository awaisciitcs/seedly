import {NextResponse} from 'next/server';
import {requireAdmin, AdminAuthError} from '@/lib/auth/require-admin';
import {getCustomerStoreSettings} from '@/lib/services/settings';
import {getContentDocument} from '@/lib/services/content';
import {createAdminClient} from '@/lib/supabase/admin';
import {getEmailDeliveryConfiguration} from '@/lib/email/delivery';
import type {SiteContent} from '@/lib/cms/storefront-types';
import nextPackage from 'next/package.json';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store, max-age=0'};
/** Read-only owner diagnostics. Never processes jobs, sends mail, or returns credentials. */
export async function GET(){
 try{
  await requireAdmin('OWNER');
  const [settings,site,receipts]=await Promise.all([
   getCustomerStoreSettings(),getContentDocument<SiteContent>('site'),createAdminClient().storage.getBucket('payment-receipts'),
  ]);
  if(receipts.error||!receipts.data)throw new Error('Storage check unavailable');
  const email=getEmailDeliveryConfiguration();
  const workerSecret=process.env.CRON_SECRET||process.env.EMAIL_CRON_SECRET||'';
  const providerConfigured=Boolean(email);
  const workerConfigured=workerSecret.length>=32;
  const emailOriginMatchesStore=Boolean(email&&new URL(email.siteUrl).origin===new URL(site.config.url).origin);
  const privateReceipts=receipts.data.public===false;
  return NextResponse.json({data:{
   checked_at:new Date().toISOString(),revision:process.env.VERCEL_GIT_COMMIT_SHA||null,
   runtime:{next:nextPackage.version,node:process.versions.node},
   checkout:{available:settings.ordering_available,payment_methods:settings.enabled_payment_methods},
   storage:{payment_receipts_private:privateReceipts},
   email:{provider_configured:providerConfigured,worker_authorization_configured:workerConfigured,site_origin_matches_store:emailOriginMatchesStore,configuration_complete:providerConfigured&&workerConfigured&&emailOriginMatchesStore,delivery_verified:false},
   scope:'Read-only configuration diagnostics; inbox delivery, external scheduling and restoration require separate acceptance.',
  }},{status:privateReceipts?200:503,headers});
 }catch(error){
  const known=error instanceof AdminAuthError;
  return NextResponse.json({error:{message:known?error.message:'Operational diagnostics are temporarily unavailable.'}},{status:known?error.status:503,headers});
 }
}
