import { renderOrderConfirmationEmail, type OrderConfirmationEmailInput } from '../email/order-confirmation';
import { renderOrderUpdateEmail } from '../email/order-update';
import { sendTransactionalEmail } from '../email/delivery';
import { getContentDocument } from './content';
import type { SiteContent } from '../cms/storefront-types';
export interface NotificationPayload {
 type:'ORDER_CREATED'|'PAYMENT_CONFIRMED'|'PAYMENT_REJECTED'|'ORDER_SHIPPED'|'ORDER_DELIVERED';
 orderNumber:string;customerName:string;customerEmail:string;customerPhone:string;totalMinor:number;
 paymentMethod?:string;trackingCourier?:string;trackingNumber?:string;rejectionReason?:string;
 confirmation?:Omit<OrderConfirmationEmailInput,'orderNumber'|'customerName'|'totalMinor'|'paymentMethod'>;
}
export interface DispatchedLog {
 id:string;timestamp:string;channel:'WhatsApp'|'Email';recipient:string;subject:string;message:string;
 status:'PREPARED'|'ACCEPTED'|'FAILED';html?:string;providerId?:string;
}
// Diagnostic previews only. Production order delivery uses the durable database outbox.
const dispatchHistory:DispatchedLog[]=[];
export async function dispatchNotification(payload:NotificationPayload){
 const entry:DispatchedLog={id:'preview-'+Date.now(),timestamp:new Date().toISOString(),channel:'Email',recipient:payload.customerEmail,subject:'',message:'',status:'PREPARED'};
 try{
  if(!payload.confirmation)throw new Error('Explicit email configuration is required.');
  const input={...payload.confirmation,orderNumber:payload.orderNumber,customerName:payload.customerName,totalMinor:payload.totalMinor,paymentMethod:payload.paymentMethod};
  const rendered=payload.type==='ORDER_CREATED'?renderOrderConfirmationEmail(input):renderOrderUpdateEmail({...input,event:payload.type,courier:payload.trackingCourier,trackingNumber:payload.trackingNumber});
  entry.subject=rendered.subject;entry.message=rendered.text;entry.html=rendered.html;
  const result=await sendTransactionalEmail({to:payload.customerEmail,...rendered,idempotencyKey:'order-preview/'+payload.orderNumber+'/'+payload.type});
  entry.status=result.status;entry.providerId=result.providerId;
 }catch{entry.status='FAILED';}
 dispatchHistory.unshift(entry);dispatchHistory.splice(30);
}
export function getDispatchedNotifications():DispatchedLog[]{return dispatchHistory.slice(0,30);}
export interface StockAlertNotificationPayload {
 type:'STOCK_ALERT_CONFIRMATION'|'STOCK_ALERT_ADMIN_ALERT'|'STOCK_ALERT_BACK_IN_STOCK';
 email:string;sellableTitle:string;unsubscribeToken?:string;productUrl?:string;
}
export async function dispatchStockAlertNotification(payload:StockAlertNotificationPayload):Promise<boolean>{
 let site:SiteContent;
 try{site=await getContentDocument<SiteContent>('site');}catch{return false;}
 const manage=new URL('/api/stock-alerts/unsubscribe',site.config.url);
 if(payload.unsubscribeToken)manage.searchParams.set('token',payload.unsubscribeToken);
 let subject:string;let message:string;
 if(payload.type==='STOCK_ALERT_ADMIN_ALERT'){
  subject='Restock request: '+payload.sellableTitle;message='A restock request has been saved. Review subscriber demand in the dashboard.';
 }else if(payload.type==='STOCK_ALERT_BACK_IN_STOCK'){
  subject='Back in stock: '+payload.sellableTitle+' | '+site.config.name;
  message=payload.sellableTitle+' is available.\n'+new URL('/shop',site.config.url).href+'\nManage this request: '+manage.href;
 }else{
  subject='Restock request saved: '+payload.sellableTitle+' | '+site.config.name;
  message='Your restock request has been saved for '+payload.sellableTitle+'.\nManage this request: '+manage.href;
 }
 dispatchHistory.unshift({id:'preview-stock-'+Date.now(),timestamp:new Date().toISOString(),channel:'Email',recipient:payload.email,subject,message,status:'PREPARED'});
 dispatchHistory.splice(30);
 // Delivery is deliberately disabled until the owner selects a provider.
 return false;
}
