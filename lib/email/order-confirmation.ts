export interface EmailBrand { name:string; contact:{email:string;phone:string;whatsappUrl:string}; location?:string; }
export interface OrderConfirmationEmailInput {
  orderNumber: string;
  customerName: string;
  totalMinor: number;
  paymentMethod?: string;
  trackingToken?: string;
  orderedAt?: string;
  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  items?: { name: string; quantity: number; unitPriceMinor: number; imageUrl?: string }[];
  shippingAddress?: { address: string; city: string; province: string; postalCode?: string };
  siteUrl: string;
  brand: EmailBrand;
}
export function escapeEmailHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]!));
}
const money = (minor: number) => new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(minor / 100);
const price = (minor: number) => 'PKR ' + money(minor);
export function renderOrderConfirmationEmail(input: OrderConfirmationEmailInput): { subject: string; html: string; text: string } {
  if (!/^SED-[A-Z0-9_-]{1,100}$/.test(input.orderNumber)) throw new Error('Invalid order reference.');
  for (const amount of [input.totalMinor, input.subtotalMinor, input.shippingMinor, input.discountMinor].filter(value => value !== undefined)) if (!Number.isSafeInteger(amount) || amount! < 0) throw new Error('Invalid order amount.');
  if (!input.brand || !input.brand.name || !input.brand.contact) throw new Error('Email branding is required.');
  const siteConfig = input.brand;
  const base = new URL(input.siteUrl);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid site URL.');
  const tracking = new URL('/order/' + encodeURIComponent(input.orderNumber), base);
  if (input.trackingToken && /^[a-f0-9]{64}$/i.test(input.trackingToken)) tracking.searchParams.set('token', input.trackingToken);
  const cod = input.paymentMethod === 'COD';
  const method = cod ? 'Cash on delivery' : input.paymentMethod === 'wallet_aggregator' ? 'JazzCash / Easypaisa transfer' : 'Bank transfer';
  const paymentTitle = cod ? 'Pay on delivery' : 'Payment under review';
  const paymentCopy = cod ? 'Please pay the courier when your parcel arrives. No transfer is needed.' : 'Our team will verify your payment before preparation begins. Receiving this email does not mean that your payment has been approved.';
  const date = input.orderedAt && Number.isFinite(Date.parse(input.orderedAt)) ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeZone: 'Asia/Karachi' }).format(new Date(input.orderedAt)) : '';
  const items = input.items || [];
  for (const item of items) if (!Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isSafeInteger(item.unitPriceMinor) || item.unitPriceMinor < 0 || !Number.isSafeInteger(item.unitPriceMinor * item.quantity)) throw new Error('Invalid order item.');
  const image = (source?: string) => {
    if (!source) return '';
    try { const url = new URL(source, base); return url.origin === base.origin && /\.(jpe?g|png|webp|avif)$/i.test(url.pathname) ? '<img src="' + escapeEmailHtml(url.href) + '" alt="" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:8px;border:0;" />' : ''; } catch { return ''; }
  };
  const itemRows = items.map(item => '<tr><td width="68" valign="top" style="padding:16px 10px 16px 0;border-bottom:1px solid #e4e6dd;">' + image(item.imageUrl) + '</td><td valign="top" style="padding:16px 10px 16px 0;border-bottom:1px solid #e4e6dd;"><div style="font-size:14px;font-weight:600;line-height:21px;color:#252825;">' + escapeEmailHtml(item.name) + '</div><div style="margin-top:5px;font-size:12px;line-height:19px;color:#61665f;">Qty ' + item.quantity + ' · ' + price(item.unitPriceMinor) + ' each</div></td><td align="right" valign="top" style="padding:16px 0;border-bottom:1px solid #e4e6dd;white-space:nowrap;font-size:14px;font-weight:600;">' + price(item.unitPriceMinor * item.quantity) + '</td></tr>').join('');
  const row = (label: string, value: string) => '<tr><td style="padding:7px 0;color:#61665f;font-size:14px;">' + label + '</td><td align="right" style="padding:7px 0;font-size:14px;">' + value + '</td></tr>';
  const summary = (input.subtotalMinor !== undefined ? row('Subtotal', price(input.subtotalMinor)) : '') + (input.shippingMinor !== undefined ? row('Delivery', input.shippingMinor === 0 ? 'Free' : price(input.shippingMinor)) : '') + (input.discountMinor ? row('Discount', '−' + price(input.discountMinor)) : '') + '<tr><td style="padding:16px 0 0;border-top:1px solid #e4e6dd;font-size:17px;font-weight:600;">Total</td><td align="right" style="padding:16px 0 0;border-top:1px solid #e4e6dd;font-size:20px;font-weight:700;color:#203a2e;">' + price(input.totalMinor) + '</td></tr>';
  const address = input.shippingAddress;
  const addressLines = address ? [address.address, address.city + ', ' + address.province, address.postalCode].filter(Boolean) : [];
  const addressHtml = address ? '<div style="margin-top:26px;padding-top:24px;border-top:1px solid #e4e6dd;"><h2 style="margin:0 0 10px;font-size:15px;font-weight:600;">Delivery destination</h2><p style="margin:0;font-size:14px;line-height:23px;color:#61665f;">' + escapeEmailHtml(input.customerName) + '<br />' + addressLines.map(escapeEmailHtml).join('<br />') + '</p></div>' : '';
  const subject = 'Order received · ' + input.orderNumber + ' | ' + siteConfig.name;
  const text = [
    siteConfig.name, 'Order received: ' + input.orderNumber, date ? 'Order date: ' + date : '',
    '', 'Thank you, ' + input.customerName + '.', 'Your order is received. You can follow its progress using the link below.',
    '', paymentTitle, method, paymentCopy, '',
    ...items.map(item => item.name + ' · Qty ' + item.quantity + ' · ' + price(item.unitPriceMinor * item.quantity)),
    input.subtotalMinor !== undefined ? 'Subtotal: ' + price(input.subtotalMinor) : '',
    input.shippingMinor !== undefined ? 'Delivery: ' + (input.shippingMinor ? price(input.shippingMinor) : 'Free') : '',
    input.discountMinor ? 'Discount: −' + price(input.discountMinor) : '',
    'Total: ' + price(input.totalMinor), '',
    address ? 'Delivery destination:\n' + input.customerName + '\n' + addressLines.join('\n') : '',
    '', 'View your order: ' + tracking.href,
    '', 'Need a hand? Contact ' + siteConfig.contact.email + ' or WhatsApp ' + siteConfig.contact.phone,
    siteConfig.name + (siteConfig.location ? ' | ' + siteConfig.location : ''), 'This email confirms receipt of your order. Payment and fulfillment are updated separately.',
  ].filter((line, index, all) => line || (index > 0 && all[index - 1])).join('\n');
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="color-scheme" content="light" /><title>' + escapeEmailHtml(subject) + '</title><style>body{margin:0!important;padding:0!important;}@media only screen and (max-width:620px){.email-outer{padding:16px 8px!important;}.email-content{padding:26px 20px!important;}.email-header{padding:20px!important;}.email-heading{font-size:28px!important;}}a:focus-visible{outline:2px solid #203a2e;outline-offset:3px;}</style></head><body style="background:#f4f5ef;color:#252825;font-family:Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your ' + escapeEmailHtml(siteConfig.name) + ' order ' + escapeEmailHtml(input.orderNumber) + ' is received. ' + escapeEmailHtml(paymentTitle) + '.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5ef;"><tr><td class="email-outer" align="center" style="padding:40px 16px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #dfe3d8;border-radius:16px;"><tr><td class="email-header" style="padding:26px 36px;border-bottom:1px solid #e4e6dd;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:29px;font-weight:700;letter-spacing:-1px;color:#203a2e;">' + escapeEmailHtml(siteConfig.name) + '</td><td align="right" style="font-size:12px;line-height:20px;color:#61665f;">ORDER REFERENCE<br /><strong style="color:#203a2e;font-size:14px;">' + escapeEmailHtml(input.orderNumber) + '</strong></td></tr></table></td></tr><tr><td class="email-content" style="padding:34px 36px 36px;"><p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:1.6px;color:#58715c;">GOOD THINGS ARE COMING TOGETHER</p><h1 class="email-heading" style="margin:0;font-family:Georgia,Times,serif;font-size:34px;font-weight:400;line-height:1.2;color:#203a2e;">Your order is received.</h1><p style="margin:18px 0 0;font-size:15px;line-height:24px;">Thank you, ' + escapeEmailHtml(input.customerName) + '.<br />A few good ingredients for your everyday pantry.</p>' + (date ? '<p style="margin:12px 0 0;font-size:12px;color:#61665f;">Ordered on ' + escapeEmailHtml(date) + '</p>' : '') + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;background:' + (cod ? '#eef4e9' : '#fff7e6') + ';border-radius:10px;"><tr><td style="padding:18px 20px;"><h2 style="margin:0 0 6px;font-size:14px;color:#203a2e;">' + paymentTitle + '</h2><p style="margin:0;font-size:13px;line-height:21px;color:#4d564d;">' + paymentCopy + '</p></td></tr></table>' + (items.length ? '<h2 style="margin:28px 0 0;font-size:17px;font-weight:600;">Your pantry picks</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + itemRows + '</table>' : '') + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">' + summary + '</table><p style="margin:14px 0 0;font-size:12px;color:#61665f;">Payment method: ' + method + '</p>' + addressHtml + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td align="center" bgcolor="#203a2e" style="border-radius:10px;mso-padding-alt:15px 24px;"><a href="' + escapeEmailHtml(tracking.href) + '" style="display:block;padding:16px 24px;font-size:14px;font-weight:600;line-height:20px;color:#fff;text-decoration:none;">View your order</a></td></tr></table><p style="margin:14px 0 0;text-align:center;font-size:12px;line-height:20px;color:#61665f;">Payment review, preparation and delivery are updated separately.</p></td></tr><tr><td class="email-content" style="padding:24px 36px;border-top:1px solid #e4e6dd;background:#fafbf7;border-radius:0 0 16px 16px;"><p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#203a2e;">Need a hand?</p><p style="margin:0;font-size:13px;line-height:22px;color:#61665f;">Reply to this email or reach us at <a href="mailto:' + escapeEmailHtml(siteConfig.contact.email) + '" style="color:#203a2e;">' + escapeEmailHtml(siteConfig.contact.email) + '</a>.<br />WhatsApp <a href="' + escapeEmailHtml(siteConfig.contact.whatsappUrl) + '" style="color:#203a2e;">' + escapeEmailHtml(siteConfig.contact.phone) + '</a></p></td></tr></table><p style="margin:22px 0 0;font-size:11px;line-height:19px;color:#6b7368;">' + escapeEmailHtml(siteConfig.name + (siteConfig.location ? ' ? ' + siteConfig.location : '')) + '<br />A little care for your everyday pantry.</p></td></tr></table></body></html>';
  return { subject, html, text };
}
