import { escapeEmailHtml, type EmailBrand } from './order-confirmation';
export type OrderEmailEvent = 'ORDER_CREATED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REJECTED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED';
export function renderOrderUpdateEmail(input: { event: Exclude<OrderEmailEvent,'ORDER_CREATED'>; orderNumber: string; customerName: string; siteUrl: string; brand: EmailBrand; trackingToken?: string; courier?: string; trackingNumber?: string }): { subject: string; html: string; text: string } {
  if (!/^SED-[A-Z0-9_-]{1,100}$/.test(input.orderNumber)) throw new Error('Invalid order reference.');
  if (!input.brand?.name) throw new Error('Email branding is required.');
  const details = {
    PAYMENT_CONFIRMED: ['Payment confirmed','Your payment has been verified. Preparation and packing will be updated separately by our team.'],
    PAYMENT_REJECTED: ['Payment needs your attention','We could not verify your payment. Please reply to this email so our team can help you check the transfer details.'],
    ORDER_SHIPPED: ['Your order is on its way','Your parcel has been handed over to ' + (input.courier || 'the courier') + '. Tracking number: ' + (input.trackingNumber || 'Contact our team for tracking details') + '.'],
    ORDER_DELIVERED: ['Your order has been delivered','Your ' + input.brand.name + ' order has been marked delivered. If there is a problem with your parcel, reply to this email and our team will help.'],
  }[input.event];
  if (!details) throw new Error('Unsupported order event.');
  const tracking = new URL('/order/' + encodeURIComponent(input.orderNumber),input.siteUrl);
  if (!['http:','https:'].includes(tracking.protocol) || tracking.username || tracking.password) throw new Error('Invalid tracking site.');
  const hasTracking = /^[a-f0-9]{64}$/i.test(input.trackingToken || '');
  if (hasTracking) tracking.searchParams.set('token',input.trackingToken!);
  const [title,copy] = details;
  const subject = title + ' · ' + input.orderNumber + ' | ' + input.brand.name;
  const text = [input.brand.name,title,'Order: '+input.orderNumber,'','Hello '+input.customerName+',',copy,'',hasTracking ? 'View your order: '+tracking.href : 'Reply to this email for help with your order.'].join('\n');
  const esc = escapeEmailHtml;
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5ef;font-family:Roboto,Arial,Helvetica,sans-serif;color:#252825"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" style="width:100%;max-width:600px;background:#fff;border:1px solid #dfe3d8;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 28px 20px;border-bottom:1px solid #e4e6dd;font-size:28px;font-weight:700;color:#203a2e">'+esc(input.brand.name)+'</td></tr><tr><td style="padding:28px"><p style="margin:0 0 16px;font-size:12px;color:#61665f">ORDER '+esc(input.orderNumber)+'</p><h1 style="margin:0;font-family:Roboto,Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;color:#203a2e">'+esc(title)+'</h1><p style="font-size:15px;line-height:24px">Hello '+esc(input.customerName)+',</p><p style="font-size:15px;line-height:24px">'+esc(copy)+'</p>'+(hasTracking ? '<p style="margin-top:26px"><a href="'+esc(tracking.href)+'" style="display:inline-block;background:#203a2e;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px">View your order</a></p>' : '')+'<p style="margin-top:28px;color:#61665f;font-size:13px;line-height:21px">Need a hand? Reply to this email to reach our team.</p></td></tr></table></td></tr></table></body></html>';
  return {subject,html,text};
}
