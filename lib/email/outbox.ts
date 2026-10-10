import 'server-only';
import crypto from 'node:crypto';
import { getContentDocument } from '../services/content';
import type { SiteContent } from '../cms/storefront-types';
import { createAdminClient } from '../supabase/admin';
import { createTrackingToken } from '../checkout-security';
import { getEmailDeliveryConfiguration, sendTransactionalEmail, type TransactionalEmail } from './delivery';
import { renderOrderConfirmationEmail } from './order-confirmation';
import { renderOrderUpdateEmail, type OrderEmailEvent } from './order-update';

interface EmailJob { id: string; claim_token: string; order_id: string; event_type: OrderEmailEvent; payload: Record<string,any>; message: TransactionalEmail | null; first_attempt_at: string | null; attempts: number }
class PreparationError extends Error { constructor(public code: string, public retryable = false) { super(code); } }
export async function processOrderEmails() {
  const configuration = getEmailDeliveryConfiguration();
  const summary = { configured: !!configuration, claimed: 0, accepted: 0, retry: 0, failed: 0, unknown: 0, deferred: 0 };
  if (!configuration || !process.env.SUPABASE_SECRET_KEY) return { ...summary, configured: false };
  const client = createAdminClient();
  const rpc = async (name: string, args: Record<string,unknown>) => {
    const { data, error } = await (client.rpc as any)(name,args);
    if (error) throw new Error('Email queue database operation unavailable.');
    return data;
  };
  const jobs: EmailJob[] = await rpc('claim_order_emails',{p_limit:3});
  if (!Array.isArray(jobs)) throw new Error('Invalid email queue response.');
  summary.claimed = jobs.length;
  const finish = (job: EmailJob, status: string, code?: string, providerId?: string) => rpc('finish_order_email',{p_id:job.id,p_claim_token:job.claim_token,p_status:status,p_error_code:code || null,p_provider_id:providerId || null});
  for (const job of jobs) {
    try {
      if (job.first_attempt_at && Date.now()-Date.parse(job.first_attempt_at) >= 23*60*60*1000) {
        if (await finish(job,'UNKNOWN','IDEMPOTENCY_WINDOW_EXPIRED')) summary.unknown++; else summary.deferred++;
        continue;
      }
      if (!job.message) {
        const {data: order,error: orderError} = await (client.from('orders') as any).select('idempotency_key,request_fingerprint,tracking_token_hash').eq('id',job.order_id).single();
        if (orderError || !order) throw new PreparationError('ORDER_READ_UNAVAILABLE',true);
        let trackingToken: string | undefined;
        if (order.idempotency_key && /^[a-f0-9]{64}$/.test(order.request_fingerprint || '')) {
          const candidate = createTrackingToken(order.idempotency_key,order.request_fingerprint);
          const candidateHash = crypto.createHash('sha256').update(candidate).digest('hex');
          if (candidateHash === order.tracking_token_hash) trackingToken = candidate;
        }
        let site: SiteContent;
        try { site = await getContentDocument<SiteContent>('site'); } catch { throw new PreparationError('CONTENT_READ_UNAVAILABLE',true); }
        const brand = {name:site.config.name,contact:site.config.contact,location:site.footer.copyrightLocation};
        const p = job.payload;
        let rendered: {subject:string;html:string;text:string};
        if (job.event_type === 'ORDER_CREATED') {
          if (!trackingToken) throw new PreparationError('TRACKING_CAPABILITY_UNAVAILABLE');
          const {data: items,error: itemError} = await (client.from('order_items') as any).select('name_snapshot,quantity,unit_price_minor,image_url').eq('order_id',job.order_id).order('id');
          if (itemError || !items?.length) throw new PreparationError('ORDER_ITEMS_UNAVAILABLE',true);
          rendered = renderOrderConfirmationEmail({orderNumber:p.order_number,customerName:p.customer_name,totalMinor:p.total_minor,paymentMethod:p.payment_method,trackingToken,siteUrl:configuration.siteUrl,brand,orderedAt:p.created_at,subtotalMinor:p.subtotal_minor,shippingMinor:p.shipping_minor,discountMinor:p.discount_minor || 0,shippingAddress:{address:p.shipping_address,city:p.shipping_city,province:p.shipping_province,postalCode:p.shipping_postal_code},items:items.map((item:any)=>({name:item.name_snapshot,quantity:item.quantity,unitPriceMinor:item.unit_price_minor,imageUrl:item.image_url}))});
        } else {
          rendered = renderOrderUpdateEmail({event:job.event_type,orderNumber:p.order_number,customerName:p.customer_name,trackingToken,siteUrl:configuration.siteUrl,brand,courier:p.tracking_courier || p.courier_name,trackingNumber:p.tracking_number});
        }
        const frozen = await rpc('prepare_order_email',{p_id:job.id,p_claim_token:job.claim_token,p_message:{...rendered,to:p.customer_email,from:configuration.from,replyTo:configuration.replyTo,idempotencyKey:'seedly-email/'+job.id}});
        if (!frozen) { summary.deferred++; continue; }
        job.message = frozen.message;
        job.first_attempt_at = frozen.first_attempt_at;
      }
      const delivery = await sendTransactionalEmail(job.message!);
      let status = delivery.status === 'ACCEPTED' ? 'ACCEPTED' : delivery.retryable || delivery.status === 'PREPARED' ? 'RETRY' : 'FAILED';
      if (status === 'RETRY' && (job.attempts >= 20 || (job.first_attempt_at && Date.now()-Date.parse(job.first_attempt_at) >= 23*60*60*1000))) status = 'UNKNOWN';
      if (!await finish(job,status,delivery.errorCode,delivery.providerId)) { summary.deferred++; continue; }
      if (status === 'ACCEPTED') summary.accepted++; else if (status === 'RETRY') summary.retry++; else if (status === 'UNKNOWN') summary.unknown++; else summary.failed++;
    } catch (error) {
      let status = error instanceof PreparationError && !error.retryable ? 'FAILED' : 'RETRY';
      if (status === 'RETRY' && (job.attempts >= 20 || (job.first_attempt_at && Date.now()-Date.parse(job.first_attempt_at) >= 23*60*60*1000))) status = 'UNKNOWN';
      const code = error instanceof PreparationError ? error.code : 'PROCESSING_UNAVAILABLE';
      try { if (await finish(job,status,code)) { if(status==='FAILED') summary.failed++; else if(status==='UNKNOWN') summary.unknown++; else summary.retry++; } else summary.deferred++; }
      catch { summary.deferred++; /* Lease recovery retries the same persisted message/key. */ }
    }
  }
  return summary;
}
